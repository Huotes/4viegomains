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
	matchupCacheTTL = 1 * time.Hour
	statsCacheTTL   = 2 * time.Hour
)

// MatchupService handles matchup-related business logic
type MatchupService struct {
	repo  *repository.ChampionRepository
	redis *database.RedisDB
}

// NewMatchupService creates a new MatchupService
func NewMatchupService(repo *repository.ChampionRepository, redis *database.RedisDB) *MatchupService {
	return &MatchupService{
		repo:  repo,
		redis: redis,
	}
}

// GetMatchup retrieves specific matchup data between Viego and an enemy champion
func (s *MatchupService) GetMatchup(ctx context.Context, role, elo string, enemyChampionID int) (model.MatchupData, error) {
	logger := slog.Default()

	// Default to 'all' elo if not specified
	if elo == "" {
		elo = "all"
	}

	// Try to get from cache first
	cacheKey := fmt.Sprintf("champion:matchup:%s:%s:%d", role, elo, enemyChampionID)
	var cachedMatchup model.MatchupData
	if err := s.redis.GetJSON(ctx, cacheKey, &cachedMatchup); err == nil {
		logger.Debug("cache hit for matchup", "role", role, "elo", elo, "vs", enemyChampionID)
		return cachedMatchup, nil
	}

	// Query from database
	matchup, err := s.repo.GetMatchup(ctx, role, elo, enemyChampionID)
	if err != nil {
		logger.Error("failed to get matchup from repository", "error", err)
		return matchup, err
	}

	// Cache the result
	_ = s.redis.SetJSON(ctx, cacheKey, matchup, matchupCacheTTL)

	return matchup, nil
}

// GetCounters retrieves the hardest and easiest matchups for a given role
func (s *MatchupService) GetCounters(ctx context.Context, role, elo string) (model.CountersData, error) {
	logger := slog.Default()

	// Default to 'all' elo if not specified
	if elo == "" {
		elo = "all"
	}

	// Try to get from cache first
	cacheKey := fmt.Sprintf("champion:counters:%s:%s", role, elo)
	var cachedCounters model.CountersData
	if err := s.redis.GetJSON(ctx, cacheKey, &cachedCounters); err == nil {
		logger.Debug("cache hit for counters", "role", role, "elo", elo)
		return cachedCounters, nil
	}

	// Get all matchups for the role
	matchups, err := s.repo.GetAllMatchups(ctx, role, elo)
	if err != nil {
		logger.Error("failed to get all matchups from repository", "error", err)
		return model.CountersData{}, err
	}

	// Separate hardest (lowest win rate) and easiest (highest win rate)
	var counters model.CountersData

	if len(matchups) > 0 {
		// Find top 5 hardest
		for i := 0; i < 5 && i < len(matchups); i++ {
			counters.Hardest = append(counters.Hardest, matchups[i])
		}

		// Find top 5 easiest (reverse order, highest win rate)
		start := len(matchups) - 5
		if start < 0 {
			start = 0
		}
		for i := len(matchups) - 1; i >= start; i-- {
			counters.Easiest = append(counters.Easiest, matchups[i])
		}
	}

	// Cache the result
	_ = s.redis.SetJSON(ctx, cacheKey, counters, matchupCacheTTL)

	return counters, nil
}

// GetChampionStats retrieves meta statistics for a specific role
func (s *MatchupService) GetChampionStats(ctx context.Context, role, elo string) (model.MetaStatsData, error) {
	logger := slog.Default()

	// Default to 'all' elo if not specified
	if elo == "" {
		elo = "all"
	}

	// Try to get from cache first
	cacheKey := fmt.Sprintf("champion:stats:%s:%s", role, elo)
	var cachedStats model.MetaStatsData
	if err := s.redis.GetJSON(ctx, cacheKey, &cachedStats); err == nil {
		logger.Debug("cache hit for stats", "role", role, "elo", elo)
		return cachedStats, nil
	}

	// Query from database
	stats, err := s.repo.GetMetaStats(ctx, role, elo)
	if err != nil {
		logger.Error("failed to get meta stats from repository", "error", err)
		return stats, err
	}

	// Cache the result
	_ = s.redis.SetJSON(ctx, cacheKey, stats, statsCacheTTL)

	return stats, nil
}

// GetAllStats retrieves meta statistics for all roles in a given ELO
func (s *MatchupService) GetAllStats(ctx context.Context, elo string) ([]model.MetaStatsData, error) {
	logger := slog.Default()

	// Default to 'all' elo if not specified
	if elo == "" {
		elo = "all"
	}

	// Try to get from cache first
	cacheKey := fmt.Sprintf("champion:stats:all:%s", elo)
	var cachedStats []model.MetaStatsData
	if err := s.redis.GetJSON(ctx, cacheKey, &cachedStats); err == nil {
		logger.Debug("cache hit for all stats", "elo", elo)
		return cachedStats, nil
	}

	// Get stats for all roles
	roles := []string{"top", "jungle", "mid", "bot", "support"}
	var allStats []model.MetaStatsData

	for _, role := range roles {
		stats, err := s.repo.GetMetaStats(ctx, role, elo)
		if err != nil {
			logger.Error("failed to get meta stats for role", "error", err, "role", role)
			continue
		}
		allStats = append(allStats, stats)
	}

	// Cache the result
	_ = s.redis.SetJSON(ctx, cacheKey, allStats, statsCacheTTL)

	return allStats, nil
}
