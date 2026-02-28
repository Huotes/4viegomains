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
	// ViegoChampionID is the champion ID for Viego
	ViegoChampionID = 234

	// QUEUEID_SOLOQUEUE is the queue ID for Solo Queue (5v5 Ranked)
	QueueIDSoloQueue = 420

	// Maximum concurrent players to fetch matches from
	MaxConcurrentPlayers = 5
)

// MatchCollector collects match data from Riot API
type MatchCollector struct {
	riotClient *riot.Client
	postgresDB *database.PostgresDB
	clickhouse *database.ClickHouseDB
	redis      *database.RedisDB
	nats       *nats.Client
	config     *config.Config
	logger     *slog.Logger
}

// NewMatchCollector creates a new match collector
func NewMatchCollector(
	riotClient *riot.Client,
	postgresDB *database.PostgresDB,
	clickhouse *database.ClickHouseDB,
	redis *database.RedisDB,
	nats *nats.Client,
	cfg *config.Config,
) *MatchCollector {
	return &MatchCollector{
		riotClient: riotClient,
		postgresDB: postgresDB,
		clickhouse: clickhouse,
		redis:      redis,
		nats:       nats,
		config:     cfg,
		logger:     slog.Default(),
	}
}

// CollectHighEloMatches collects matches from Challenger, Grandmaster, and Master tier players
func (mc *MatchCollector) CollectHighEloMatches(ctx context.Context) error {
	mc.logger.Info("starting high elo match collection")

	for region := range mc.config.Regions {
		if err := mc.collectMatchesForRegion(ctx, region, []string{"CHALLENGER", "GRANDMASTER", "MASTER"}); err != nil {
			mc.logger.Error("failed to collect matches for region", "region", region, "error", err)
			continue
		}
	}

	return nil
}

// CollectAllEloMatches collects matches from Diamond, Emerald, and Platinum tier players
func (mc *MatchCollector) CollectAllEloMatches(ctx context.Context) error {
	mc.logger.Info("starting all elo match collection")

	for region := range mc.config.Regions {
		if err := mc.collectMatchesForRegion(ctx, region, []string{"DIAMOND", "EMERALD", "PLATINUM"}); err != nil {
			mc.logger.Error("failed to collect matches for region", "region", region, "error", err)
			continue
		}
	}

	return nil
}

// collectMatchesForRegion collects matches for a specific region and tiers
func (mc *MatchCollector) collectMatchesForRegion(ctx context.Context, region string, tiers []string) error {
	platformID := region
	cluster, err := mc.config.GetClusterForPlatform(platformID)
	if err != nil {
		return err
	}

	mc.logger.Info("collecting matches", "region", region, "tiers", tiers)

	allPlayers := make([]riot.LeagueEntryDTO, 0)

	// Fetch league entries for each tier
	for _, tier := range tiers {
		var leagueList *riot.LeagueListDTO
		var fetchErr error

		switch tier {
		case "CHALLENGER":
			leagueList, fetchErr = mc.riotClient.GetChallengerLeague(ctx, platformID)
		case "GRANDMASTER":
			leagueList, fetchErr = mc.riotClient.GetGrandmasterLeague(ctx, platformID)
		case "MASTER":
			leagueList, fetchErr = mc.riotClient.GetMasterLeague(ctx, platformID)
		default:
			continue
		}

		if fetchErr != nil {
			mc.logger.Error("failed to fetch league", "region", region, "tier", tier, "error", fetchErr)
			continue
		}

		if leagueList != nil {
			allPlayers = append(allPlayers, leagueList.Entries...)
		}
	}

	mc.logger.Info("fetched players", "region", region, "count", len(allPlayers))

	// Process players concurrently with a semaphore
	semaphore := make(chan struct{}, MaxConcurrentPlayers)
	var wg sync.WaitGroup

	for _, entry := range allPlayers {
		wg.Add(1)
		go func(player riot.LeagueEntryDTO) {
			defer wg.Done()
			semaphore <- struct{}{}
			defer func() { <-semaphore }()

			if err := mc.collectPlayerMatches(ctx, platformID, cluster, player); err != nil {
				mc.logger.Error("failed to collect player matches", "summoner_id", player.SummonerID, "error", err)
			}
		}(entry)
	}

	wg.Wait()
	mc.logger.Info("completed match collection for region", "region", region)
	return nil
}

