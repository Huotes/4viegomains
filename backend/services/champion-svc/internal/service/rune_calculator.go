package service

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/4viegomains/backend/pkg/database"
	"github.com/4viegomains/backend/services/champion-svc/internal/model"
	"github.com/4viegomains/backend/services/champion-svc/internal/repository"
)

const (
	runeCacheTTL = 30 * time.Minute
)

// RuneService handles rune-related business logic
type RuneService struct {
	repo  *repository.ChampionRepository
	redis *database.RedisDB
}

// NewRuneService creates a new RuneService
func NewRuneService(repo *repository.ChampionRepository, redis *database.RedisDB) *RuneService {
	return &RuneService{
		repo:  repo,
		redis: redis,
	}
}

// GetTopRunes retrieves top rune pages for a role/elo/patch, with caching
func (s *RuneService) GetTopRunes(ctx context.Context, role, elo, patch string, limit int) ([]model.RunePageData, error) {
	logger := slog.Default()

	// Default to 'all' elo if not specified
	if elo == "" {
		elo = "all"
	}

	// Try to get from cache first
	cacheKey := fmt.Sprintf("champion:runes:%s:%s:%s", role, elo, patch)
	var cachedRunes []model.RunePageData
	if err := s.redis.GetJSON(ctx, cacheKey, &cachedRunes); err == nil {
		logger.Debug("cache hit for runes", "role", role, "elo", elo)
		return cachedRunes, nil
	}

	// If patch is empty, get the latest patch
	if patch == "" {
		var err error
		patch, err = s.repo.GetLatestPatch(ctx)
		if err != nil {
			logger.Error("failed to get latest patch", "error", err)
			patch = "latest"
		}
	}

	// Query from database
	runes, err := s.repo.GetRunes(ctx, role, elo, patch, limit)
	if err != nil {
		logger.Error("failed to get runes from repository", "error", err)
		return nil, err
	}

	// Filter by minimum sample size to ensure statistical significance
	minSampleSize := int64(100)
	var filteredRunes []model.RunePageData
	for _, rune := range runes {
		if rune.SampleSize >= minSampleSize {
			filteredRunes = append(filteredRunes, rune)
		}
	}

	// Cache the result
	_ = s.redis.SetJSON(ctx, cacheKey, filteredRunes, runeCacheTTL)

	return filteredRunes, nil
}

// InvalidateCache clears the cache for a specific role
func (s *RuneService) InvalidateCache(role string) {
	logger := slog.Default()
	ctx := context.Background()

	elos := []string{"all", "iron", "bronze", "silver", "gold", "platinum", "emerald", "diamond", "master", "grandmaster", "challenger"}

	for _, elo := range elos {
		cacheKey := fmt.Sprintf("champion:runes:%s:%s:*", role, elo)
		_ = s.redis.Delete(ctx, cacheKey)
	}

	logger.Info("invalidated rune cache", "role", role)
}
