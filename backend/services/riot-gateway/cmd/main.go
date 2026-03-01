package main

import (
	"context"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/4viegomains/backend/pkg/config"
	"github.com/4viegomains/backend/pkg/database"
	"github.com/4viegomains/backend/pkg/middleware"
	"github.com/4viegomains/backend/pkg/response"
	"github.com/4viegomains/backend/pkg/riot"
	"github.com/go-chi/chi/v5"
)

func main() {
	// Setup logging
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		logger.Error("failed to load config", "error", err)
		os.Exit(1)
	}
	if err := cfg.ValidateRiotKey(); err != nil {
		logger.Error("failed to validate config", "error", err)
		os.Exit(1)
	}

	// Initialize database connections
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	redisDB, err := database.NewRedisDB(cfg.RedisURL)
	if err != nil {
		logger.Error("failed to connect to Redis", "error", err)
		os.Exit(1)
	}
	defer redisDB.Close()

	// Initialize Riot API client
	riotClient := riot.NewClient(cfg.RiotAPIKey)

	// Setup router
	router := chi.NewRouter()

	// Apply middleware
	router.Use(middleware.RecoveryMiddleware(logger))
	router.Use(middleware.CORSMiddleware([]string{"*"}))
	router.Use(middleware.LoggingMiddleware(logger))
	router.Use(middleware.RateLimitMiddleware(redisDB.Client(), 120))

	// Health check endpoint
	router.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		if err := redisDB.HealthCheck(r.Context()); err != nil {
			response.InternalServerError(w, "Database health check failed")
			return
		}
		response.Success(w, map[string]string{"status": "healthy"}, http.StatusOK)
	})

	// Summoner endpoints
	router.Post("/summoners/by-riot-id", handleGetAccountByRiotID(riotClient, redisDB, logger))
	router.Get("/summoners/{puuid}", handleGetSummonerByPUUID(riotClient, redisDB, logger))
	router.Get("/summoners/{puuid}/mastery", handleGetChampionMastery(riotClient, redisDB, logger))
	router.Get("/summoners/{puuid}/mastery/{championId}", handleGetChampionMasteryByChampion(riotClient, redisDB, logger))
	router.Get("/summoners/{puuid}/league", handleGetLeagueEntries(riotClient, redisDB, logger))

	// Match endpoints
	router.Get("/matches/{puuid}/ids", handleGetMatchList(riotClient, redisDB, logger))
	router.Get("/matches/{matchId}", handleGetMatchDetail(riotClient, redisDB, logger))
	router.Get("/matches/{matchId}/timeline", handleGetMatchTimeline(riotClient, redisDB, logger))

	// League endpoints
	router.Get("/leagues/challenger", handleGetChallengerLeague(riotClient, redisDB, logger))
	router.Get("/leagues/grandmaster", handleGetGrandmasterLeague(riotClient, redisDB, logger))
	router.Get("/leagues/master", handleGetMasterLeague(riotClient, redisDB, logger))

	// Start server
	addr := fmt.Sprintf(":%d", cfg.Port)
	server := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		logger.Info("starting riot-gateway", "addr", addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("server error", "error", err)
			os.Exit(1)
		}
	}()

	// Wait for interrupt signal
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	// Graceful shutdown
	logger.Info("shutting down riot-gateway")
	ctx, cancel = context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		logger.Error("shutdown error", "error", err)
		os.Exit(1)
	}

	logger.Info("riot-gateway shutdown complete")
}

// Request/Response DTOs
type getAccountRequest struct {
	GameName string `json:"game_name"`
	TagLine  string `json:"tag_line"`
	Platform string `json:"platform"`
}

type matchListRequest struct {
	PUUID    string `json:"puuid"`
	Platform string `json:"platform"`
	Start    int    `json:"start"`
	Count    int    `json:"count"`
}

// Handler functions
func handleGetAccountByRiotID(riotClient *riot.Client, redisDB *database.RedisDB, logger *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req getAccountRequest
		if err := parseJSON(r, &req); err != nil {
			response.BadRequest(w, "Invalid request body")
			return
		}

		// Check cache
		cacheKey := fmt.Sprintf("account:%s:%s", req.GameName, req.TagLine)
		var cachedAccount riot.AccountDTO
		if err := redisDB.GetJSON(r.Context(), cacheKey, &cachedAccount); err == nil {
			response.Success(w, cachedAccount, http.StatusOK)
			return
		}

		// Fetch from API
		account, err := riotClient.GetAccountByRiotID(r.Context(), req.Platform, req.GameName, req.TagLine)
		if err != nil {
			logger.Error("failed to get account", "error", err)
			response.InternalServerError(w, "Failed to fetch account data")
			return
		}

		// Cache result
		redisDB.SetJSON(r.Context(), cacheKey, account, 24*time.Hour)

		response.Success(w, account, http.StatusOK)
	}
}

