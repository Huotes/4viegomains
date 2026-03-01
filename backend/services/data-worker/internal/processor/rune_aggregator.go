package processor

import (
	"context"
	"fmt"
	"log/slog"
	"strings"

	"github.com/4viegomains/backend/pkg/database"
	"github.com/4viegomains/backend/pkg/nats"
)

// RuneAggregator aggregates rune statistics from match data
type RuneAggregator struct {
	postgresDB *database.PostgresDB
	clickhouse *database.ClickHouseDB
	redis      *database.RedisDB
	nats       *nats.Client
	logger     *slog.Logger
}

// RuneConfig represents a rune configuration
type RuneConfig struct {
	PrimaryTree   int
	SecondaryTree int
	StatPerks     [3]int
}

// RuneStats represents statistics for a specific rune configuration
type RuneStats struct {
	RuneConfig RuneConfig
	Role       string
	Wins       int
	Losses     int
	SampleSize int
	AvgKDA     float32
	AvgGoldPM  float32
	AvgCSPM    float32
	WinRate    float32
}

// NewRuneAggregator creates a new rune aggregator
func NewRuneAggregator(
	postgresDB *database.PostgresDB,
	clickhouse *database.ClickHouseDB,
	redis *database.RedisDB,
	nats *nats.Client,
) *RuneAggregator {
	return &RuneAggregator{
		postgresDB: postgresDB,
		clickhouse: clickhouse,
		redis:      redis,
		nats:       nats,
		logger:     slog.Default(),
	}
}

// AggregateRunes aggregates all rune statistics
func (ra *RuneAggregator) AggregateRunes(ctx context.Context) error {
	ra.logger.Info("starting rune aggregation")

	// Get all unique roles
	roles := []string{"MID", "SUPPORT", "TOP", "ADC", "JUNGLE"}

	for _, role := range roles {
		if err := ra.aggregateRunesForRole(ctx, role); err != nil {
			ra.logger.Error("failed to aggregate runes for role", "role", role, "error", err)
		}
	}

	// Invalidate cache
	if err := ra.nats.PublishCacheInvalidate("runes:*"); err != nil {
		ra.logger.Error("failed to publish cache invalidate event", "error", err)
	}

	ra.logger.Info("completed rune aggregation")
	return nil
}

// aggregateRunesForRole aggregates runes for a specific role
func (ra *RuneAggregator) aggregateRunesForRole(ctx context.Context, role string) error {
	ra.logger.Info("aggregating runes for role", "role", role)

	// Query ClickHouse for rune configurations
	query := `
		SELECT
			runes,
			COUNT(*) as match_count,
			SUM(CAST(win AS Int32)) as wins,
			AVG((kills + assists) / (deaths + 1)) as avg_kda,
			AVG(gold_earned / (game_duration / 60)) as avg_gold_pm,
			AVG(cs_per_minute) as avg_cs_pm
		FROM viego_matches
		WHERE role = $1
		AND timestamp >= NOW() - INTERVAL '14 days'
		AND runes != ''
		GROUP BY runes
		HAVING COUNT(*) >= $2
		ORDER BY (SUM(CAST(win AS Int32))::Float32 / COUNT(*)) DESC
		LIMIT 50
	`

	rows, err := ra.clickhouse.Conn().Query(ctx, query, role, MinBuildSampleSize)
	if err != nil {
		return fmt.Errorf("failed to query runes: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var runesStr string
		var matchCount int
		var wins int
		var avgKDA float32
		var avgGoldPM float32
		var avgCSPM float32

		if err := rows.Scan(&runesStr, &matchCount, &wins, &avgKDA, &avgGoldPM, &avgCSPM); err != nil {
			ra.logger.Error("failed to scan rune row", "error", err)
			continue
		}

		winRate := float32(wins) / float32(matchCount)

		// Parse runes
		runes := parseRuneString(runesStr)

		// Store in PostgreSQL
		runeID := generateRuneID(runes, role)
		if err := ra.storeRune(ctx, runeID, runes, role, winRate, matchCount, avgKDA, avgGoldPM, avgCSPM); err != nil {
			ra.logger.Error("failed to store rune", "rune_id", runeID, "error", err)
		}
	}

	ra.logger.Info("aggregated runes for role", "role", role)
	return nil
}

// storeRune stores a rune configuration in PostgreSQL
func (ra *RuneAggregator) storeRune(ctx context.Context, runeID string, runes []int, role string, winRate float32, sampleSize int, avgKDA, avgGoldPM, avgCSPM float32) error {
	query := `
		INSERT INTO viego_runes (
			rune_id, champion_id, role, primary_tree, secondary_tree, stat_perks,
			win_rate, sample_size, avg_kda, avg_gold_pm, avg_cs_pm,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
		ON CONFLICT (rune_id) DO UPDATE SET
			win_rate = EXCLUDED.win_rate,
			sample_size = EXCLUDED.sample_size,
			avg_kda = EXCLUDED.avg_kda,
			avg_gold_pm = EXCLUDED.avg_gold_pm,
			avg_cs_pm = EXCLUDED.avg_cs_pm,
			updated_at = NOW()
	`

	primaryTree := 0
	secondaryTree := 0
	statPerks := ""

	if len(runes) >= 2 {
		primaryTree = runes[0]
		secondaryTree = runes[1]
	}

	if len(runes) >= 5 {
		statPerks = fmt.Sprintf("%d,%d,%d", runes[2], runes[3], runes[4])
	}

	_, err := ra.postgresDB.Pool().Exec(ctx, query,
		runeID,
		ViegoChampionID,
		role,
		primaryTree,
		secondaryTree,
		statPerks,
		winRate,
		sampleSize,
		avgKDA,
		avgGoldPM,
		avgCSPM,
	)

	if err != nil {
		return fmt.Errorf("failed to upsert rune: %w", err)
	}

	ra.logger.Debug("stored rune", "rune_id", runeID, "win_rate", winRate, "sample_size", sampleSize)
	return nil
}

// CalculateRuneEfficiency calculates the win rate delta for individual runes
func (ra *RuneAggregator) CalculateRuneEfficiency(ctx context.Context) error {
	ra.logger.Info("calculating rune efficiency")

	query := `
		SELECT
			primary_tree,
			COUNT(*) as matches,
			SUM(CAST(win AS Int32)) as wins
		FROM viego_matches
		WHERE timestamp >= NOW() - INTERVAL '30 days'
		AND runes != ''
		GROUP BY primary_tree
		ORDER BY matches DESC
	`

	rows, err := ra.clickhouse.Conn().Query(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to query rune efficiency: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var runeID int
		var matches int
		var wins int

		if err := rows.Scan(&runeID, &matches, &wins); err != nil {
			ra.logger.Error("failed to scan rune efficiency row", "error", err)
			continue
		}

		if matches < 50 {
			continue
		}

		winRate := float32(wins) / float32(matches)
		ra.logger.Debug("rune efficiency", "rune_id", runeID, "win_rate", winRate, "sample_size", matches)
	}

	return nil
}

// Helper functions

func parseRuneString(runesStr string) []int {
	var runes []int
	parts := strings.Split(runesStr, ",")
	for _, part := range parts {
		var id int
		if _, err := fmt.Sscanf(strings.TrimSpace(part), "%d", &id); err == nil && id > 0 {
			runes = append(runes, id)
		}
	}
	return runes
}

func generateRuneID(runes []int, role string) string {
	if len(runes) < 2 {
		return fmt.Sprintf("%s:unknown", role)
	}
	return fmt.Sprintf("%s:%d-%d", role, runes[0], runes[1])
}
