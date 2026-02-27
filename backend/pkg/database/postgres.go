package database

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/jackc/pgx/v5/pgxpool"
)

// PostgresDB wraps the connection pool
type PostgresDB struct {
	pool *pgxpool.Pool
}

// NewPostgresDB creates a new PostgreSQL connection pool
func NewPostgresDB(ctx context.Context, dsn string) (*PostgresDB, error) {
	config, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to parse DSN: %w", err)
	}

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("failed to create pool: %w", err)
	}

	// Test the connection
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &PostgresDB{pool: pool}, nil
}

// Close closes the database connection
func (db *PostgresDB) Close() {
	if db.pool != nil {
		db.pool.Close()
	}
}

// HealthCheck performs a health check on the database
func (db *PostgresDB) HealthCheck(ctx context.Context) error {
	return db.pool.Ping(ctx)
}

// Pool returns the underlying connection pool
func (db *PostgresDB) Pool() *pgxpool.Pool {
	return db.pool
}

// InitSchema initializes the database schema
func (db *PostgresDB) InitSchema(ctx context.Context) error {
	logger := slog.Default()

	// Create tables schema
	schema := `
	CREATE TABLE IF NOT EXISTS tracked_players (
		id SERIAL PRIMARY KEY,
		puuid VARCHAR(255) UNIQUE NOT NULL,
		summoner_id VARCHAR(255) UNIQUE NOT NULL,
		game_name VARCHAR(255) NOT NULL,
		tag_line VARCHAR(255) NOT NULL,
		platform_id VARCHAR(10) NOT NULL,
		summoner_level INT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS matches (
		id SERIAL PRIMARY KEY,
		match_id VARCHAR(255) UNIQUE NOT NULL,
		platform_id VARCHAR(10) NOT NULL,
		game_start_time BIGINT NOT NULL,
		game_duration BIGINT NOT NULL,
		game_mode VARCHAR(50),
		queue_id INT,
		season_id INT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	CREATE TABLE IF NOT EXISTS match_participants (
		id SERIAL PRIMARY KEY,
		match_id VARCHAR(255) NOT NULL,
		puuid VARCHAR(255) NOT NULL,
		champion_id INT NOT NULL,
		role VARCHAR(50),
		lane VARCHAR(50),
		kills INT,
		deaths INT,
		assists INT,
		gold_earned INT,
		cs INT,
		damage_dealt INT,
		damage_taken INT,
		vision_score INT,
		win BOOLEAN,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (match_id) REFERENCES matches(match_id),
		UNIQUE (match_id, puuid)
	);

	CREATE TABLE IF NOT EXISTS champion_mastery (
		id SERIAL PRIMARY KEY,
		puuid VARCHAR(255) NOT NULL,
		champion_id INT NOT NULL,
		mastery_level INT,
		mastery_points INT,
		last_played BIGINT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		UNIQUE (puuid, champion_id),
		FOREIGN KEY (puuid) REFERENCES tracked_players(puuid)
	);

	CREATE TABLE IF NOT EXISTS league_entries (
		id SERIAL PRIMARY KEY,
		puuid VARCHAR(255) NOT NULL,
		league_id VARCHAR(255) NOT NULL,
		tier VARCHAR(50),
		rank VARCHAR(10),
		lp INT,
		wins INT,
		losses INT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (puuid) REFERENCES tracked_players(puuid)
	);

	CREATE INDEX IF NOT EXISTS idx_matches_platform_id ON matches(platform_id);
	CREATE INDEX IF NOT EXISTS idx_match_participants_puuid ON match_participants(puuid);
	CREATE INDEX IF NOT EXISTS idx_champion_mastery_puuid ON champion_mastery(puuid);
	CREATE INDEX IF NOT EXISTS idx_league_entries_puuid ON league_entries(puuid);
	`

	if _, err := db.pool.Exec(ctx, schema); err != nil {
		logger.Error("failed to create schema", "error", err)
		return fmt.Errorf("failed to create schema: %w", err)
	}

	logger.Info("database schema initialized")
	return nil
}