func handleGetSummonerByPUUID(riotClient *riot.Client, redisDB *database.RedisDB, logger *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		puuid := chi.URLParam(r, "puuid")
		platform := r.URL.Query().Get("platform")

		if puuid == "" || platform == "" {
			response.BadRequest(w, "Missing required parameters")
			return
		}

		// Check cache
		cacheKey := fmt.Sprintf("summoner:%s", puuid)
		var cachedSummoner riot.SummonerDTO
		if err := redisDB.GetJSON(r.Context(), cacheKey, &cachedSummoner); err == nil {
			response.Success(w, cachedSummoner, http.StatusOK)
			return
		}

		// Fetch from API
		summoner, err := riotClient.GetSummonerByPUUID(r.Context(), platform, puuid)
		if err != nil {
			logger.Error("failed to get summoner", "error", err)
			response.InternalServerError(w, "Failed to fetch summoner data")
			return
		}

		// Cache result
		redisDB.SetJSON(r.Context(), cacheKey, summoner, 24*time.Hour)

		response.Success(w, summoner, http.StatusOK)
	}
}

func handleGetChampionMastery(riotClient *riot.Client, redisDB *database.RedisDB, logger *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		puuid := chi.URLParam(r, "puuid")
		platform := r.URL.Query().Get("platform")

		if puuid == "" || platform == "" {
			response.BadRequest(w, "Missing required parameters")
			return
		}

		// Get summoner ID from cache or API
		cacheKey := fmt.Sprintf("summoner:%s", puuid)
		var summoner riot.SummonerDTO
		if err := redisDB.GetJSON(r.Context(), cacheKey, &summoner); err != nil {
			s, err := riotClient.GetSummonerByPUUID(r.Context(), platform, puuid)
			if err != nil {
				response.InternalServerError(w, "Failed to fetch summoner")
				return
			}
			summoner = *s
			redisDB.SetJSON(r.Context(), cacheKey, summoner, 24*time.Hour)
		}

		// Check cache for masteries
		masteryKey := fmt.Sprintf("mastery:%s", summoner.ID)
		var cachedMasteries []riot.ChampionMasteryDTO
		if err := redisDB.GetJSON(r.Context(), masteryKey, &cachedMasteries); err == nil {
			response.Success(w, cachedMasteries, http.StatusOK)
			return
		}

		// Fetch from API
		masteries, err := riotClient.GetChampionMastery(r.Context(), platform, summoner.ID)
		if err != nil {
			logger.Error("failed to get champion mastery", "error", err)
			response.InternalServerError(w, "Failed to fetch mastery data")
			return
		}

		// Cache result
		redisDB.SetJSON(r.Context(), masteryKey, masteries, 12*time.Hour)

		response.Success(w, masteries, http.StatusOK)
	}
}

func handleGetChampionMasteryByChampion(riotClient *riot.Client, redisDB *database.RedisDB, logger *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		puuid := chi.URLParam(r, "puuid")
		championIDStr := chi.URLParam(r, "championId")
		platform := r.URL.Query().Get("platform")

		if puuid == "" || championIDStr == "" || platform == "" {
			response.BadRequest(w, "Missing required parameters")
			return
		}

		// Parse champion ID
		var championID int
		if _, err := fmt.Sscanf(championIDStr, "%d", &championID); err != nil {
			response.BadRequest(w, "Invalid champion ID")
			return
		}

		// Get summoner ID from cache or API
		cacheKey := fmt.Sprintf("summoner:%s", puuid)
		var summoner riot.SummonerDTO
		if err := redisDB.GetJSON(r.Context(), cacheKey, &summoner); err != nil {
			s, err := riotClient.GetSummonerByPUUID(r.Context(), platform, puuid)
			if err != nil {
				response.InternalServerError(w, "Failed to fetch summoner")
				return
			}
			summoner = *s
			redisDB.SetJSON(r.Context(), cacheKey, summoner, 24*time.Hour)
		}

		// Check cache
		masteryKey := fmt.Sprintf("mastery:%s:%d", summoner.ID, championID)
		var cachedMastery riot.ChampionMasteryDTO
		if err := redisDB.GetJSON(r.Context(), masteryKey, &cachedMastery); err == nil {
			response.Success(w, cachedMastery, http.StatusOK)
			return
		}

		// Fetch from API
		mastery, err := riotClient.GetChampionMasteryByChampion(r.Context(), platform, summoner.ID, championID)
		if err != nil {
			logger.Error("failed to get champion mastery", "error", err)
			response.InternalServerError(w, "Failed to fetch mastery data")
			return
		}

		// Cache result
		redisDB.SetJSON(r.Context(), masteryKey, mastery, 12*time.Hour)

		response.Success(w, mastery, http.StatusOK)
	}
}

