package processor

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/4viegomains/backend/pkg/database"
	"github.com/4viegomains/backend/pkg/nats"
)

// StatsCalculator calculates meta statistics and matchups
type StatsCalculator struct {
	postgresDB *database.PostgresDB
	clickhouse *database.ClickHouseDB
	redis      *database.RedisDB
	nats       *nats.Client
	logger     *slog.Logger
}

// MetaStat represents meta statistics for a champion
type MetaStat struct {
	ChampionID  int
	Role        string
	WinRate     float32
	PickRate    float32
	BanRate     float32
	SampleSize  int
	Tier        string
	AvgKDA      float32
	AvgKills    float32
	AvgDeaths   float32
	AvgAssists  float32
	AvgGoldPM   float32
	AvgCSPM     float32
	AvgVisionScore float32
}

// Matchup represents matchup statistics
type Matchup struct {
	ChampionID      int
	EnemyChampionID int
	Role            string
	WinRate         float32
	MatchCount      int
	AvgGoldDiff15   float32
	AvgCSDiff15     float32
	AvgKDA          float32
}

// NewStatsCalculator creates a new stats calculator
func NewStatsCalculator(
	postgresDB *database.PostgresDB,
	clickhouse *database.ClickHouseDB,
	redis *database.RedisDB,
	nats *nats.Client,
) *StatsCalculator {
	return &StatsCalculator{
		postgresDB: postgresDB,
		clickhouse: clickhouse,
		redis:      redis,
		nats:       nats,
		logger:     slog.Default(),
	}
}

// CalculateMetaStats calculates overall meta statistics
func (sc *StatsCalculator) CalculateMetaStats(ctx context.Context) error {
	sc.logger.Info("calculating meta statistics")

	roles := []string{"MID", "SUPPORT", "TOP", "ADC", "JUNGLE"}

	for _, role := range roles {
		if err := sc.calculateRoleStats(ctx, role); err != nil {
			sc.logger.Error("failed to calculate stats for role", "role", role, "error", err)
		}
	}

	// Invalidate cache
	if err := sc.nats.PublishCacheInvalidate("meta:*"); err != nil {
		sc.logger.Error("failed to publish cache invalidate event", "error", err)
	}

	sc.logger.Info("completed meta statistics calculation")
	return nil
}