// collectPlayerMatches collects matches for a specific player
func (mc *MatchCollector) collectPlayerMatches(ctx context.Context, platformID, cluster string, entry riot.LeagueEntryDTO) error {
	// Get summoner details
	summoner, err := mc.riotClient.GetSummonerByPUUID(ctx, platformID, "")
	if err != nil {
		return fmt.Errorf("failed to get summoner: %w", err)
	}

	// Fetch match list
	matches, err := mc.riotClient.GetMatchList(ctx, cluster, summoner.PUUID, 0, 20)
	if err != nil {
		return fmt.Errorf("failed to get match list: %w", err)
	}

	mc.logger.Debug("fetched matches", "player", summoner.Name, "match_count", len(matches))

	for _, matchID := range matches {
		select {
		case <-ctx.Done():
			return ctx.Err()
		default:
		}

		// Check if match already collected
		collected, err := mc.isMatchCollected(ctx, matchID)
		if err != nil {
			mc.logger.Error("failed to check match collection status", "match_id", matchID, "error", err)
			continue
		}

		if collected {
			mc.logger.Debug("match already collected", "match_id", matchID)
			continue
		}

		// Fetch match details and timeline
		matchDetail, err := mc.riotClient.GetMatchDetail(ctx, cluster, matchID)
		if err != nil {
			mc.logger.Error("failed to get match detail", "match_id", matchID, "error", err)
			continue
		}

		matchTimeline, err := mc.riotClient.GetMatchTimeline(ctx, cluster, matchID)
		if err != nil {
			mc.logger.Error("failed to get match timeline", "match_id", matchID, "error", err)
			continue
		}

		// Extract Viego participant
		viegoParticipant := mc.extractViegoParticipant(matchDetail)
		if viegoParticipant == nil {
			continue
		}

		// Process match
		if err := mc.processMatch(ctx, matchDetail, matchTimeline, viegoParticipant); err != nil {
			mc.logger.Error("failed to process match", "match_id", matchID, "error", err)
			continue
		}

		// Mark as collected
		if err := mc.markMatchCollected(ctx, matchID); err != nil {
			mc.logger.Error("failed to mark match as collected", "match_id", matchID, "error", err)
		}

		// Publish event
		if err := mc.nats.PublishMatchCollected(matchID, viegoParticipant.PUUID, platformID); err != nil {
			mc.logger.Error("failed to publish match collected event", "match_id", matchID, "error", err)
		}
	}

	return nil
}

// extractViegoParticipant extracts the Viego player from match participants
func (mc *MatchCollector) extractViegoParticipant(match *riot.MatchDTO) *riot.ParticipantDTO {
	for i := range match.Info.Participants {
		if match.Info.Participants[i].ChampionID == ViegoChampionID {
			return &match.Info.Participants[i]
		}
	}
	return nil
}

// determineRole determines the role from participant and timeline data
func (mc *MatchCollector) determineRole(participant *riot.ParticipantDTO) string {
	if participant.Role != "" {
		return participant.Role
	}
	if participant.Lane != "" {
		return participant.Lane
	}
	return "UNKNOWN"
}

// extractBuildPath extracts the ordered item build path
func (mc *MatchCollector) extractBuildPath(participant *riot.ParticipantDTO) []int {
	var items []int
	for i := 0; i < 7; i++ {
		if participant.Items[i] != 0 {
			items = append(items, participant.Items[i])
		}
	}
	return items
}

// extractTimelineData extracts gold and CS at specific timepoints
func (mc *MatchCollector) extractTimelineData(timeline *riot.MatchTimelineDTO, participantID int) map[string]int {
	data := map[string]int{
		"gold_10":  0,
		"cs_10":    0,
		"gold_15":  0,
		"cs_15":    0,
	}

	pidStr := fmt.Sprintf("%d", participantID)

	for _, frame := range timeline.Info.Frames {
		timeMs := frame.Timestamp
		timeMin := timeMs / 60000

		// Extract data at 10 minutes
		if timeMin >= 10 && data["gold_10"] == 0 {
			if pf, ok := frame.ParticipantFrames[pidStr]; ok {
				data["gold_10"] = pf.ParticipantScore
				data["cs_10"] = pf.MinionsKilled
			}
		}

		// Extract data at 15 minutes
		if timeMin >= 15 && data["gold_15"] == 0 {
			if pf, ok := frame.ParticipantFrames[pidStr]; ok {
				data["gold_15"] = pf.ParticipantScore
				data["cs_15"] = pf.MinionsKilled
			}
		}

		if data["gold_10"] > 0 && data["gold_15"] > 0 {
			break
		}
	}

	return data
}