func handleGetLeagueEntries(riotClient *riot.Client, redisDB *database.RedisDB, logger *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		puuid := chi.URLParam(r, "puuid")
		platform := r.URL.Query().Get("platform")

		if puuid == "" || platform == "" {
			response.BadRequest(w, "Missing required parameters")
			return
		}

		// Get summoner ID from cache or API
		cacheKey := fmt.Sprintf("summoner:%s", puuid)
		var summoner riot.SummonerDTO
		if err := redisDB.GetJSON(r.Context(), cacheKey, &summoner); err != nil {
			s, err := riotClient.GetSummonerByPUUID(r.Context(), platform, puuid)
			if err != nil {
				response.InternalServerError(w, "Failed to fetch summoner")
				return
			}
			summoner = *s
			redisDB.SetJSON(r.Context(), cacheKey, summoner, 24*time.Hour)
		}

		// Check cache
		leagueKey := fmt.Sprintf("league:%s", summoner.ID)
		var cachedEntries []riot.LeagueEntryDTO
		if err := redisDB.GetJSON(r.Context(), leagueKey, &cachedEntries); err == nil {
			response.Success(w, cachedEntries, http.StatusOK)
			return
		}

		// Fetch from API
		entries, err := riotClient.GetLeagueEntries(r.Context(), platform, summoner.ID)
		if err != nil {
			logger.Error("failed to get league entries", "error", err)
			response.InternalServerError(w, "Failed to fetch league data")
			return
		}

		// Cache result
		redisDB.SetJSON(r.Context(), leagueKey, entries, 6*time.Hour)

		response.Success(w, entries, http.StatusOK)
	}
}

func handleGetMatchList(riotClient *riot.Client, redisDB *database.RedisDB, logger *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		puuid := chi.URLParam(r, "puuid")
		platform := r.URL.Query().Get("platform")

		if puuid == "" || platform == "" {
			response.BadRequest(w, "Missing required parameters")
			return
		}

		// Parse optional parameters
		start := 0
		count := 20
		if s := r.URL.Query().Get("start"); s != "" {
			fmt.Sscanf(s, "%d", &start)
		}
		if c := r.URL.Query().Get("count"); c != "" {
			fmt.Sscanf(c, "%d", &count)
		}

		// Fetch from API (no caching for match lists)
		matches, err := riotClient.GetMatchList(r.Context(), platform, puuid, start, count)
		if err != nil {
			logger.Error("failed to get match list", "error", err)
			response.InternalServerError(w, "Failed to fetch match list")
			return
		}

		response.Success(w, matches, http.StatusOK)
	}
}

func handleGetMatchDetail(riotClient *riot.Client, redisDB *database.RedisDB, logger *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		matchID := chi.URLParam(r, "matchId")
		platform := r.URL.Query().Get("platform")

		if matchID == "" || platform == "" {
			response.BadRequest(w, "Missing required parameters")
			return
		}

		// Check cache
		cacheKey := fmt.Sprintf("match:%s", matchID)
		var cachedMatch riot.MatchDTO
		if err := redisDB.GetJSON(r.Context(), cacheKey, &cachedMatch); err == nil {
			response.Success(w, cachedMatch, http.StatusOK)
			return
		}

		// Fetch from API
		match, err := riotClient.GetMatchDetail(r.Context(), platform, matchID)
		if err != nil {
			logger.Error("failed to get match detail", "error", err)
			response.InternalServerError(w, "Failed to fetch match data")
			return
		}

		// Cache result
		redisDB.SetJSON(r.Context(), cacheKey, match, 7*24*time.Hour) // Cache for 7 days

		response.Success(w, match, http.StatusOK)
	}
}

