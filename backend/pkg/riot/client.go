package riot

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"net/http"
	"time"
)

// Client is the HTTP client for Riot API
type Client struct {
	httpClient  *http.Client
	apiKey      string
	rateLimiter *RateLimiter
	baseURL     string
}

// NewClient creates a new Riot API client
func NewClient(apiKey string) *Client {
	return &Client{
		httpClient:  &http.Client{Timeout: 30 * time.Second},
		apiKey:      apiKey,
		rateLimiter: NewRateLimiter(),
		baseURL:     "https://%s.api.riotgames.com",
	}
}

// do performs an HTTP request with retry logic and rate limiting
func (c *Client) do(ctx context.Context, platform string, path string) (*http.Response, error) {
	if platform == "" {
		return nil, fmt.Errorf("platform ID is required")
	}

	// Determine regional cluster
	cluster, ok := PlatformToCluster[platform]
	if !ok {
		return nil, fmt.Errorf("unknown platform: %s", platform)
	}

	// Use cluster domain for regional endpoints
	url := fmt.Sprintf("https://%s.api.riotgames.com%s", cluster, path)

	// Apply rate limiting
	methodName := extractMethodName(path)
	c.rateLimiter.Wait(methodName)

	// Retry logic with exponential backoff
	var resp *http.Response
	var err error
	maxRetries := 3

	for attempt := 0; attempt <= maxRetries; attempt++ {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
		if err != nil {
			return nil, fmt.Errorf("failed to create request: %w", err)
		}

		req.Header.Set("X-Riot-Token", c.apiKey)
		req.Header.Set("User-Agent", "4ViegoMains/1.0")

		resp, err = c.httpClient.Do(req)
		if err != nil {
			return nil, fmt.Errorf("request failed: %w", err)
		}

		// Check for rate limiting
		if resp.StatusCode == http.StatusTooManyRequests {
			resp.Body.Close()
			if attempt < maxRetries {
				c.rateLimiter.UpdateFromHeaders(resp, methodName)
				// Exponential backoff with jitter
				backoff := time.Duration(1<<uint(attempt)) * time.Second
				jitter := time.Duration(rand.Int63n(int64(backoff)))
				time.Sleep(backoff + jitter)
				continue
			}
		}

		// Update rate limiter from response headers
		c.rateLimiter.UpdateFromHeaders(resp, methodName)

		// Check for other errors
		if resp.StatusCode >= 400 {
			body, _ := io.ReadAll(resp.Body)
			resp.Body.Close()
			return nil, fmt.Errorf("API error %d: %s", resp.StatusCode, string(body))
		}

		return resp, nil
	}

	if resp != nil {
		resp.Body.Close()
	}
	return nil, fmt.Errorf("max retries exceeded")
}

// GetAccountByRiotID retrieves an account by Riot ID (gameName#tagLine)
func (c *Client) GetAccountByRiotID(ctx context.Context, platform, gameName, tagLine string) (*AccountDTO, error) {
	path := fmt.Sprintf(AccountByRiotIDEndpoint, gameName, tagLine)
	resp, err := c.do(ctx, platform, path)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var account AccountDTO
	if err := json.NewDecoder(resp.Body).Decode(&account); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &account, nil
}

// GetSummonerByPUUID retrieves a summoner by PUUID
func (c *Client) GetSummonerByPUUID(ctx context.Context, platform, puuid string) (*SummonerDTO, error) {
	path := fmt.Sprintf(SummonerByPUUIDEndpoint, puuid)
	resp, err := c.do(ctx, platform, path)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var summoner SummonerDTO
	if err := json.NewDecoder(resp.Body).Decode(&summoner); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &summoner, nil
}

// GetMatchList retrieves a list of match IDs for a player
func (c *Client) GetMatchList(ctx context.Context, platform, puuid string, start, count int) ([]string, error) {
	path := fmt.Sprintf(MatchListEndpoint, puuid)
	if start > 0 || count > 0 {
		path += "?"
		if start > 0 {
			path += fmt.Sprintf("start=%d", start)
		}
		if count > 0 {
			if start > 0 {
				path += "&"
			}
			path += fmt.Sprintf("count=%d", count)
		}
	}

	resp, err := c.do(ctx, platform, path)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var matches []string
	if err := json.NewDecoder(resp.Body).Decode(&matches); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return matches, nil
}

