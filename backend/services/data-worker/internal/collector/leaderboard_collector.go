package collector

import (
	"context"
	"fmt"
	"log/slog"
	"math"
	"sync"
	"time"

	"github.com/4viegomains/backend/pkg/config"
	"github.com/4viegomains/backend/pkg/database"
	"github.com/4viegomains/backend/pkg/nats"
	"github.com/4viegomains/backend/pkg/riot"
)

const (
	// Minimum Viego games to be considered tracked
	MinViegoGamesToTrack = 50

	// Minimum games for OTP detection
	MinGamesForOTP = 50

	// OTP Viego pick rate threshold (60%)
	OTPPickRateThreshold = 0.60
)

// LeaderboardCollector collects leaderboard data and updates tracked players
type LeaderboardCollector struct {
	riotClient *riot.Client
	postgresDB *database.PostgresDB
	nats       *nats.Client
	config     *config.Config
	logger     *slog.Logger
}

// PlayerStats represents player statistics for calculations
type PlayerStats struct {
	Entry          riot.LeagueEntryDTO
	MasteryPoints  int
	ViegoGames     int
	ViegoWins      int
	TotalGames     int
	PUUID          string
	GameName       string
	TagLine        string
}

// NewLeaderboardCollector creates a new leaderboard collector
func NewLeaderboardCollector(
	riotClient *riot.Client,
	postgresDB *database.PostgresDB,
	nats *nats.Client,
	cfg *config.Config,
) *LeaderboardCollector {
	return &LeaderboardCollector{
		riotClient: riotClient,
		postgresDB: postgresDB,
		nats:       nats,
		config:     cfg,
		logger:     slog.Default(),
	}
}

// CollectLeaderboards collects leaderboard data for all regions
func (lc *LeaderboardCollector) CollectLeaderboards(ctx context.Context) error {
	lc.logger.Info("starting leaderboard collection")

	for region := range lc.config.Regions {
		if err := lc.collectRegionLeaderboard(ctx, region); err != nil {
			lc.logger.Error("failed to collect leaderboard for region", "region", region, "error", err)
			continue
		}
	}

	return nil
}

// collectRegionLeaderboard collects leaderboard for a specific region
func (lc *LeaderboardCollector) collectRegionLeaderboard(ctx context.Context, region string) error {
	platformID := region

	lc.logger.Info("collecting leaderboard", "region", region)

	// Fetch all tier leagues
	var allPlayers []riot.LeagueEntryDTO

	// Challenger
	if league, err := lc.riotClient.GetChallengerLeague(ctx, platformID); err == nil && league != nil {
		allPlayers = append(allPlayers, league.Entries...)
	}

	// Grandmaster
	if league, err := lc.riotClient.GetGrandmasterLeague(ctx, platformID); err == nil && league != nil {
		allPlayers = append(allPlayers, league.Entries...)
	}

	// Master
	if league, err := lc.riotClient.GetMasterLeague(ctx, platformID); err == nil && league != nil {
		allPlayers = append(allPlayers, league.Entries...)
	}

	lc.logger.Info("fetched leaderboard players", "region", region, "count", len(allPlayers))

	// Process players concurrently
	semaphore := make(chan struct{}, MaxConcurrentPlayers)
	var wg sync.WaitGroup

	for _, entry := range allPlayers {
		wg.Add(1)
		go func(player riot.LeagueEntryDTO) {
			defer wg.Done()
			semaphore <- struct{}{}
			defer func() { <-semaphore }()

			stats, err := lc.fetchPlayerStats(ctx, platformID, player)
			if err != nil {
				lc.logger.Error("failed to fetch player stats", "summoner", player.SummonerName, "error", err)
				return
			}

			// Only track if has enough Viego games
			if stats.ViegoGames >= MinViegoGamesToTrack {
				if err := lc.updateTrackedPlayer(ctx, platformID, stats); err != nil {
					lc.logger.Error("failed to update tracked player", "puuid", stats.PUUID, "error", err)
				}
			}
		}(entry)
	}

	wg.Wait()

	// Publish event
	if err := lc.nats.PublishLeaderboardUpdated(region); err != nil {
		lc.logger.Error("failed to publish leaderboard updated event", "region", region, "error", err)
	}

	lc.logger.Info("completed leaderboard collection", "region", region)
	return nil
}

// fetchPlayerStats fetches and calculates player statistics
func (lc *LeaderboardCollector) fetchPlayerStats(ctx context.Context, platformID string, entry riot.LeagueEntryDTO) (*PlayerStats, error) {
	// Get summoner details
	summoner, err := lc.riotClient.GetSummonerByPUUID(ctx, platformID, "")
	if err != nil {
		return nil, fmt.Errorf("failed to get summoner: %w", err)
	}

	stats := &PlayerStats{
		Entry:      entry,
		PUUID:      summoner.PUUID,
		GameName:   summoner.Name,
		TagLine:    "",
		TotalGames: entry.Wins + entry.Losses,
	}

	// Get Viego mastery
	mastery, err := lc.riotClient.GetChampionMasteryByChampion(ctx, platformID, entry.SummonerID, ViegoChampionID)
	if err == nil && mastery != nil {
		stats.MasteryPoints = mastery.ChampionPoints
		// Estimate Viego games from mastery (rough approximation)
		// Average ~100-150 points per game
		stats.ViegoGames = mastery.ChampionPoints / 125
	}

	return stats, nil
}

