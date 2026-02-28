package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"time"

	"github.com/4viegomains/backend/pkg/database"
	"github.com/4viegomains/backend/pkg/models"
	"github.com/4viegomains/backend/services/player-svc/internal/repository"
)

const (
	viegoChampionID   = 234
	profileCacheTTL   = 5 * time.Minute
	riotGatewayURL    = "http://localhost:8081"
)

// ProfileService handles player profile operations
type ProfileService struct {
	repo              *repository.PlayerRepository
	riotGatewayClient *http.Client
	redis             *database.RedisDB
	logger            *slog.Logger
}

// NewProfileService creates a new profile service
func NewProfileService(
	repo *repository.PlayerRepository,
	riotGatewayClient *http.Client,
	redis *database.RedisDB,
	logger *slog.Logger,
) *ProfileService {
	return &ProfileService{
		repo:              repo,
		riotGatewayClient: riotGatewayClient,
		redis:             redis,
		logger:            logger,
	}
}

// GetPlayerProfile retrieves a player's full profile
func (ps *ProfileService) GetPlayerProfile(ctx context.Context, region, name, tag string) (*models.PlayerProfile, error) {
	// Check cache
	cacheKey := fmt.Sprintf("player:profile:%s:%s:%s", region, name, tag)
	cachedProfile := &models.PlayerProfile{}
	if err := ps.redis.GetJSON(ctx, cacheKey, cachedProfile); err == nil {
		ps.logger.Debug("profile cache hit", "region", region, "name", name)
		return cachedProfile, nil
	}

	// Get PUUID from riot-gateway
	puuid, summoner, err := ps.resolvePUUID(ctx, region, name, tag)
	if err != nil {
		return nil, fmt.Errorf("failed to resolve puuid: %w", err)
	}

	// Get league info
	league, err := ps.getLeagueInfo(ctx, puuid, region)
	if err != nil {
		ps.logger.Warn("failed to get league info", "error", err)
	}

	// Get mastery info
	mastery, err := ps.getMasteryInfo(ctx, puuid, region)
	if err != nil {
		ps.logger.Warn("failed to get mastery info", "error", err)
	}

	// Get recent matches
	matches, err := ps.repo.GetViegoMatches(ctx, puuid, 20, 0)
	if err != nil {
		ps.logger.Warn("failed to get matches", "error", err)
	}

	// Get viego stats
	viegoStats, err := ps.repo.GetRecentViegoStats(ctx, puuid, 20)
	if err != nil {
		ps.logger.Warn("failed to get viego stats", "error", err)
	}

	// Build profile
	trackedPlayer := &models.TrackedPlayer{
		PUUID:        puuid,
		GameName:     name,
		TagLine:      tag,
		PlatformID:   region,
		SummonerID:   summoner.SummonerID,
		SummonerLevel: summoner.Level,
		ProfileIcon:  summoner.ProfileIconID,
	}

	// Upsert player to database
	if err := ps.repo.UpsertTrackedPlayer(ctx, trackedPlayer); err != nil {
		ps.logger.Error("failed to upsert player", "error", err)
	}

	rankedStats := &models.RankedStats{
		Tier:  "UNRANKED",
		Rank:  "",
		Wins:  0,
		Losses: 0,
	}
	if league != nil {
		rankedStats.Tier = league.Tier
		rankedStats.Rank = league.Rank
		rankedStats.LeaguePoints = league.LeaguePoints
		rankedStats.Wins = league.Wins
		rankedStats.Losses = league.Losses
		if rankedStats.Wins+rankedStats.Losses > 0 {
			rankedStats.WinRate = float32(rankedStats.Wins) / float32(rankedStats.Wins+rankedStats.Losses) * 100.0
		}
	}

	if viegoStats == nil {
		viegoStats = &models.ViegoStats{}
	}
	if mastery != nil {
		viegoStats.MasteryLevel = mastery.ChampionLevel
		viegoStats.MasteryPoints = mastery.ChampionPoints
	}

	profile := &models.PlayerProfile{
		Player:           *trackedPlayer,
		ViegoStats:       *viegoStats,
		RankedStats:      *rankedStats,
		RecentMatches:    matches,
		PerformanceIndex: models.PerformanceIndex{},
		LastUpdated:      time.Now(),
	}

	// Cache the profile
	if err := ps.redis.SetJSON(ctx, cacheKey, profile, profileCacheTTL); err != nil {
		ps.logger.Error("failed to cache profile", "error", err)
	}

	return profile, nil
}

