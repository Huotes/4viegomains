package middleware

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"time"

	"github.com/redis/go-redis/v9"
)

// RateLimitMiddleware applies per-IP rate limiting using Redis
func RateLimitMiddleware(redisClient *redis.Client, requestsPerSecond int) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Extract client IP
			clientIP := getClientIP(r)

			// Check rate limit
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()

			key := fmt.Sprintf("ratelimit:%s", clientIP)
			count, err := redisClient.Incr(ctx, key).Result()
			if err != nil {
				// Log error but don't fail the request
				next.ServeHTTP(w, r)
				return
			}

			// Set TTL on first request
			if count == 1 {
				redisClient.Expire(ctx, key, 1*time.Second)
			}

			// Check if limit exceeded
			if count > int64(requestsPerSecond) {
				w.Header().Set("Content-Type", "application/json")
				w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", requestsPerSecond))
				w.Header().Set("X-RateLimit-Remaining", "0")
				w.Header().Set("X-RateLimit-Reset", fmt.Sprintf("%d", time.Now().Add(1*time.Second).Unix()))
				w.WriteHeader(http.StatusTooManyRequests)
				w.Write([]byte(`{"error": "Rate limit exceeded"}`))
				return
			}

			// Set rate limit headers
			w.Header().Set("X-RateLimit-Limit", fmt.Sprintf("%d", requestsPerSecond))
			w.Header().Set("X-RateLimit-Remaining", fmt.Sprintf("%d", requestsPerSecond-int(count)))

			next.ServeHTTP(w, r)
		})
	}
}

// getClientIP extracts the client IP from the request
func getClientIP(r *http.Request) string {
	// Check X-Forwarded-For header first (for reverse proxies)
	if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
		// Get the first IP in the list
		if ip, _, err := net.SplitHostPort(forwarded); err == nil {
			return ip
		}
		return forwarded
	}

	// Check X-Real-IP header
	if realIP := r.Header.Get("X-Real-IP"); realIP != "" {
		return realIP
	}

	// Use RemoteAddr as fallback
	if ip, _, err := net.SplitHostPort(r.RemoteAddr); err == nil {
		return ip
	}

	return r.RemoteAddr
}
