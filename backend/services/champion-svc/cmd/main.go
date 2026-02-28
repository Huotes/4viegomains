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
	"github.com/4viegomains/backend/pkg/nats"
	"github.com/4viegomains/backend/services/champion-svc/internal/handler"
	"github.com/4viegomains/backend/services/champion-svc/internal/repository"
	"github.com/4viegomains/backend/services/champion-svc/internal/service"
	"github.com/go-chi/chi/v5"
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		logger.Error("failed to load config", "error", err)
		os.Exit(1)
	}

	// Initialize PostgreSQL
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	pgDB, err := database.NewPostgresDB(ctx, cfg.PostgresURL)
	cancel()
	if err != nil {
		logger.Error("failed to initialize postgres", "error", err)
		os.Exit(1)
	}
	defer pgDB.Close()

	// Initialize Redis
	redisDB, err := database.NewRedisDB(cfg.RedisURL)
	if err != nil {
		logger.Error("failed to initialize redis", "error", err)
		os.Exit(1)
	}
	defer redisDB.Close()

	// Initialize NATS
	natsClient, err := nats.NewClient(cfg.NATSURL)
	if err != nil {
		logger.Error("failed to initialize nats", "error", err)
		os.Exit(1)
	}
	defer natsClient.Close()

	// Initialize repositories
	champRepo := repository.NewChampionRepository(pgDB)

	// Initialize services
	buildService := service.NewBuildService(champRepo, redisDB)
	runeService := service.NewRuneService(champRepo, redisDB)
	matchupService := service.NewMatchupService(champRepo, redisDB)

	// Initialize handlers
	buildHandler := handler.NewBuildHandler(buildService)
	runeHandler := handler.NewRuneHandler(runeService)
	matchupHandler := handler.NewMatchupHandler(matchupService)

	// Setup router
	router := chi.NewRouter()

	// Apply middleware
	router.Use(middleware.CORSMiddleware([]string{}))
	router.Use(middleware.LoggingMiddleware(logger))
	router.Use(middleware.RecoveryMiddleware(logger))
	router.Use(middleware.RateLimitMiddleware(redisDB.Client(), 100))

	// Health check
	router.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "healthy"}`))
	})

	// API v1 routes
	router.Route("/api/v1/champion", func(r chi.Router) {
		r.Get("/builds", buildHandler.GetBuilds)
		r.Get("/items", buildHandler.GetItems)
		r.Get("/skills", buildHandler.GetSkillOrder)
		r.Get("/summoner-spells", buildHandler.GetSummonerSpells)
		r.Get("/runes", runeHandler.GetRunes)
		r.Get("/matchups", matchupHandler.GetMatchup)
		r.Get("/counters", matchupHandler.GetCounters)
		r.Get("/stats", matchupHandler.GetStats)
	})

	// Subscribe to NATS events
	go subscribeToEvents(logger, natsClient, buildService, runeService)

	// Start server
	addr := ":8082"
	server := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		logger.Info("starting champion-svc", "addr", addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("server error", "error", err)
			os.Exit(1)
		}
	}()

	// Wait for shutdown signal
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	logger.Info("shutting down champion-svc")
	ctx, cancel = context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		logger.Error("shutdown error", "error", err)
		os.Exit(1)
	}

	logger.Info("champion-svc shutdown complete")
}

// subscribeToEvents subscribes to NATS events for cache invalidation
func subscribeToEvents(logger *slog.Logger, natsClient *nats.Client, buildService *service.BuildService, runeService *service.RuneService) {
	roles := []string{"top", "jungle", "mid", "bot", "support"}

	// Subscribe to builds recalculation events
	_, err := natsClient.SubscribeBuildsRecalculated(logger, func(championID int, role string) {
		logger.Info("builds recalculated event received", "champion_id", championID, "role", role)
		// Invalidate cache for the role
		buildService.InvalidateCache(role)
		runeService.InvalidateCache(role)
	})
	if err != nil {
		logger.Error("failed to subscribe to builds recalculated", "error", err)
	}

	// Subscribe to patch changed events
	_, err = natsClient.SubscribePatchChanged(logger, func(patchVersion, changesSummary string) {
		logger.Info("patch changed event received", "patch", patchVersion)
		// Invalidate all caches
		for _, role := range roles {
			buildService.InvalidateCache(role)
			runeService.InvalidateCache(role)
		}
	})
	if err != nil {
		logger.Error("failed to subscribe to patch changed", "error", err)
	}
}