// GetPlayerMatches retrieves paginated match history
func (ps *ProfileService) GetPlayerMatches(ctx context.Context, region, name, tag string, page, limit int) ([]models.MatchSummary, int, error) {
	// Resolve PUUID
	puuid, _, err := ps.resolvePUUID(ctx, region, name, tag)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to resolve puuid: %w", err)
	}

	// Get total count
	totalCount, err := ps.repo.GetViegoMatchCount(ctx, puuid)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get match count: %w", err)
	}

	// Calculate offset
	offset := (page - 1) * limit
	if offset < 0 {
		offset = 0
	}

	// Get matches
	matches, err := ps.repo.GetViegoMatches(ctx, puuid, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to get matches: %w", err)
	}

	return matches, totalCount, nil
}

// resolvePUUID resolves a player's PUUID from their game name and tag
func (ps *ProfileService) resolvePUUID(ctx context.Context, region, name, tag string) (string, *SummonerInfo, error) {
	payload := map[string]string{
		"gameName": name,
		"tagLine":  tag,
		"platform": region,
	}

	reqBody, err := json.Marshal(payload)
	if err != nil {
		return "", nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", riotGatewayURL+"/summoners/by-riot-id", bytes.NewReader(reqBody))
	if err != nil {
		return "", nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := ps.riotGatewayClient.Do(req)
	if err != nil {
		return "", nil, fmt.Errorf("failed to call riot-gateway: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", nil, fmt.Errorf("riot-gateway returned %d: %s", resp.StatusCode, string(body))
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", nil, fmt.Errorf("failed to decode response: %w", err)
	}

	puuid, ok := result["puuid"].(string)
	if !ok {
		return "", nil, fmt.Errorf("invalid response from riot-gateway")
	}

	// Extract summoner info
	summoner := &SummonerInfo{
		SummonerID:    result["summoner_id"].(string),
		Level:         int(result["summoner_level"].(float64)),
		ProfileIconID: int(result["profile_icon_id"].(float64)),
	}

	return puuid, summoner, nil
}

// getLeagueInfo retrieves league information
func (ps *ProfileService) getLeagueInfo(ctx context.Context, puuid, region string) (*LeagueInfo, error) {
	url := fmt.Sprintf("%s/summoners/%s/league?platform=%s", riotGatewayURL, puuid, region)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := ps.riotGatewayClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call riot-gateway: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("riot-gateway returned %d", resp.StatusCode)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	league := &LeagueInfo{
		Tier:          result["tier"].(string),
		Rank:          result["rank"].(string),
		LeaguePoints:  int(result["league_points"].(float64)),
		Wins:          int(result["wins"].(float64)),
		Losses:        int(result["losses"].(float64)),
	}

	return league, nil
}

// getMasteryInfo retrieves mastery information
func (ps *ProfileService) getMasteryInfo(ctx context.Context, puuid, region string) (*MasteryInfo, error) {
	url := fmt.Sprintf("%s/summoners/%s/mastery/%d?platform=%s", riotGatewayURL, puuid, viegoChampionID, region)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := ps.riotGatewayClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to call riot-gateway: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("riot-gateway returned %d", resp.StatusCode)
	}

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	mastery := &MasteryInfo{
		ChampionID:     int(result["champion_id"].(float64)),
		ChampionLevel:  int(result["champion_level"].(float64)),
		ChampionPoints: int(result["champion_points"].(float64)),
	}

	return mastery, nil
}

// Internal helper types
type SummonerInfo struct {
	SummonerID    string
	Level         int
	ProfileIconID int
}

type LeagueInfo struct {
	Tier          string
	Rank          string
	LeaguePoints  int
	Wins          int
	Losses        int
}

type MasteryInfo struct {
	ChampionID     int
	ChampionLevel  int
	ChampionPoints int
}
