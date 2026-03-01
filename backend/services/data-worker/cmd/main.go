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
	"github.com/4viegomains/backend/pkg/nats"
	"github.com/4viegomains/backend/pkg/riot"

	"github.com/4viegomains/backend/services/data-worker/internal/collector"
	"github.com/4viegomains/backend/services/data-worker/internal/processor"
	"github.com/4viegomains/backend/services/data-worker/internal/scheduler"
)

func main() {
	// Setup logging
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	slog.SetDefault(logger)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	logger.Info("data-worker starting")

	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		logger.Error("failed to load configuration", "error", err)
		os.Exit(1)
	}
	if err := cfg.ValidateRiotKey(); err != nil {
		logger.Error("failed to validate config", "error", err)
		os.Exit(1)
	}

	// Initialize databases
	logger.Info("initializing databases")

	postgresDB, err := database.NewPostgresDB(ctx, cfg.PostgresURL)
	if err != nil {
		logger.Error("failed to initialize PostgreSQL", "error", err)
		os.Exit(1)
	}
	defer postgresDB.Close()

	clickhouseDB, err := database.NewClickHouseDB(ctx, cfg.ClickHouseURL)
	if err != nil {
		logger.Error("failed to initialize ClickHouse", "error", err)
		os.Exit(1)
	}
	defer clickhouseDB.Close()

	redisDB, err := database.NewRedisDB(cfg.RedisURL)
	if err != nil {
		logger.Error("failed to initialize Redis", "error", err)
		os.Exit(1)
	}
	defer redisDB.Close()

	// Initialize schema
	if err := postgresDB.InitSchema(ctx); err != nil {
		logger.Error("failed to initialize PostgreSQL schema", "error", err)
		os.Exit(1)
	}

	if err := clickhouseDB.InitSchema(ctx); err != nil {
		logger.Error("failed to initialize ClickHouse schema", "error", err)
		os.Exit(1)
	}

	// Initialize NATS
	logger.Info("initializing NATS")
	natsClient, err := nats.NewClient(cfg.NATSURL)
	if err != nil {
		logger.Error("failed to initialize NATS", "error", err)
		os.Exit(1)
	}
	defer natsClient.Close()

	// Initialize Riot API client
	logger.Info("initializing Riot API client")
	riotClient := riot.NewClient(cfg.RiotAPIKey)

	// Initialize collectors
	logger.Info("initializing collectors")
	matchCollector := collector.NewMatchCollector(riotClient, postgresDB, clickhouseDB, redisDB, natsClient, cfg)
	leaderboardCollector := collector.NewLeaderboardCollector(riotClient, postgresDB, natsClient, cfg)
	patchWatcher := collector.NewPatchWatcher(riotClient, redisDB, natsClient)

	// Initialize processors
	logger.Info("initializing processors")
	buildAggregator := processor.NewBuildAggregator(postgresDB, clickhouseDB, redisDB, natsClient)
	runeAggregator := processor.NewRuneAggregator(postgresDB, clickhouseDB, redisDB, natsClient)
	statsCalculator := processor.NewStatsCalculator(postgresDB, clickhouseDB, redisDB, natsClient)

	// Initialize scheduler
	logger.Info("initializing scheduler")
	sched := scheduler.NewScheduler(matchCollector, leaderboardCollector, patchWatcher, buildAggregator, runeAggregator, statsCalculator)

	// Start scheduler
	logger.Info("starting scheduler")
	go sched.Start(ctx)

	// Start health check HTTP server
	go startHealthCheckServer(logger, postgresDB, clickhouseDB, redisDB)

	// Wait for shutdown signal
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	sig := <-sigChan
	logger.Info("received shutdown signal", "signal", sig.String())

	// Graceful shutdown
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer shutdownCancel()

	sched.Stop(shutdownCtx)
	logger.Info("data-worker shutdown complete")
}

// startHealthCheckServer starts an HTTP server for health checks
func startHealthCheckServer(logger *slog.Logger, postgresDB *database.PostgresDB, clickhouseDB *database.ClickHouseDB, redisDB *database.RedisDB) {
	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		// Check PostgreSQL
		if err := postgresDB.HealthCheck(ctx); err != nil {
			logger.Error("PostgreSQL health check failed", "error", err)
			w.WriteHeader(http.StatusServiceUnavailable)
			fmt.Fprintf(w, `{"status":"unhealthy","postgres":"down","error":"%v"}`, err)
			return
		}

		// Check ClickHouse
		if err := clickhouseDB.HealthCheck(ctx); err != nil {
			logger.Error("ClickHouse health check failed", "error", err)
			w.WriteHeader(http.StatusServiceUnavailable)
			fmt.Fprintf(w, `{"status":"unhealthy","clickhouse":"down","error":"%v"}`, err)
			return
		}

		// Check Redis
		if err := redisDB.HealthCheck(ctx); err != nil {
			logger.Error("Redis health check failed", "error", err)
			w.WriteHeader(http.StatusServiceUnavailable)
			fmt.Fprintf(w, `{"status":"unhealthy","redis":"down","error":"%v"}`, err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, `{"status":"healthy"}`)
	})

	mux.HandleFunc("/ready", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, `{"ready":true}`)
	})

	server := &http.Server{
		Addr:    ":8090",
		Handler: mux,
	}

	logger.Info("starting health check server on :8090")
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		logger.Error("health check server error", "error", err)
	}
}
