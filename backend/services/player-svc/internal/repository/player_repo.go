package repository

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/4viegomains/backend/pkg/models"
)

// PlayerRepository handles database access for player data
type PlayerRepository struct {
	pgPool *pgxpool.Pool
	chConn driver.Conn
}

// NewPlayerRepository creates a new player repository
func NewPlayerRepository(pgPool *pgxpool.Pool, chConn driver.Conn) *PlayerRepository {
	return &PlayerRepository{
		pgPool: pgPool,
		chConn: chConn,
	}
}

// GetTrackedPlayer retrieves a tracked player from PostgreSQL
func (r *PlayerRepository) GetTrackedPlayer(ctx context.Context, puuid string) (*models.TrackedPlayer, error) {
	var player models.TrackedPlayer
	err := r.pgPool.QueryRow(ctx, `
		SELECT id, puuid, summoner_id, game_name, tag_line, platform_id, summoner_level, profile_icon, created_at, updated_at
		FROM tracked_players
		WHERE puuid = $1
	`, puuid).Scan(
		&player.ID, &player.PUUID, &player.SummonerID, &player.GameName, &player.TagLine,
		&player.PlatformID, &player.SummonerLevel, &player.ProfileIcon, &player.CreatedAt, &player.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get tracked player: %w", err)
	}
	return &player, nil
}

// UpsertTrackedPlayer inserts or updates a tracked player
func (r *PlayerRepository) UpsertTrackedPlayer(ctx context.Context, player *models.TrackedPlayer) error {
	query := `
		INSERT INTO tracked_players (puuid, summoner_id, game_name, tag_line, platform_id, summoner_level, profile_icon, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
		ON CONFLICT (puuid) DO UPDATE SET
			summoner_id = $2,
			game_name = $3,
			tag_line = $4,
			platform_id = $5,
			summoner_level = $6,
			profile_icon = $7,
			updated_at = CURRENT_TIMESTAMP
		RETURNING id, created_at, updated_at
	`
	err := r.pgPool.QueryRow(ctx, query,
		player.PUUID, player.SummonerID, player.GameName, player.TagLine,
		player.PlatformID, player.SummonerLevel, player.ProfileIcon,
	).Scan(&player.ID, &player.CreatedAt, &player.UpdatedAt)

	if err != nil {
		return fmt.Errorf("failed to upsert tracked player: %w", err)
	}
	return nil
}