// processMatch processes and inserts match data into ClickHouse
func (mc *MatchCollector) processMatch(ctx context.Context, match *riot.MatchDTO, timeline *riot.MatchTimelineDTO, participant *riot.ParticipantDTO) error {
	role := mc.determineRole(participant)
	buildPath := mc.extractBuildPath(participant)
	timelineData := mc.extractTimelineData(timeline, participant.ParticipantID)

	// Build items string
	itemsStr := ""
	for i, item := range buildPath {
		if i > 0 {
			itemsStr += ","
		}
		itemsStr += fmt.Sprintf("%d", item)
	}

	// Build runes array
	runesStr := ""
	if len(participant.Runes) > 0 {
		for i, rune := range participant.Runes {
			if i > 0 {
				runesStr += ","
			}
			runesStr += fmt.Sprintf("%d", rune.ID)
		}
	}

	// Insert into ClickHouse
	query := `
		INSERT INTO viego_matches (
			match_id, platform_id, puuid, summoner_name,
			timestamp, game_duration, game_mode, queue_id,
			champion_id, role, lane, team_id, win,
			kills, deaths, assists, kda,
			gold_earned, cs_total, cs_per_minute,
			gold_10, cs_10, gold_15, cs_15,
			damage_dealt, damage_taken, healing, vision_score,
			items, runes,
			summoner_spell_1, summoner_spell_2,
			created_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	kda := float32(0)
	if participant.Deaths > 0 {
		kda = float32(participant.Kills+participant.Assists) / float32(participant.Deaths)
	} else {
		kda = float32(participant.Kills + participant.Assists)
	}

	csPerMin := 0.0
	if match.Info.GameDuration > 0 {
		csPerMin = float64(participant.TotalMinionsKilled) / (float64(match.Info.GameDuration) / 60)
	}

	err := mc.clickhouse.Conn().Exec(ctx, query,
		match.Metadata.MatchID,
		match.Info.PlatformID,
		participant.PUUID,
		participant.SummonerName,
		time.Unix(match.Info.GameStartTime/1000, 0),
		match.Info.GameDuration,
		match.Info.GameMode,
		match.Info.Queue,
		ViegoChampionID,
		role,
		participant.Lane,
		participant.TeamID,
		participant.Win,
		participant.Kills,
		participant.Deaths,
		participant.Assists,
		kda,
		participant.GoldEarned,
		participant.TotalMinionsKilled,
		csPerMin,
		timelineData["gold_10"],
		timelineData["cs_10"],
		timelineData["gold_15"],
		timelineData["cs_15"],
		participant.TotalDamageDealtToChampions,
		participant.TotalDamageTaken,
		participant.TotalHeal,
		participant.VisionScore,
		itemsStr,
		runesStr,
		participant.Spell1ID,
		participant.Spell2ID,
		time.Now(),
	)

	if err != nil {
		return fmt.Errorf("failed to insert match data: %w", err)
	}

	mc.logger.Debug("processed match", "match_id", match.Metadata.MatchID, "player", participant.SummonerName)
	return nil
}

// isMatchCollected checks if a match has already been collected
func (mc *MatchCollector) isMatchCollected(ctx context.Context, matchID string) (bool, error) {
	key := fmt.Sprintf("collected:matches:%s", matchID)
	val, err := mc.redis.Client().Get(ctx, key).Result()
	if err != nil {
		if err.Error() == "redis: nil" {
			return false, nil
		}
		return false, err
	}
	return val == "1", nil
}

// markMatchCollected marks a match as collected in Redis
func (mc *MatchCollector) markMatchCollected(ctx context.Context, matchID string) error {
	key := fmt.Sprintf("collected:matches:%s", matchID)
	return mc.redis.Client().Set(ctx, key, "1", 7*24*time.Hour).Err() // 7 days TTL
}
