package service

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"math"
	"time"

	"github.com/4viegomains/backend/pkg/database"
	"github.com/4viegomains/backend/services/champion-svc/internal/model"
	"github.com/4viegomains/backend/services/champion-svc/internal/repository"
)

const (
	buildCacheTTL = 30 * time.Minute
)

// BuildService handles build-related business logic
type BuildService struct {
	repo  *repository.ChampionRepository
	redis *database.RedisDB
}

// NewBuildService creates a new BuildService
func NewBuildService(repo *repository.ChampionRepository, redis *database.RedisDB) *BuildService {
	return &BuildService{
		repo:  repo,
		redis: redis,
	}
}

// GetTopBuilds retrieves top builds for a role/elo/patch, with caching
func (s *BuildService) GetTopBuilds(ctx context.Context, role, elo, patch string, limit int) ([]model.BuildData, error) {
	logger := slog.Default()

	// Default to 'all' elo if not specified
	if elo == "" {
		elo = "all"
	}

	// Try to get from cache first
	cacheKey := fmt.Sprintf("champion:builds:%s:%s:%s", role, elo, patch)
	var cachedBuilds []model.BuildData
	if err := s.redis.GetJSON(ctx, cacheKey, &cachedBuilds); err == nil {
		logger.Debug("cache hit for builds", "role", role, "elo", elo)
		return cachedBuilds, nil
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
	builds, err := s.repo.GetBuilds(ctx, role, elo, patch, limit)
	if err != nil {
		logger.Error("failed to get builds from repository", "error", err)
		return nil, err
	}

	// Sort by win rate weighted by sample size
	sortedBuilds := sortBuildsByScore(builds)

	// Cache the result
	_ = s.redis.SetJSON(ctx, cacheKey, sortedBuilds, buildCacheTTL)

	return sortedBuilds, nil
}

// GetItemsByStage retrieves items grouped by stage (early, core, late, situational)
func (s *BuildService) GetItemsByStage(ctx context.Context, role, stage string) ([]model.ItemStageData, error) {
	logger := slog.Default()

	// Get builds for this role
	builds, err := s.repo.GetBuilds(ctx, role, "all", "", 100)
	if err != nil {
		logger.Error("failed to get builds for items", "error", err)
		return nil, err
	}

	// Extract items from builds based on stage
	itemMap := make(map[int]itemStats)

	for _, build := range builds {
		// Parse build path
		items, err := parseItemsFromBuild(build.BuildPath)
		if err != nil {
			logger.Debug("failed to parse build path", "error", err)
			continue
		}

		// Determine which items belong to the requested stage
		stageItems := getItemsForStage(items, stage)

		// Aggregate statistics
		for _, itemID := range stageItems {
			stats := itemMap[itemID]
			stats.ID = itemID
			stats.WinRate += float64(build.WinRate) * float64(build.SampleSize)
			stats.PickRate += float64(build.PickRate) * float64(build.SampleSize)
			stats.SampleSize += build.SampleSize
			itemMap[itemID] = stats
		}
	}

	// Calculate averages and sort
	var itemDatas []model.ItemData
	for _, stats := range itemMap {
		if stats.SampleSize == 0 {
			continue
		}
		avgWinRate := float32(stats.WinRate / float64(stats.SampleSize))
		avgPickRate := float32(stats.PickRate / float64(stats.SampleSize))

		itemDatas = append(itemDatas, model.ItemData{
			ID:       stats.ID,
			WinRate:  avgWinRate,
			PickRate: avgPickRate,
		})
	}

	// Sort by win rate
	sortItemsByWinRate(itemDatas)

	return []model.ItemStageData{
		{
			Stage: stage,
			Items: itemDatas,
		},
	}, nil
}

// GetSkillOrders retrieves the most popular skill orders for a role
func (s *BuildService) GetSkillOrders(ctx context.Context, role string) ([]model.SkillOrderData, error) {
	logger := slog.Default()

	// Get builds for this role
	builds, err := s.repo.GetBuilds(ctx, role, "all", "", 100)
	if err != nil {
		logger.Error("failed to get builds for skill orders", "error", err)
		return nil, err
	}

	// Aggregate skill orders
	skillOrderMap := make(map[string]skillOrderStats)

	for _, build := range builds {
		// Parse skill order
		order, err := parseSkillOrder(build.SkillOrder)
		if err != nil {
			logger.Debug("failed to parse skill order", "error", err)
			continue
		}

		stats := skillOrderMap[order]
		stats.Order = order
		stats.WinRate += float64(build.WinRate) * float64(build.SampleSize)
		stats.PickRate += float64(build.PickRate) * float64(build.SampleSize)
		stats.Frequency += build.SampleSize
		skillOrderMap[order] = stats
	}

	// Calculate averages and sort
	var orders []model.SkillOrderData
	for _, stats := range skillOrderMap {
		if stats.Frequency == 0 {
			continue
		}
		avgWinRate := float32(stats.WinRate / float64(stats.Frequency))
		avgPickRate := float32(stats.PickRate / float64(stats.Frequency))

		orders = append(orders, model.SkillOrderData{
			Order:     stats.Order,
			WinRate:   avgWinRate,
			PickRate:  avgPickRate,
			Frequency: stats.Frequency,
		})
	}

	// Sort by win rate
	sortSkillOrdersByWinRate(orders)

	return orders, nil
}

// GetSummonerSpells retrieves summoner spell combinations for a role
func (s *BuildService) GetSummonerSpells(ctx context.Context, role string) ([]model.SummonerSpellData, error) {
	logger := slog.Default()

	// Get builds for this role
	builds, err := s.repo.GetBuilds(ctx, role, "all", "", 100)
	if err != nil {
		logger.Error("failed to get builds for summoner spells", "error", err)
		return nil, err
	}

	// Aggregate summoner spells
	spellMap := make(map[string]summonerSpellStats)

	for _, build := range builds {
		// Parse summoner spells
		spells, err := parseSummonerSpells(build.SummonerSpells)
		if err != nil {
			logger.Debug("failed to parse summoner spells", "error", err)
			continue
		}

		key := fmt.Sprintf("%d-%d", spells[0], spells[1])
		stats := spellMap[key]
		stats.Summoner1 = spells[0]
		stats.Summoner2 = spells[1]
		stats.WinRate += float64(build.WinRate) * float64(build.SampleSize)
		stats.PickRate += float64(build.PickRate) * float64(build.SampleSize)
		stats.Frequency += build.SampleSize
		spellMap[key] = stats
	}

	// Calculate averages
	var spells []model.SummonerSpellData
	for _, stats := range spellMap {
		if stats.Frequency == 0 {
			continue
		}
		avgWinRate := float32(stats.WinRate / float64(stats.Frequency))
		avgPickRate := float32(stats.PickRate / float64(stats.Frequency))

		spells = append(spells, model.SummonerSpellData{
			Summoner1: stats.Summoner1,
			Summoner2: stats.Summoner2,
			WinRate:   avgWinRate,
			PickRate:  avgPickRate,
			Frequency: stats.Frequency,
		})
	}

	// Sort by pick rate
	sortSummonerSpellsByPickRate(spells)

	return spells, nil
}

// InvalidateCache clears the cache for a specific role
func (s *BuildService) InvalidateCache(role string) {
	logger := slog.Default()
	ctx := context.Background()

	elos := []string{"all", "iron", "bronze", "silver", "gold", "platinum", "emerald", "diamond", "master", "grandmaster", "challenger"}

	for _, elo := range elos {
		cacheKey := fmt.Sprintf("champion:builds:%s:%s:*", role, elo)
		_ = s.redis.Delete(ctx, cacheKey)
	}

	logger.Info("invalidated build cache", "role", role)
}

// Helper types
type itemStats struct {
	ID         int
	WinRate    float64
	PickRate   float64
	SampleSize int64
}

type skillOrderStats struct {
	Order     string
	WinRate   float64
	PickRate  float64
	Frequency int64
}

type summonerSpellStats struct {
	Summoner1 int
	Summoner2 int
	WinRate   float64
	PickRate  float64
	Frequency int64
}

// Helper functions

func parseItemsFromBuild(buildPath model.JSONArray) ([]int, error) {
	var items []int
	data, err := json.Marshal(buildPath)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(data, &items)
	return items, err
}

func getItemsForStage(items []int, stage string) []int {
	if len(items) == 0 {
		return []int{}
	}

	switch stage {
	case "early":
		if len(items) >= 2 {
			return items[:2]
		}
		return items
	case "core":
		if len(items) >= 4 {
			return items[1:4]
		} else if len(items) > 1 {
			return items[1:]
		}
		return []int{}
	case "late":
		if len(items) >= 4 {
			return items[4:]
		}
		return []int{}
	case "situational":
		if len(items) >= 6 {
			return items[5:]
		}
		return []int{}
	}
	return []int{}
}

func parseSkillOrder(skillOrderArray model.JSONArray) (string, error) {
	data, err := json.Marshal(skillOrderArray)
	if err != nil {
		return "", err
	}
	var order []int
	err = json.Unmarshal(data, &order)
	if err != nil {
		return "", err
	}

	orderStr := ""
	for _, skill := range order {
		if skill >= 0 && skill <= 3 {
			skills := []string{"Q", "W", "E", "R"}
			orderStr += skills[skill]
		}
	}
	return orderStr, nil
}

func parseSummonerSpells(spellsArray model.JSONArray) ([2]int, error) {
	var spells [2]int
	data, err := json.Marshal(spellsArray)
	if err != nil {
		return spells, err
	}
	var parsed []int
	err = json.Unmarshal(data, &parsed)
	if err != nil || len(parsed) < 2 {
		return spells, err
	}
	spells[0] = parsed[0]
	spells[1] = parsed[1]
	return spells, nil
}

func sortBuildsByScore(builds []model.BuildData) []model.BuildData {
	// Sort by weighted score: win_rate * log(sample_size)
	for i := 0; i < len(builds); i++ {
		for j := i + 1; j < len(builds); j++ {
			scoreI := float64(builds[i].WinRate) * math.Log(float64(builds[i].SampleSize)+1)
			scoreJ := float64(builds[j].WinRate) * math.Log(float64(builds[j].SampleSize)+1)
			if scoreJ > scoreI {
				builds[i], builds[j] = builds[j], builds[i]
			}
		}
	}
	return builds
}

func sortItemsByWinRate(items []model.ItemData) {
	for i := 0; i < len(items); i++ {
		for j := i + 1; j < len(items); j++ {
			if items[j].WinRate > items[i].WinRate {
				items[i], items[j] = items[j], items[i]
			}
		}
	}
}

func sortSkillOrdersByWinRate(orders []model.SkillOrderData) {
	for i := 0; i < len(orders); i++ {
		for j := i + 1; j < len(orders); j++ {
			if orders[j].WinRate > orders[i].WinRate {
				orders[i], orders[j] = orders[j], orders[i]
			}
		}
	}
}

func sortSummonerSpellsByPickRate(spells []model.SummonerSpellData) {
	for i := 0; i < len(spells); i++ {
		for j := i + 1; j < len(spells); j++ {
			if spells[j].PickRate > spells[i].PickRate {
				spells[i], spells[j] = spells[j], spells[i]
			}
		}
	}
}