// GetViegoMatches retrieves Viego matches for a player from ClickHouse
func (r *PlayerRepository) GetViegoMatches(ctx context.Context, puuid string, limit, offset int) ([]models.MatchSummary, error) {
	query := `
		SELECT
			match_id, game_creation, game_duration, win, kills, deaths, assists,
			cs, gold_earned, damage_dealt, vision_score, role, items, runes, enemy_champion
		FROM viego_matches
		WHERE puuid = $1 AND champion_id = 234
		ORDER BY game_creation DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.chConn.Query(ctx, query, puuid, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query viego matches: %w", err)
	}
	defer rows.Close()

	var matches []models.MatchSummary
	for rows.Next() {
		var match models.MatchSummary
		var gameCreation int64
		var items, runes string

		if err := rows.Scan(
			&match.MatchID, &gameCreation, &match.GameDuration, &match.Win,
			&match.Kills, &match.Deaths, &match.Assists, &match.CreepScore,
			&match.GoldEarned, &match.DamageDealt, &match.VisionScore,
			&match.Role, &items, &runes, &match.ChampionName,
		); err != nil {
			return nil, fmt.Errorf("failed to scan match: %w", err)
		}

		match.Timestamp = gameCreation
		match.ChampionID = 234
		match.ChampionName = "Viego"
		matches = append(matches, match)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error reading matches: %w", err)
	}

	return matches, nil
}

// GetViegoMatchCount returns the total count of Viego matches for a player
func (r *PlayerRepository) GetViegoMatchCount(ctx context.Context, puuid string) (int, error) {
	query := `
		SELECT COUNT(*) FROM viego_matches
		WHERE puuid = $1 AND champion_id = 234
	`

	var count int
	if err := r.chConn.QueryRow(ctx, query, puuid).Scan(&count); err != nil {
		return 0, fmt.Errorf("failed to get match count: %w", err)
	}
	return count, nil
}

// GetRecentViegoStats retrieves aggregated stats from recent Viego matches
func (r *PlayerRepository) GetRecentViegoStats(ctx context.Context, puuid string, lastNGames int) (*models.ViegoStats, error) {
	query := `
		SELECT
			COUNT(*) as total_matches,
			SUM(CASE WHEN win = true THEN 1 ELSE 0 END) as wins,
			AVG(kills) as avg_kills,
			AVG(deaths) as avg_deaths,
			AVG(assists) as avg_assists,
			AVG(gold_earned / (game_duration / 60)) as avg_gold_pm,
			AVG(cs / (game_duration / 60)) as avg_cs_pm,
			AVG(vision_score) as avg_vision_score
		FROM viego_matches
		WHERE puuid = $1 AND champion_id = 234
		ORDER BY game_creation DESC
		LIMIT $2
	`

	stats := &models.ViegoStats{}
	var totalMatches, wins int
	var avgKills, avgDeaths, avgAssists, avgGoldPM, avgCSPM, avgVisionScore float32

	if err := r.chConn.QueryRow(ctx, query, puuid, lastNGames).Scan(
		&totalMatches, &wins, &avgKills, &avgDeaths, &avgAssists,
		&avgGoldPM, &avgCSPM, &avgVisionScore,
	); err != nil {
		slog.Default().Warn("failed to get viego stats", "error", err)
		return stats, nil
	}

	stats.TotalMatches = totalMatches
	stats.AvgKills = avgKills
	stats.AvgDeaths = avgDeaths
	stats.AvgAssists = avgAssists
	stats.AvgGoldPM = avgGoldPM
	stats.AvgCSPM = avgCSPM
	stats.AvgVisionScore = avgVisionScore

	if totalMatches > 0 {
		stats.WinRate = float32(wins) / float32(totalMatches) * 100
		if avgDeaths > 0 {
			stats.AvgKDA = (avgKills + avgAssists) / avgDeaths
		} else {
			stats.AvgKDA = avgKills + avgAssists
		}
	}

	return stats, nil
}

// GetViegoMatchesByRole retrieves matches grouped by role with aggregate stats
func (r *PlayerRepository) GetViegoMatchesByRole(ctx context.Context, puuid string) (map[string]*models.ViegoStats, error) {
	query := `
		SELECT
			role,
			COUNT(*) as total_matches,
			SUM(CASE WHEN win = true THEN 1 ELSE 0 END) as wins,
			AVG(kills) as avg_kills,
			AVG(deaths) as avg_deaths,
			AVG(assists) as avg_assists,
			AVG(gold_earned / (game_duration / 60)) as avg_gold_pm,
			AVG(cs / (game_duration / 60)) as avg_cs_pm,
			AVG(vision_score) as avg_vision_score
		FROM viego_matches
		WHERE puuid = $1 AND champion_id = 234
		GROUP BY role
	`

	rows, err := r.chConn.Query(ctx, query, puuid)
	if err != nil {
		return nil, fmt.Errorf("failed to query matches by role: %w", err)
	}
	defer rows.Close()

	roleStats := make(map[string]*models.ViegoStats)
	for rows.Next() {
		var role string
		var totalMatches, wins int
		var avgKills, avgDeaths, avgAssists, avgGoldPM, avgCSPM, avgVisionScore float32

		if err := rows.Scan(
			&role, &totalMatches, &wins, &avgKills, &avgDeaths, &avgAssists,
			&avgGoldPM, &avgCSPM, &avgVisionScore,
		); err != nil {
			return nil, fmt.Errorf("failed to scan role stats: %w", err)
		}

		stats := &models.ViegoStats{
			TotalMatches:   totalMatches,
			AvgKills:       avgKills,
			AvgDeaths:      avgDeaths,
			AvgAssists:     avgAssists,
			AvgGoldPM:      avgGoldPM,
			AvgCSPM:        avgCSPM,
			AvgVisionScore: avgVisionScore,
		}

		if totalMatches > 0 {
			stats.WinRate = float32(wins) / float32(totalMatches) * 100
			if avgDeaths > 0 {
				stats.AvgKDA = (avgKills + avgAssists) / avgDeaths
			} else {
				stats.AvgKDA = avgKills + avgAssists
			}
		}

		roleStats[role] = stats
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error reading role stats: %w", err)
	}

	return roleStats, nil
}

// GetMatchByID retrieves a single match from PostgreSQL
func (r *PlayerRepository) GetMatchByID(ctx context.Context, matchID string) error {
	query := `
		SELECT match_id FROM matches WHERE match_id = $1
	`
	var id string
	err := r.pgPool.QueryRow(ctx, query, matchID).Scan(&id)
	if err != nil {
		return fmt.Errorf("failed to get match: %w", err)
	}
	return nil
}
