package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/4viegomains/backend/pkg/config"
	"github.com/4viegomains/backend/pkg/database"
	appMiddleware "github.com/4viegomains/backend/pkg/middleware"
	"github.com/4viegomains/backend/services/player-svc/internal/handler"
	"github.com/4viegomains/backend/services/player-svc/internal/repository"
	"github.com/4viegomains/backend/services/player-svc/internal/service"
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

	ctx := context.Background()

	// Initialize PostgreSQL
	pgDB, err := database.NewPostgresDB(ctx, cfg.PostgresURL)
	if err != nil {
		logger.Error("failed to initialize postgres", "error", err)
		os.Exit(1)
	}
	defer pgDB.Close()

	if err := pgDB.InitSchema(ctx); err != nil {
		logger.Error("failed to initialize postgres schema", "error", err)
		os.Exit(1)
	}

	// Initialize ClickHouse
	chDB, err := database.NewClickHouseDB(ctx, cfg.ClickHouseURL)
	if err != nil {
		logger.Error("failed to initialize clickhouse", "error", err)
		os.Exit(1)
	}
	defer chDB.Close()

	// Initialize Redis
	redisDB, err := database.NewRedisDB(cfg.RedisURL)
	if err != nil {
		logger.Error("failed to initialize redis", "error", err)
		os.Exit(1)
	}
	defer redisDB.Close()

	// Create HTTP client for riot-gateway calls
	riotGatewayClient := &http.Client{
		Timeout: 10 * time.Second,
	}

	// Initialize repositories and services
	playerRepo := repository.NewPlayerRepository(pgDB.Pool(), chDB.Conn())
	profileService := service.NewProfileService(playerRepo, riotGatewayClient, redisDB, logger)
	performanceAnalyzer := service.NewPerformanceAnalyzer()

	// Setup router
	router := chi.NewRouter()

	// Apply middleware stack
	router.Use(middleware.RequestID)
	router.Use(appMiddleware.LoggingMiddleware(logger))
	router.Use(appMiddleware.RecoveryMiddleware(logger))
	router.Use(appMiddleware.CORSMiddleware(nil))

	// Health check
	router.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "healthy"}`))
	})

	// Initialize handlers
	profileHandler := handler.NewProfileHandler(profileService, performanceAnalyzer)
	matchHandler := handler.NewMatchHandler(profileService)
	performanceHandler := handler.NewPerformanceHandler(profileService, performanceAnalyzer)
	comparisonHandler := handler.NewComparisonHandler(profileService, performanceAnalyzer)

	// Register routes
	router.Route("/api/v1/player/{region}/{name}/{tag}", func(r chi.Router) {
		r.Get("/profile", profileHandler.GetProfile)
		r.Get("/matches", matchHandler.GetMatches)
		r.Get("/performance", performanceHandler.GetPerformance)
		r.Get("/roles", performanceHandler.GetRoleDistribution)
		r.Get("/trends", performanceHandler.GetTrends)
		r.Get("/comparison", comparisonHandler.GetComparison)
	})

	// Start server
	addr := ":8083"
	server := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		logger.Info("starting player-svc", "addr", addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Error("server error", "error", err)
			os.Exit(1)
		}
	}()

	// Graceful shutdown
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)
	<-sigChan

	logger.Info("shutting down player-svc")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(shutdownCtx); err != nil {
		logger.Error("shutdown error", "error", err)
		os.Exit(1)
	}

	logger.Info("player-svc shutdown complete")
}