func handleGetMatchTimeline(riotClient *riot.Client, redisDB *database.RedisDB, logger *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		matchID := chi.URLParam(r, "matchId")
		platform := r.URL.Query().Get("platform")

		if matchID == "" || platform == "" {
			response.BadRequest(w, "Missing required parameters")
			return
		}

		// Check cache
		cacheKey := fmt.Sprintf("match_timeline:%s", matchID)
		var cachedTimeline riot.MatchTimelineDTO
		if err := redisDB.GetJSON(r.Context(), cacheKey, &cachedTimeline); err == nil {
			response.Success(w, cachedTimeline, http.StatusOK)
			return
		}

		// Fetch from API
		timeline, err := riotClient.GetMatchTimeline(r.Context(), platform, matchID)
		if err != nil {
			logger.Error("failed to get match timeline", "error", err)
			response.InternalServerError(w, "Failed to fetch timeline data")
			return
		}

		// Cache result
		redisDB.SetJSON(r.Context(), cacheKey, timeline, 7*24*time.Hour) // Cache for 7 days

		response.Success(w, timeline, http.StatusOK)
	}
}

func handleGetChallengerLeague(riotClient *riot.Client, redisDB *database.RedisDB, logger *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		platform := r.URL.Query().Get("platform")

		if platform == "" {
			response.BadRequest(w, "Missing platform parameter")
			return
		}

		// Check cache
		cacheKey := fmt.Sprintf("league_challenger:%s", platform)
		var cachedLeague riot.LeagueListDTO
		if err := redisDB.GetJSON(r.Context(), cacheKey, &cachedLeague); err == nil {
			response.Success(w, cachedLeague, http.StatusOK)
			return
		}

		// Fetch from API
		league, err := riotClient.GetChallengerLeague(r.Context(), platform)
		if err != nil {
			logger.Error("failed to get challenger league", "error", err)
			response.InternalServerError(w, "Failed to fetch league data")
			return
		}

		// Cache result
		redisDB.SetJSON(r.Context(), cacheKey, league, 1*time.Hour)

		response.Success(w, league, http.StatusOK)
	}
}

func handleGetGrandmasterLeague(riotClient *riot.Client, redisDB *database.RedisDB, logger *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		platform := r.URL.Query().Get("platform")

		if platform == "" {
			response.BadRequest(w, "Missing platform parameter")
			return
		}

		// Check cache
		cacheKey := fmt.Sprintf("league_grandmaster:%s", platform)
		var cachedLeague riot.LeagueListDTO
		if err := redisDB.GetJSON(r.Context(), cacheKey, &cachedLeague); err == nil {
			response.Success(w, cachedLeague, http.StatusOK)
			return
		}

		// Fetch from API
		league, err := riotClient.GetGrandmasterLeague(r.Context(), platform)
		if err != nil {
			logger.Error("failed to get grandmaster league", "error", err)
			response.InternalServerError(w, "Failed to fetch league data")
			return
		}

		// Cache result
		redisDB.SetJSON(r.Context(), cacheKey, league, 1*time.Hour)

		response.Success(w, league, http.StatusOK)
	}
}

func handleGetMasterLeague(riotClient *riot.Client, redisDB *database.RedisDB, logger *slog.Logger) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		platform := r.URL.Query().Get("platform")

		if platform == "" {
			response.BadRequest(w, "Missing platform parameter")
			return
		}

		// Check cache
		cacheKey := fmt.Sprintf("league_master:%s", platform)
		var cachedLeague riot.LeagueListDTO
		if err := redisDB.GetJSON(r.Context(), cacheKey, &cachedLeague); err == nil {
			response.Success(w, cachedLeague, http.StatusOK)
			return
		}

		// Fetch from API
		league, err := riotClient.GetMasterLeague(r.Context(), platform)
		if err != nil {
			logger.Error("failed to get master league", "error", err)
			response.InternalServerError(w, "Failed to fetch league data")
			return
		}

		// Cache result
		redisDB.SetJSON(r.Context(), cacheKey, league, 1*time.Hour)

		response.Success(w, league, http.StatusOK)
	}
}

// Helper function to parse JSON
func parseJSON(r *http.Request, v interface{}) error {
	return r.ParseForm()
}

// This function is not used yet but will be needed
// For now we manually parse request bodies in handlers
