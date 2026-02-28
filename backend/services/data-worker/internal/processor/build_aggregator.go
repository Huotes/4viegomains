package processor

import (
	"context"
	"fmt"
	"log/slog"
	"math"
	"strings"
	"time"

	"github.com/4viegomains/backend/pkg/database"
	"github.com/4viegomains/backend/pkg/nats"
)

const (
	// Minimum games for a build to be considered viable
	MinBuildSampleSize = 100

	// ViegoChampionID constant
	ViegoChampionID = 234
)

// BuildAggregator aggregates build statistics from match data
type BuildAggregator struct {
	postgresDB *database.PostgresDB
	clickhouse *database.ClickHouseDB
	redis      *database.RedisDB
	nats       *nats.Client
	logger     *slog.Logger
}

// BuildStats represents statistics for a specific build
type BuildStats struct {
	BuildPath  []int
	Role       string
	Elo        string
	Wins       int
	Losses     int
	SampleSize int
	AvgKDA     float32
	AvgGoldPM  float32
	AvgCSPM    float32
}

// NewBuildAggregator creates a new build aggregator
func NewBuildAggregator(
	postgresDB *database.PostgresDB,
	clickhouse *database.ClickHouseDB,
	redis *database.RedisDB,
	nats *nats.Client,
) *BuildAggregator {
	return &BuildAggregator{
		postgresDB: postgresDB,
		clickhouse: clickhouse,
		redis:      redis,
		nats:       nats,
		logger:     slog.Default(),
	}
}

// AggregateBuilds aggregates all build statistics
func (ba *BuildAggregator) AggregateBuilds(ctx context.Context) error {
	ba.logger.Info("starting build aggregation")

	// Get all unique roles
	roles := []string{"MID", "SUPPORT", "TOP", "ADC", "JUNGLE"}

	for _, role := range roles {
		if err := ba.aggregateBuildsForRole(ctx, role); err != nil {
			ba.logger.Error("failed to aggregate builds for role", "role", role, "error", err)
		}
	}

	// Invalidate cache
	if err := ba.nats.PublishCacheInvalidate("builds:*"); err != nil {
		ba.logger.Error("failed to publish cache invalidate event", "error", err)
	}

	ba.logger.Info("completed build aggregation")
	return nil
}

