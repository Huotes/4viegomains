package collector

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/4viegomains/backend/pkg/database"
	"github.com/4viegomains/backend/pkg/nats"
	"github.com/4viegomains/backend/pkg/riot"
)

// PatchWatcher watches for patch updates and invalidates caches
type PatchWatcher struct {
	riotClient *riot.Client
	redis      *database.RedisDB
	nats       *nats.Client
	logger     *slog.Logger
}

// NewPatchWatcher creates a new patch watcher
func NewPatchWatcher(
	riotClient *riot.Client,
	redis *database.RedisDB,
	nats *nats.Client,
) *PatchWatcher {
	return &PatchWatcher{
		riotClient: riotClient,
		redis:      redis,
		nats:       nats,
		logger:     slog.Default(),
	}
}

// CheckPatchUpdate checks for Data Dragon version updates
func (pw *PatchWatcher) CheckPatchUpdate(ctx context.Context) error {
	pw.logger.Info("checking for patch updates")

	// Fetch current version from Data Dragon
	currentVersion, err := pw.riotClient.GetLatestDDragonVersion(ctx)
	if err != nil {
		return fmt.Errorf("failed to fetch latest DDragon version: %w", err)
	}

	// Get stored version from Redis
	storedVersion, err := pw.redis.Client().Get(ctx, "ddragon:current_version").Result()
	if err != nil && err.Error() != "redis: nil" {
		return fmt.Errorf("failed to get stored version: %w", err)
	}

	pw.logger.Debug("version comparison", "current", currentVersion, "stored", storedVersion)

	// If version changed, trigger update
	if currentVersion != storedVersion {
		pw.logger.Info("patch detected", "old_version", storedVersion, "new_version", currentVersion)

		// Store new version
		if err := pw.redis.Client().Set(ctx, "ddragon:current_version", currentVersion, 24*time.Hour).Err(); err != nil {
			pw.logger.Error("failed to store new version", "error", err)
		}

		// Invalidate related caches
		if err := pw.invalidateCaches(ctx); err != nil {
			pw.logger.Error("failed to invalidate caches", "error", err)
		}

		// Publish event
		if err := pw.nats.PublishPatchChanged(currentVersion, fmt.Sprintf("Patch update from %s to %s", storedVersion, currentVersion)); err != nil {
			pw.logger.Error("failed to publish patch change event", "error", err)
		}

		return nil
	}

	pw.logger.Debug("no patch update detected")
	return nil
}

// invalidateCaches invalidates all relevant caches
func (pw *PatchWatcher) invalidateCaches(ctx context.Context) error {
	cacheKeys := []string{
		"ddragon:items",
		"ddragon:champions",
		"ddragon:runes",
		"builds:*",
		"stats:*",
		"meta:*",
	}

	for _, key := range cacheKeys {
		if err := pw.nats.PublishCacheInvalidate(key); err != nil {
			pw.logger.Error("failed to publish cache invalidate event", "key", key, "error", err)
		}
	}

	// Also directly delete from Redis if specific keys exist
	pattern := "builds:*"
	keys := pw.redis.Client().Keys(ctx, pattern).Val()
	if len(keys) > 0 {
		if err := pw.redis.Client().Del(ctx, keys...).Err(); err != nil {
			pw.logger.Error("failed to delete build caches", "error", err)
		}
	}

	return nil
}

// OnPatchChange handles actions when a patch changes
func (pw *PatchWatcher) OnPatchChange(ctx context.Context, newVersion string) error {
	pw.logger.Info("handling patch change", "new_version", newVersion)

	// Invalidate caches
	if err := pw.invalidateCaches(ctx); err != nil {
		pw.logger.Error("failed to invalidate caches on patch change", "error", err)
	}

	// Update DDragon assets cache
	if err := pw.updateDDragonCache(ctx); err != nil {
		pw.logger.Error("failed to update DDragon cache", "error", err)
	}

	pw.logger.Info("patch change handling complete", "new_version", newVersion)
	return nil
}

// updateDDragonCache updates the DDragon assets cache
func (pw *PatchWatcher) updateDDragonCache(ctx context.Context) error {
	pw.logger.Debug("updating DDragon assets cache")

	// Fetch and cache items
	version, err := pw.riotClient.GetLatestDDragonVersion(ctx)
	if err != nil {
		return fmt.Errorf("failed to get DDragon version: %w", err)
	}

	// Store version timestamp
	timestamp := time.Now().Unix()
	if err := pw.redis.Client().Set(ctx, "ddragon:cache_timestamp", timestamp, 24*time.Hour).Err(); err != nil {
		pw.logger.Error("failed to store cache timestamp", "error", err)
	}

	pw.logger.Debug("DDragon cache updated", "version", version)
	return nil
}
