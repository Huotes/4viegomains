package nats

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"time"

	nats "github.com/nats-io/nats.go"
)

// Subjects for NATS pub/sub
const (
	MatchCollected      = "matches.collected"
	BuildsRecalculated  = "builds.recalculated"
	LeaderboardUpdated  = "leaderboard.updated"
	PatchChanged        = "patch.changed"
	CacheInvalidatePrefix = "cache.invalidate."
)

// Client wraps the NATS connection
type Client struct {
	conn *nats.Conn
}

// NewClient creates a new NATS client
func NewClient(url string) (*Client, error) {
	nc, err := nats.Connect(url)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to NATS: %w", err)
	}

	return &Client{conn: nc}, nil
}

// Close closes the NATS connection
func (c *Client) Close() {
	if c.conn != nil {
		c.conn.Close()
	}
}

// Publish publishes a message to a subject
func (c *Client) Publish(subject string, data interface{}) error {
	payload, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal data: %w", err)
	}

	return c.conn.Publish(subject, payload)
}

// PublishMatchCollected publishes a match collection event
func (c *Client) PublishMatchCollected(matchID string, puuid string, platform string) error {
	data := map[string]interface{}{
		"match_id":  matchID,
		"puuid":     puuid,
		"platform":  platform,
	}
	return c.Publish(MatchCollected, data)
}

// PublishBuildsRecalculated publishes a builds recalculation event
func (c *Client) PublishBuildsRecalculated(championID int, role string) error {
	data := map[string]interface{}{
		"champion_id": championID,
		"role":        role,
	}
	return c.Publish(BuildsRecalculated, data)
}

// PublishLeaderboardUpdated publishes a leaderboard update event
func (c *Client) PublishLeaderboardUpdated(region string) error {
	data := map[string]interface{}{
		"region": region,
	}
	return c.Publish(LeaderboardUpdated, data)
}

// PublishPatchChanged publishes a patch change event
func (c *Client) PublishPatchChanged(patchVersion string, changesSummary string) error {
	data := map[string]interface{}{
		"patch_version":   patchVersion,
		"changes_summary": changesSummary,
	}
	return c.Publish(PatchChanged, data)
}

// PublishCacheInvalidate publishes a cache invalidation event
func (c *Client) PublishCacheInvalidate(cacheKey string) error {
	subject := CacheInvalidatePrefix + cacheKey
	return c.Publish(subject, map[string]string{"key": cacheKey})
}

// Subscribe subscribes to a subject with a callback
func (c *Client) Subscribe(subject string, callback func(msg *nats.Msg)) (*nats.Subscription, error) {
	return c.conn.Subscribe(subject, callback)
}

// SubscribeMatchCollected subscribes to match collection events
func (c *Client) SubscribeMatchCollected(logger *slog.Logger, callback func(matchID, puuid, platform string)) (*nats.Subscription, error) {
	return c.conn.Subscribe(MatchCollected, func(msg *nats.Msg) {
		var data struct {
			MatchID  string `json:"match_id"`
			PUUID    string `json:"puuid"`
			Platform string `json:"platform"`
		}

		if err := json.Unmarshal(msg.Data, &data); err != nil {
			logger.Error("failed to unmarshal match collected event", "error", err)
			return
		}

		callback(data.MatchID, data.PUUID, data.Platform)
	})
}

// SubscribeBuildsRecalculated subscribes to builds recalculation events
func (c *Client) SubscribeBuildsRecalculated(logger *slog.Logger, callback func(championID int, role string)) (*nats.Subscription, error) {
	return c.conn.Subscribe(BuildsRecalculated, func(msg *nats.Msg) {
		var data struct {
			ChampionID int    `json:"champion_id"`
			Role       string `json:"role"`
		}

		if err := json.Unmarshal(msg.Data, &data); err != nil {
			logger.Error("failed to unmarshal builds recalculated event", "error", err)
			return
		}

		callback(data.ChampionID, data.Role)
	})
}

// SubscribeLeaderboardUpdated subscribes to leaderboard update events
func (c *Client) SubscribeLeaderboardUpdated(logger *slog.Logger, callback func(region string)) (*nats.Subscription, error) {
	return c.conn.Subscribe(LeaderboardUpdated, func(msg *nats.Msg) {
		var data struct {
			Region string `json:"region"`
		}

		if err := json.Unmarshal(msg.Data, &data); err != nil {
			logger.Error("failed to unmarshal leaderboard updated event", "error", err)
			return
		}

		callback(data.Region)
	})
}

// SubscribePatchChanged subscribes to patch change events
func (c *Client) SubscribePatchChanged(logger *slog.Logger, callback func(patchVersion, changesSummary string)) (*nats.Subscription, error) {
	return c.conn.Subscribe(PatchChanged, func(msg *nats.Msg) {
		var data struct {
			PatchVersion   string `json:"patch_version"`
			ChangesSummary string `json:"changes_summary"`
		}

		if err := json.Unmarshal(msg.Data, &data); err != nil {
			logger.Error("failed to unmarshal patch changed event", "error", err)
			return
		}

		callback(data.PatchVersion, data.ChangesSummary)
	})
}

// SubscribeCacheInvalidate subscribes to cache invalidation events
func (c *Client) SubscribeCacheInvalidate(logger *slog.Logger, cacheKey string, callback func(key string)) (*nats.Subscription, error) {
	subject := CacheInvalidatePrefix + cacheKey
	return c.conn.Subscribe(subject, func(msg *nats.Msg) {
		var data struct {
			Key string `json:"key"`
		}

		if err := json.Unmarshal(msg.Data, &data); err != nil {
			logger.Error("failed to unmarshal cache invalidate event", "error", err)
			return
		}

		callback(data.Key)
	})
}

// Request sends a request and waits for a response
func (c *Client) Request(subject string, data interface{}, timeout time.Duration) (*nats.Msg, error) {
	payload, err := json.Marshal(data)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal data: %w", err)
	}

	return c.conn.Request(subject, payload, timeout)
}

// QueueSubscribe subscribes to a queue group
func (c *Client) QueueSubscribe(subject string, queue string, callback func(msg *nats.Msg)) (*nats.Subscription, error) {
	return c.conn.QueueSubscribe(subject, queue, callback)
}