// aggregateBuildsForRole aggregates builds for a specific role
func (ba *BuildAggregator) aggregateBuildsForRole(ctx context.Context, role string) error {
	ba.logger.Info("aggregating builds for role", "role", role)

	// Query ClickHouse for matches in last 14 days
	query := `
		SELECT
			items,
			COUNT(*) as match_count,
			SUM(CAST(win AS Int32)) as wins,
			AVG((kills + assists) / (deaths + 1)) as avg_kda,
			AVG(gold_earned / (game_duration / 60)) as avg_gold_pm,
			AVG(cs_per_minute) as avg_cs_pm
		FROM viego_matches
		WHERE role = $1
		AND timestamp >= NOW() - INTERVAL '14 days'
		AND items != ''
		GROUP BY items
		HAVING COUNT(*) >= $2
		ORDER BY (SUM(CAST(win AS Int32))::Float32 / COUNT(*)) * LOG(2, COUNT(*)) DESC
		LIMIT 100
	`

	rows, err := ba.clickhouse.Conn().Query(ctx, query, role, MinBuildSampleSize)
	if err != nil {
		return fmt.Errorf("failed to query builds: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var itemsStr string
		var matchCount int
		var wins int
		var avgKDA float32
		var avgGoldPM float32
		var avgCSPM float32

		if err := rows.Scan(&itemsStr, &matchCount, &wins, &avgKDA, &avgGoldPM, &avgCSPM); err != nil {
			ba.logger.Error("failed to scan build row", "error", err)
			continue
		}

		winRate := float32(wins) / float32(matchCount)

		// Parse items
		itemsSlice := parseItemString(itemsStr)

		// Store in PostgreSQL
		buildID := generateBuildID(itemsSlice, role)
		if err := ba.storeBuild(ctx, buildID, itemsSlice, role, winRate, matchCount, avgKDA, avgGoldPM, avgCSPM); err != nil {
			ba.logger.Error("failed to store build", "build_id", buildID, "error", err)
		}
	}

	ba.logger.Info("aggregated builds for role", "role", role)
	return nil
}

// storeBuild stores a build in PostgreSQL
func (ba *BuildAggregator) storeBuild(ctx context.Context, buildID string, items []int, role string, winRate float32, sampleSize int, avgKDA, avgGoldPM, avgCSPM float32) error {
	query := `
		INSERT INTO viego_builds (
			build_id, champion_id, role, items,
			win_rate, sample_size, avg_kda, avg_gold_pm, avg_cs_pm,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
		ON CONFLICT (build_id) DO UPDATE SET
			win_rate = EXCLUDED.win_rate,
			sample_size = EXCLUDED.sample_size,
			avg_kda = EXCLUDED.avg_kda,
			avg_gold_pm = EXCLUDED.avg_gold_pm,
			avg_cs_pm = EXCLUDED.avg_cs_pm,
			updated_at = NOW()
	`

	itemsStr := ""
	for i, item := range items {
		if i > 0 {
			itemsStr += ","
		}
		itemsStr += fmt.Sprintf("%d", item)
	}

	err := ba.postgresDB.Pool().Exec(ctx, query,
		buildID,
		ViegoChampionID,
		role,
		itemsStr,
		winRate,
		sampleSize,
		avgKDA,
		avgGoldPM,
		avgCSPM,
	)

	if err != nil {
		return fmt.Errorf("failed to upsert build: %w", err)
	}

	ba.logger.Debug("stored build", "build_id", buildID, "win_rate", winRate, "sample_size", sampleSize)
	return nil
}

// extractCoreBuild extracts core items (excluding boots, wards, consumables)
func (ba *BuildAggregator) extractCoreBuild(items []int) []int {
	// This would use a static list of consumable/boot IDs
	// For now, we filter items > 3000 and exclude common boot/ward IDs
	bootIDs := map[int]bool{1001: true, 1002: true, 1003: true, 1004: true, 3006: true, 3009: true, 3020: true}
	wardIDs := map[int]bool{2055: true, 3670: true}

	var coreItems []int
	for _, item := range items {
		if _, isBoot := bootIDs[item]; !isBoot {
			if _, isWard := wardIDs[item]; !isWard {
				if item > 0 && item < 4000 {
					coreItems = append(coreItems, item)
				}
			}
		}
	}
	return coreItems
}

// groupBuildPaths groups matches by similar build paths
func (ba *BuildAggregator) groupBuildPaths(buildPaths [][]int) map[string]int {
	groups := make(map[string]int)
	for _, path := range buildPaths {
		core := ba.extractCoreBuild(path)
		key := buildPathToString(core)
		groups[key]++
	}
	return groups
}

// calculateBuildStats calculates statistics for a build
func (ba *BuildAggregator) calculateBuildStats(matches []map[string]interface{}) BuildStats {
	stats := BuildStats{}

	if len(matches) == 0 {
		return stats
	}

	var totalKDA float32
	var totalGoldPM float32
	var totalCSPM float32
	wins := 0

	for _, match := range matches {
		if win, ok := match["win"].(bool); ok && win {
			wins++
		}

		if kda, ok := match["avg_kda"].(float32); ok {
			totalKDA += kda
		}

		if goldPM, ok := match["gold_pm"].(float32); ok {
			totalGoldPM += goldPM
		}

		if cspm, ok := match["cs_pm"].(float32); ok {
			totalCSPM += cspm
		}
	}

	stats.Wins = wins
	stats.Losses = len(matches) - wins
	stats.SampleSize = len(matches)
	stats.AvgKDA = totalKDA / float32(len(matches))
	stats.AvgGoldPM = totalGoldPM / float32(len(matches))
	stats.AvgCSPM = totalCSPM / float32(len(matches))

	return stats
}

// Helper functions

func parseItemString(itemsStr string) []int {
	var items []int
	parts := strings.Split(itemsStr, ",")
	for _, part := range parts {
		var id int
		if _, err := fmt.Sscanf(strings.TrimSpace(part), "%d", &id); err == nil && id > 0 {
			items = append(items, id)
		}
	}
	return items
}

func generateBuildID(items []int, role string) string {
	coreItems := extractCoreItems(items)
	itemStr := ""
	for i, item := range coreItems {
		if i > 0 {
			itemStr += "-"
		}
		itemStr += fmt.Sprintf("%d", item)
	}
	return fmt.Sprintf("%s:%s", role, itemStr)
}

func extractCoreItems(items []int) []int {
	bootIDs := map[int]bool{1001: true, 1002: true, 1003: true, 1004: true, 3006: true, 3009: true, 3020: true}
	wardIDs := map[int]bool{2055: true, 3670: true}

	var core []int
	for _, item := range items {
		if _, isBoot := bootIDs[item]; !isBoot {
			if _, isWard := wardIDs[item]; !isWard {
				if item > 0 && item < 4000 {
					core = append(core, item)
				}
			}
		}
	}
	return core
}

func buildPathToString(items []int) string {
	itemStr := ""
	for i, item := range items {
		if i > 0 {
			itemStr += "-"
		}
		itemStr += fmt.Sprintf("%d", item)
	}
	return itemStr
}
