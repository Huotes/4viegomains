package repository

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/4viegomains/backend/pkg/database"
	"github.com/4viegomains/backend/services/champion-svc/internal/model"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ChampionRepository handles database operations for champion data
type ChampionRepository struct {
	pool *pgxpool.Pool
}

// NewChampionRepository creates a new ChampionRepository
func NewChampionRepository(db *database.PostgresDB) *ChampionRepository {
	return &ChampionRepository{
		pool: db.Pool(),
	}
}

// GetBuilds retrieves builds for a given role, ELO tier, and patch
func (r *ChampionRepository) GetBuilds(ctx context.Context, role, elo, patch string, limit int) ([]model.BuildData, error) {
	logger := slog.Default()

	query := `
		SELECT id, patch, role, elo_tier, build_path, win_rate, pick_rate,
		       sample_size, avg_kda, avg_game_length, skill_order, summoner_spells
		FROM viego_builds
		WHERE role = $1 AND elo_tier = $2
	`

	args := []interface{}{role, elo}

	if patch != "" {
		query += " AND patch = $3"
		args = append(args, patch)
	}

	query += " ORDER BY (win_rate * LOG(sample_size)) DESC LIMIT $" + itoa(len(args)+1)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		logger.Error("failed to query builds", "error", err)
		return nil, err
	}
	defer rows.Close()

	var builds []model.BuildData
	for rows.Next() {
		var build model.BuildData
		if err := rows.Scan(
			&build.ID, &build.Patch, &build.Role, &build.EloTier,
			&build.BuildPath, &build.WinRate, &build.PickRate,
			&build.SampleSize, &build.AvgKDA, &build.AvgGameLength,
			&build.SkillOrder, &build.SummonerSpells,
		); err != nil {
			logger.Error("failed to scan build row", "error", err)
			continue
		}
		builds = append(builds, build)
	}

	return builds, rows.Err()
}

// GetRunes retrieves rune pages for a given role, ELO tier, and patch
func (r *ChampionRepository) GetRunes(ctx context.Context, role, elo, patch string, limit int) ([]model.RunePageData, error) {
	logger := slog.Default()

	query := `
		SELECT id, patch, role, elo_tier, primary_tree, primary_runes,
		       secondary_tree, secondary_runes, stat_shards, win_rate, pick_rate, sample_size
		FROM viego_runes
		WHERE role = $1 AND elo_tier = $2
	`

	args := []interface{}{role, elo}

	if patch != "" {
		query += " AND patch = $3"
		args = append(args, patch)
	}

	query += " ORDER BY win_rate DESC LIMIT $" + itoa(len(args)+1)
	args = append(args, limit)

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		logger.Error("failed to query runes", "error", err)
		return nil, err
	}
	defer rows.Close()

	var runes []model.RunePageData
	for rows.Next() {
		var rune model.RunePageData
		if err := rows.Scan(
			&rune.ID, &rune.Patch, &rune.Role, &rune.EloTier,
			&rune.PrimaryTree, &rune.PrimaryRunes,
			&rune.SecondaryTree, &rune.SecondaryRunes,
			&rune.StatShards, &rune.WinRate, &rune.PickRate, &rune.SampleSize,
		); err != nil {
			logger.Error("failed to scan rune row", "error", err)
			continue
		}
		runes = append(runes, rune)
	}

	return runes, rows.Err()
}

// GetMatchup retrieves matchup data for a specific enemy champion
func (r *ChampionRepository) GetMatchup(ctx context.Context, role, elo string, enemyChampion int) (model.MatchupData, error) {
	logger := slog.Default()

	query := `
		SELECT id, patch, role, elo_tier, enemy_champion, win_rate, sample_size,
		       avg_kda, gold_diff_15, cs_diff_15, tips
		FROM viego_matchups
		WHERE role = $1 AND elo_tier = $2 AND enemy_champion = $3
		ORDER BY sample_size DESC
		LIMIT 1
	`

	var matchup model.MatchupData
	err := r.pool.QueryRow(ctx, query, role, elo, enemyChampion).Scan(
		&matchup.ID, &matchup.Patch, &matchup.Role, &matchup.EloTier,
		&matchup.EnemyChampion, &matchup.WinRate, &matchup.SampleSize,
		&matchup.AvgKDA, &matchup.GoldDiff15, &matchup.CSDiff15, &matchup.Tips,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			logger.Debug("no matchup found", "role", role, "elo", elo, "enemy", enemyChampion)
			return matchup, nil
		}
		logger.Error("failed to query matchup", "error", err)
		return matchup, err
	}

	return matchup, nil
}

