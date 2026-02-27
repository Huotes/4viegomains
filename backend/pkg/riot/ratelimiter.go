package riot

import (
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"
)

// RateLimitBucket represents a token bucket for rate limiting
type RateLimitBucket struct {
	tokens    float64
	maxTokens float64
	refillRate float64
	lastRefill time.Time
	mu        sync.Mutex
}

// NewRateLimitBucket creates a new rate limit bucket
func NewRateLimitBucket(maxTokens float64, refillRate float64) *RateLimitBucket {
	return &RateLimitBucket{
		tokens:     maxTokens,
		maxTokens:  maxTokens,
		refillRate: refillRate,
		lastRefill: time.Now(),
	}
}

// refill adds tokens based on elapsed time
func (b *RateLimitBucket) refill() {
	now := time.Now()
	elapsed := now.Sub(b.lastRefill).Seconds()
	tokensToAdd := elapsed * b.refillRate
	b.tokens = min(b.tokens+tokensToAdd, b.maxTokens)
	b.lastRefill = now
}

// Wait blocks until a token is available, then consumes it
func (b *RateLimitBucket) Wait(count float64) {
	b.mu.Lock()
	defer b.mu.Unlock()

	for b.tokens < count {
		b.refill()
		if b.tokens < count {
			// Calculate wait time
			tokensNeeded := count - b.tokens
			waitTime := time.Duration((tokensNeeded / b.refillRate) * 1e9)
			b.mu.Unlock()
			time.Sleep(waitTime)
			b.mu.Lock()
			b.refill()
		}
	}

	b.tokens -= count
}

// Acquire tries to consume tokens without waiting
func (b *RateLimitBucket) Acquire(count float64) bool {
	b.mu.Lock()
	defer b.mu.Unlock()

	b.refill()
	if b.tokens >= count {
		b.tokens -= count
		return true
	}
	return false
}

// UpdateLimits updates the bucket limits from rate limit headers
func (b *RateLimitBucket) UpdateLimits(maxTokens float64, refillRate float64) {
	b.mu.Lock()
	defer b.mu.Unlock()

	b.maxTokens = maxTokens
	b.refillRate = refillRate
	if b.tokens > maxTokens {
		b.tokens = maxTokens
	}
}

// RateLimiter manages both app-level and method-level rate limits
type RateLimiter struct {
	appBucket    *RateLimitBucket
	methodBuckets map[string]*RateLimitBucket
	mu            sync.RWMutex
}

// NewRateLimiter creates a new rate limiter
// Default: 20 requests per second for app level, 100 per second for method level
func NewRateLimiter() *RateLimiter {
	return &RateLimiter{
		appBucket:     NewRateLimitBucket(20, 20),
		methodBuckets: make(map[string]*RateLimitBucket),
	}
}

// getMethodBucket gets or creates a method-specific bucket
func (rl *RateLimiter) getMethodBucket(method string) *RateLimitBucket {
	rl.mu.RLock()
	bucket, exists := rl.methodBuckets[method]
	rl.mu.RUnlock()

	if exists {
		return bucket
	}

	rl.mu.Lock()
	defer rl.mu.Unlock()

	// Double-check after acquiring lock
	if bucket, exists := rl.methodBuckets[method]; exists {
		return bucket
	}

	bucket = NewRateLimitBucket(100, 100)
	rl.methodBuckets[method] = bucket
	return bucket
}

// Wait waits for both app and method rate limits
func (rl *RateLimiter) Wait(method string) {
	rl.appBucket.Wait(1)
	methodBucket := rl.getMethodBucket(method)
	methodBucket.Wait(1)
}

// UpdateFromHeaders updates rate limits from response headers
func (rl *RateLimiter) UpdateFromHeaders(resp *http.Response, method string) error {
	// Parse app-level rate limit (X-App-Rate-Limit and X-App-Rate-Limit-Count)
	if appLimit := resp.Header.Get("X-App-Rate-Limit"); appLimit != "" {
		if appCount := resp.Header.Get("X-App-Rate-Limit-Count"); appCount != "" {
			if limits, counts := parseRateLimit(appLimit), parseRateLimit(appCount); limits != nil && counts != nil {
				if len(limits) > 0 && len(counts) > 0 {
					maxRequests := float64(limits[0])
					secondsWindow := float64(limits[1])
					if secondsWindow > 0 {
						refillRate := maxRequests / secondsWindow
						rl.appBucket.UpdateLimits(maxRequests, refillRate)
					}
				}
			}
		}
	}

	// Parse method-level rate limit (X-Method-Rate-Limit and X-Method-Rate-Limit-Count)
	if methodLimit := resp.Header.Get("X-Method-Rate-Limit"); methodLimit != "" {
		if methodCount := resp.Header.Get("X-Method-Rate-Limit-Count"); methodCount != "" {
			if limits, counts := parseRateLimit(methodLimit), parseRateLimit(methodCount); limits != nil && counts != nil {
				if len(limits) > 0 && len(counts) > 0 {
					maxRequests := float64(limits[0])
					secondsWindow := float64(limits[1])
					if secondsWindow > 0 {
						refillRate := maxRequests / secondsWindow
						methodBucket := rl.getMethodBucket(method)
						methodBucket.UpdateLimits(maxRequests, refillRate)
					}
				}
			}
		}
	}

	// Handle Retry-After header
	if retryAfter := resp.Header.Get("Retry-After"); retryAfter != "" {
		if seconds, err := strconv.Atoi(retryAfter); err == nil {
			time.Sleep(time.Duration(seconds) * time.Second)
		}
	}

	return nil
}

// parseRateLimit parses rate limit header (e.g., "20:1" or "100:120")
func parseRateLimit(header string) []int {
	parts := strings.Split(header, ":")
	if len(parts) != 2 {
		return nil
	}

	var result []int
	for _, part := range parts {
		val, err := strconv.Atoi(strings.TrimSpace(part))
		if err != nil {
			return nil
		}
		result = append(result, val)
	}

	return result
}

func min(a, b float64) float64 {
	if a < b {
		return a
	}
	return b
}