// updateTrackedPlayer updates or inserts a tracked player in PostgreSQL
func (lc *LeaderboardCollector) updateTrackedPlayer(ctx context.Context, platformID string, stats *PlayerStats) error {
	tx, err := lc.postgresDB.Pool().Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to start transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Upsert into tracked_players
	query := `
		INSERT INTO tracked_players (
			puuid, summoner_id, game_name, tag_line, platform_id,
			summoner_level, tier, rank, league_points,
			viego_games, viego_wins, viego_mastery_points,
			total_games, otp_score,
			created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW())
		ON CONFLICT (puuid) DO UPDATE SET
			game_name = EXCLUDED.game_name,
			tag_line = EXCLUDED.tag_line,
			viego_games = EXCLUDED.viego_games,
			viego_wins = EXCLUDED.viego_wins,
			viego_mastery_points = EXCLUDED.viego_mastery_points,
			total_games = EXCLUDED.total_games,
			otp_score = EXCLUDED.otp_score,
			tier = EXCLUDED.tier,
			rank = EXCLUDED.rank,
			league_points = EXCLUDED.league_points,
			updated_at = NOW()
	`

	// Calculate OTP score
	otpScore := lc.calculateOTPScore(stats)

	viegoWins := 0
	if stats.TotalGames > 0 {
		viegoWins = int(float64(stats.ViegoGames) * 0.5) // Rough estimate
	}

	err = tx.Exec(ctx, query,
		stats.PUUID,
		stats.Entry.SummonerID,
		stats.GameName,
		stats.TagLine,
		platformID,
		0, // summoner_level will be updated elsewhere
		stats.Entry.Tier,
		stats.Entry.Rank,
		stats.Entry.LeaguePoints,
		stats.ViegoGames,
		viegoWins,
		stats.MasteryPoints,
		stats.TotalGames,
		otpScore,
	)

	if err != nil {
		return fmt.Errorf("failed to upsert tracked player: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	lc.logger.Debug("updated tracked player", "puuid", stats.PUUID, "game_name", stats.GameName)
	return nil
}

// calculateOTPScore calculates a composite OTP score
func (lc *LeaderboardCollector) calculateOTPScore(stats *PlayerStats) float32 {
	score := float32(0)

	// Elo weight component (20%)
	eloWeight := lc.calculateEloWeight(stats.Entry.Tier)
	score += eloWeight * 0.20

	// Viego dedication component (40%)
	if stats.TotalGames > 0 {
		viegoDedication := float32(stats.ViegoGames) / float32(stats.TotalGames)
		score += viegoDedication * 0.40
	}

	// Mastery component (20%)
	masteryComponent := float32(math.Min(float64(stats.MasteryPoints)/1000000*20, 20))
	score += masteryComponent * 0.20

	// Games played component (20%)
	gamesComponent := float32(math.Min(math.Log2(float64(stats.ViegoGames)+1)*3, 20))
	score += gamesComponent * 0.20

	// Cap at 100
	if score > 100 {
		score = 100
	}

	return score
}

// calculateEloWeight calculates the weight for a given tier
func (lc *LeaderboardCollector) calculateEloWeight(tier string) float32 {
	switch tier {
	case "CHALLENGER":
		return 10
	case "GRANDMASTER":
		return 8
	case "MASTER":
		return 6
	case "DIAMOND":
		return 4
	case "EMERALD":
		return 3
	case "PLATINUM":
		return 2
	default:
		return 1
	}
}

// DetectOTPs detects one-trick players with high Viego pick rate
func (lc *LeaderboardCollector) DetectOTPs(ctx context.Context) error {
	lc.logger.Info("detecting OTP players")

	// Query for players with pick rate > 60%
	query := `
		SELECT puuid, game_name, tag_line, platform_id, viego_games, total_games, otp_score
		FROM tracked_players
		WHERE total_games >= $1
		AND (viego_games::float / total_games) > $2
		AND updated_at > NOW() - INTERVAL '1 day'
		ORDER BY otp_score DESC
		LIMIT 1000
	`

	rows, err := lc.postgresDB.Pool().Query(ctx, query, MinGamesForOTP, OTPPickRateThreshold)
	if err != nil {
		return fmt.Errorf("failed to query OTP players: %w", err)
	}
	defer rows.Close()

	otpCount := 0
	for rows.Next() {
		otpCount++
	}

	lc.logger.Info("detected OTP players", "count", otpCount)
	return nil
}