// GetAllMatchups retrieves all matchups for a given role
func (r *ChampionRepository) GetAllMatchups(ctx context.Context, role, elo string) ([]model.MatchupData, error) {
	logger := slog.Default()

	query := `
		SELECT id, patch, role, elo_tier, enemy_champion, win_rate, sample_size,
		       avg_kda, gold_diff_15, cs_diff_15, tips
		FROM viego_matchups
		WHERE role = $1 AND elo_tier = $2
		ORDER BY sample_size DESC
	`

	rows, err := r.pool.Query(ctx, query, role, elo)
	if err != nil {
		logger.Error("failed to query all matchups", "error", err)
		return nil, err
	}
	defer rows.Close()

	var matchups []model.MatchupData
	for rows.Next() {
		var matchup model.MatchupData
		if err := rows.Scan(
			&matchup.ID, &matchup.Patch, &matchup.Role, &matchup.EloTier,
			&matchup.EnemyChampion, &matchup.WinRate, &matchup.SampleSize,
			&matchup.AvgKDA, &matchup.GoldDiff15, &matchup.CSDiff15, &matchup.Tips,
		); err != nil {
			logger.Error("failed to scan matchup row", "error", err)
			continue
		}
		matchups = append(matchups, matchup)
	}

	return matchups, rows.Err()
}

// GetMetaStats retrieves meta statistics for a given role
func (r *ChampionRepository) GetMetaStats(ctx context.Context, role, elo string) (model.MetaStatsData, error) {
	logger := slog.Default()

	query := `
		SELECT id, patch, role, elo_tier, win_rate, pick_rate, ban_rate,
		       avg_kda, avg_cs_min, avg_gold_min, avg_damage_min, avg_vision,
		       tier_rank, total_games, snapshot_date
		FROM viego_meta_stats
		WHERE role = $1 AND elo_tier = $2
		ORDER BY snapshot_date DESC
		LIMIT 1
	`

	var stats model.MetaStatsData
	err := r.pool.QueryRow(ctx, query, role, elo).Scan(
		&stats.ID, &stats.Patch, &stats.Role, &stats.EloTier,
		&stats.WinRate, &stats.PickRate, &stats.BanRate,
		&stats.AvgKDA, &stats.AvgCSMin, &stats.AvgGoldMin,
		&stats.AvgDamageMin, &stats.AvgVision,
		&stats.TierRank, &stats.TotalGames, &stats.SnapshotDate,
	)

	if err != nil {
		if err == pgx.ErrNoRows {
			logger.Debug("no meta stats found", "role", role, "elo", elo)
			return stats, nil
		}
		logger.Error("failed to query meta stats", "error", err)
		return stats, err
	}

	return stats, nil
}

// GetLatestPatch returns the most recent patch version
func (r *ChampionRepository) GetLatestPatch(ctx context.Context) (string, error) {
	logger := slog.Default()

	query := `
		SELECT patch FROM viego_builds
		ORDER BY patch DESC
		LIMIT 1
	`

	var patch string
	err := r.pool.QueryRow(ctx, query).Scan(&patch)
	if err != nil {
		if err == pgx.ErrNoRows {
			logger.Debug("no patches found")
			return "", nil
		}
		logger.Error("failed to query latest patch", "error", err)
		return "", err
	}

	return patch, nil
}

// itoa converts an integer to a string for use in query building
func itoa(n int) string {
	return fmt.Sprintf("%d", n)
}