// GetMatchDetail retrieves detailed information about a match
func (c *Client) GetMatchDetail(ctx context.Context, platform, matchID string) (*MatchDTO, error) {
	path := fmt.Sprintf(MatchDetailEndpoint, matchID)
	resp, err := c.do(ctx, platform, path)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var match MatchDTO
	if err := json.NewDecoder(resp.Body).Decode(&match); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &match, nil
}

// GetMatchTimeline retrieves the timeline for a match
func (c *Client) GetMatchTimeline(ctx context.Context, platform, matchID string) (*MatchTimelineDTO, error) {
	path := fmt.Sprintf(MatchTimelineEndpoint, matchID)
	resp, err := c.do(ctx, platform, path)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var timeline MatchTimelineDTO
	if err := json.NewDecoder(resp.Body).Decode(&timeline); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &timeline, nil
}

// GetChampionMastery retrieves all champion masteries for a player
func (c *Client) GetChampionMastery(ctx context.Context, platform, summonerID string) ([]ChampionMasteryDTO, error) {
	path := fmt.Sprintf(ChampionMasteryEndpoint, summonerID)
	resp, err := c.do(ctx, platform, path)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var masteries []ChampionMasteryDTO
	if err := json.NewDecoder(resp.Body).Decode(&masteries); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return masteries, nil
}

// GetChampionMasteryByChampion retrieves mastery for a specific champion
func (c *Client) GetChampionMasteryByChampion(ctx context.Context, platform, summonerID string, championID int) (*ChampionMasteryDTO, error) {
	path := fmt.Sprintf(ChampionMasteryByChampionEndpoint, summonerID, championID)
	resp, err := c.do(ctx, platform, path)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var mastery ChampionMasteryDTO
	if err := json.NewDecoder(resp.Body).Decode(&mastery); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &mastery, nil
}

// GetChampionMasteryScore retrieves the total mastery score for a player
func (c *Client) GetChampionMasteryScore(ctx context.Context, platform, summonerID string) (int, error) {
	path := fmt.Sprintf(ChampionMasteryScoreEndpoint, summonerID)
	resp, err := c.do(ctx, platform, path)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	var score int
	if err := json.NewDecoder(resp.Body).Decode(&score); err != nil {
		return 0, fmt.Errorf("failed to decode response: %w", err)
	}

	return score, nil
}

// GetLeagueEntries retrieves league entries for a player
func (c *Client) GetLeagueEntries(ctx context.Context, platform, summonerID string) ([]LeagueEntryDTO, error) {
	path := fmt.Sprintf(LeagueEntriesSummonerEndpoint, summonerID)
	resp, err := c.do(ctx, platform, path)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var entries []LeagueEntryDTO
	if err := json.NewDecoder(resp.Body).Decode(&entries); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return entries, nil
}

// GetChallengerLeague retrieves the challenger league
func (c *Client) GetChallengerLeague(ctx context.Context, platform string) (*LeagueListDTO, error) {
	path := ChallengerLeagueEndpoint
	resp, err := c.do(ctx, platform, path)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var league LeagueListDTO
	if err := json.NewDecoder(resp.Body).Decode(&league); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &league, nil
}

// GetGrandmasterLeague retrieves the grandmaster league
func (c *Client) GetGrandmasterLeague(ctx context.Context, platform string) (*LeagueListDTO, error) {
	path := GrandmasterLeagueEndpoint
	resp, err := c.do(ctx, platform, path)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var league LeagueListDTO
	if err := json.NewDecoder(resp.Body).Decode(&league); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &league, nil
}

// GetMasterLeague retrieves the master league
func (c *Client) GetMasterLeague(ctx context.Context, platform string) (*LeagueListDTO, error) {
	path := MasterLeagueEndpoint
	resp, err := c.do(ctx, platform, path)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var league LeagueListDTO
	if err := json.NewDecoder(resp.Body).Decode(&league); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &league, nil
}

// extractMethodName extracts a method name from an API path for rate limiting
func extractMethodName(path string) string {
	// Simple extraction: use the first meaningful part of the path
	if len(path) > 1 {
		return path[1:] // Skip leading slash
	}
	return "unknown"
}

// GetLatestDDragonVersion fetches the latest Data Dragon version
func (c *Client) GetLatestDDragonVersion(ctx context.Context) (string, error) {
	ddClient := NewDataDragonClient()
	return ddClient.GetLatestVersion(ctx)
}