// calculateRoleStats calculates statistics for a specific role
func (sc *StatsCalculator) calculateRoleStats(ctx context.Context, role string) error {
	query := `
		SELECT
			champion_id,
			COUNT(*) as match_count,
			SUM(CAST(win AS Int32)) as wins,
			AVG((kills + assists) / (deaths + 1)) as avg_kda,
			AVG(kills) as avg_kills,
			AVG(deaths) as avg_deaths,
			AVG(assists) as avg_assists,
			AVG(gold_earned / (game_duration / 60)) as avg_gold_pm,
			AVG(cs_per_minute) as avg_cs_pm,
			AVG(vision_score) as avg_vision_score
		FROM viego_matches
		WHERE role = $1
		AND timestamp >= NOW() - INTERVAL '14 days'
		GROUP BY champion_id
		ORDER BY match_count DESC
	`

	rows, err := sc.clickhouse.Conn().Query(ctx, query, role)
	if err != nil {
		return fmt.Errorf("failed to query meta stats: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var championID int
		var matchCount int
		var wins int
		var avgKDA float32
		var avgKills float32
		var avgDeaths float32
		var avgAssists float32
		var avgGoldPM float32
		var avgCSPM float32
		var avgVisionScore float32

		if err := rows.Scan(&championID, &matchCount, &wins, &avgKDA, &avgKills, &avgDeaths, &avgAssists, &avgGoldPM, &avgCSPM, &avgVisionScore); err != nil {
			sc.logger.Error("failed to scan meta stat row", "error", err)
			continue
		}

		winRate := float32(wins) / float32(matchCount)
		pickRate := sc.calculatePickRate(ctx, championID, role, matchCount)
		banRate := sc.calculateBanRate(ctx, championID, role, matchCount)

		// Determine tier based on win rate and pick rate
		tier := sc.determineTier(winRate, pickRate)

		// Store in PostgreSQL
		if err := sc.storeMetaStat(ctx, championID, role, winRate, pickRate, banRate, matchCount, tier, avgKDA, avgKills, avgDeaths, avgAssists, avgGoldPM, avgCSPM, avgVisionScore); err != nil {
			sc.logger.Error("failed to store meta stat", "champion_id", championID, "role", role, "error", err)
		}
	}

	return nil
}

// calculatePickRate calculates the pick rate for a champion
func (sc *StatsCalculator) calculatePickRate(ctx context.Context, championID int, role string, matches int) float32 {
	// Rough estimation: if this champion has 100 matches in a role,
	// estimate total games in that role (average ~1000-2000 per role)
	totalGames := matches * 20
	if totalGames > 0 {
		return float32(matches) / float32(totalGames)
	}
	return 0
}

// calculateBanRate calculates the ban rate for a champion
func (sc *StatsCalculator) calculateBanRate(ctx context.Context, championID int, role string, matches int) float32 {
	// Ban rate estimation
	// Would need separate tracking in future
	return 0.05 // Placeholder
}

// determineTier determines the tier (S/A/B/C/D) based on win rate and pick rate
func (sc *StatsCalculator) determineTier(winRate, pickRate float32) string {
	// S tier: >55% win rate with reasonable pick rate
	if winRate > 0.55 {
		return "S"
	}
	// A tier: >52% win rate
	if winRate > 0.52 {
		return "A"
	}
	// B tier: >50% win rate
	if winRate > 0.50 {
		return "B"
	}
	// C tier: >48% win rate
	if winRate > 0.48 {
		return "C"
	}
	// D tier: anything below
	return "D"
}

// storeMetaStat stores meta statistics in PostgreSQL
func (sc *StatsCalculator) storeMetaStat(ctx context.Context, championID int, role string, winRate, pickRate, banRate float32, sampleSize int, tier string, avgKDA, avgKills, avgDeaths, avgAssists, avgGoldPM, avgCSPM, avgVisionScore float32) error {
	query := `
		INSERT INTO viego_meta_stats (
			champion_id, role, win_rate, pick_rate, ban_rate,
			sample_size, tier,
			avg_kda, avg_kills, avg_deaths, avg_assists,
			avg_gold_pm, avg_cs_pm, avg_vision_score,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
		ON CONFLICT (champion_id, role) DO UPDATE SET
			win_rate = EXCLUDED.win_rate,
			pick_rate = EXCLUDED.pick_rate,
			ban_rate = EXCLUDED.ban_rate,
			sample_size = EXCLUDED.sample_size,
			tier = EXCLUDED.tier,
			avg_kda = EXCLUDED.avg_kda,
			avg_kills = EXCLUDED.avg_kills,
			avg_deaths = EXCLUDED.avg_deaths,
			avg_assists = EXCLUDED.avg_assists,
			avg_gold_pm = EXCLUDED.avg_gold_pm,
			avg_cs_pm = EXCLUDED.avg_cs_pm,
			avg_vision_score = EXCLUDED.avg_vision_score,
			updated_at = NOW()
	`

	_, err := sc.postgresDB.Pool().Exec(ctx, query,
		championID,
		role,
		winRate,
		pickRate,
		banRate,
		sampleSize,
		tier,
		avgKDA,
		avgKills,
		avgDeaths,
		avgAssists,
		avgGoldPM,
		avgCSPM,
		avgVisionScore,
	)

	if err != nil {
		return fmt.Errorf("failed to upsert meta stat: %w", err)
	}

	sc.logger.Debug("stored meta stat", "champion_id", championID, "role", role, "win_rate", winRate, "tier", tier)
	return nil
}

// CalculateMatchups calculates matchup statistics
func (sc *StatsCalculator) CalculateMatchups(ctx context.Context) error {
	sc.logger.Info("calculating matchups")

	roles := []string{"MID", "SUPPORT", "TOP", "ADC", "JUNGLE"}

	for _, role := range roles {
		if err := sc.calculateRoleMatchups(ctx, role); err != nil {
			sc.logger.Error("failed to calculate matchups for role", "role", role, "error", err)
		}
	}

	// Invalidate cache
	if err := sc.nats.PublishCacheInvalidate("matchups:*"); err != nil {
		sc.logger.Error("failed to publish cache invalidate event", "error", err)
	}

	sc.logger.Info("completed matchup calculation")
	return nil
}

// calculateRoleMatchups calculates matchups for a specific role
func (sc *StatsCalculator) calculateRoleMatchups(ctx context.Context, role string) error {
	query := `
		SELECT
			champion_id,
			enemy_champion_id,
			COUNT(*) as match_count,
			SUM(CAST(win AS Int32)) as wins,
			AVG((kills + assists) / (deaths + 1)) as avg_kda
		FROM viego_matchups_temp
		WHERE role = $1
		AND timestamp >= NOW() - INTERVAL '14 days'
		GROUP BY champion_id, enemy_champion_id
		HAVING COUNT(*) >= 20
		ORDER BY match_count DESC
	`

	rows, err := sc.clickhouse.Conn().Query(ctx, query, role)
	if err != nil {
		return fmt.Errorf("failed to query matchups: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var championID int
		var enemyChampionID int
		var matchCount int
		var wins int
		var avgKDA float32

		if err := rows.Scan(&championID, &enemyChampionID, &matchCount, &wins, &avgKDA); err != nil {
			sc.logger.Error("failed to scan matchup row", "error", err)
			continue
		}

		winRate := float32(wins) / float32(matchCount)

		// For now, we'll skip calculating gold/cs diffs as they require more complex timeline analysis
		avgGoldDiff := float32(0)
		avgCSDiff := float32(0)

		// Store matchup
		if err := sc.storeMatchup(ctx, championID, enemyChampionID, role, winRate, matchCount, avgGoldDiff, avgCSDiff, avgKDA); err != nil {
			sc.logger.Error("failed to store matchup", "champion_id", championID, "enemy_id", enemyChampionID, "error", err)
		}
	}

	return nil
}

// storeMatchup stores matchup statistics in PostgreSQL
func (sc *StatsCalculator) storeMatchup(ctx context.Context, championID, enemyChampionID int, role string, winRate float32, sampleSize int, avgGoldDiff, avgCSDiff, avgKDA float32) error {
	query := `
		INSERT INTO viego_matchups (
			champion_id, enemy_champion_id, role,
			win_rate, sample_size,
			avg_gold_diff_15, avg_cs_diff_15, avg_kda,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
		ON CONFLICT (champion_id, enemy_champion_id, role) DO UPDATE SET
			win_rate = EXCLUDED.win_rate,
			sample_size = EXCLUDED.sample_size,
			avg_gold_diff_15 = EXCLUDED.avg_gold_diff_15,
			avg_cs_diff_15 = EXCLUDED.avg_cs_diff_15,
			avg_kda = EXCLUDED.avg_kda,
			updated_at = NOW()
	`

	_, err := sc.postgresDB.Pool().Exec(ctx, query,
		championID,
		enemyChampionID,
		role,
		winRate,
		sampleSize,
		avgGoldDiff,
		avgCSDiff,
		avgKDA,
	)

	if err != nil {
		return fmt.Errorf("failed to upsert matchup: %w", err)
	}

	sc.logger.Debug("stored matchup", "champion_id", championID, "enemy_id", enemyChampionID, "win_rate", winRate)
	return nil
}

// CalculateItemEfficiency calculates win rate delta per item
func (sc *StatsCalculator) CalculateItemEfficiency(ctx context.Context) error {
	sc.logger.Info("calculating item efficiency")

	query := `
		SELECT
			arrayJoin(splitByString(',', items)) as item_id,
			COUNT(*) as matches,
			SUM(CAST(win AS Int32)) as wins
		FROM viego_matches
		WHERE timestamp >= NOW() - INTERVAL '30 days'
		AND items != ''
		GROUP BY item_id
		HAVING matches > 100
		ORDER BY matches DESC
		LIMIT 200
	`

	rows, err := sc.clickhouse.Conn().Query(ctx, query)
	if err != nil {
		return fmt.Errorf("failed to query item efficiency: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var itemID string
		var matches int
		var wins int

		if err := rows.Scan(&itemID, &matches, &wins); err != nil {
			sc.logger.Error("failed to scan item efficiency row", "error", err)
			continue
		}

		winRate := float32(wins) / float32(matches)
		sc.logger.Debug("item efficiency", "item_id", itemID, "win_rate", winRate, "sample_size", matches)
	}

	return nil
}

// CleanupOldData cleans up old data from databases
func (sc *StatsCalculator) CleanupOldData(ctx context.Context) error {
	sc.logger.Info("cleaning up old data")

	// Delete matches older than 90 days from ClickHouse
	deleteQuery := `ALTER TABLE viego_matches DELETE WHERE timestamp < NOW() - INTERVAL '90 days'`
	if err := sc.clickhouse.Conn().Exec(ctx, deleteQuery); err != nil {
		sc.logger.Error("failed to cleanup old matches", "error", err)
	}

	sc.logger.Info("old data cleanup complete")
	return nil
}
