package database

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

// ClickHouseDB wraps the ClickHouse connection
type ClickHouseDB struct {
	conn driver.Conn
}

// NewClickHouseDB creates a new ClickHouse connection
func NewClickHouseDB(ctx context.Context, dsn string) (*ClickHouseDB, error) {
	opts, err := clickhouse.ParseDSN(dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to parse ClickHouse DSN: %w", err)
	}
	conn, err := clickhouse.Open(opts)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to ClickHouse: %w", err)
	}

	// Test the connection
	if err := conn.Ping(ctx); err != nil {
		conn.Close()
		return nil, fmt.Errorf("failed to ping ClickHouse: %w", err)
	}

	return &ClickHouseDB{conn: conn}, nil
}

// Close closes the ClickHouse connection
func (db *ClickHouseDB) Close() error {
	if db.conn != nil {
		return db.conn.Close()
	}
	return nil
}

// HealthCheck performs a health check on ClickHouse
func (db *ClickHouseDB) HealthCheck(ctx context.Context) error {
	return db.conn.Ping(ctx)
}

// Conn returns the underlying ClickHouse connection
func (db *ClickHouseDB) Conn() driver.Conn {
	return db.conn
}

// InitSchema initializes the ClickHouse schema for analytics
func (db *ClickHouseDB) InitSchema(ctx context.Context) error {
	logger := slog.Default()

	// Create tables
	queries := []string{
		`CREATE TABLE IF NOT EXISTS match_stats (
			match_id String,
			platform_id String,
			timestamp DateTime,
			puuid String,
			champion_id Int32,
			role String,
			lane String,
			kills Int32,
			deaths Int32,
			assists Int32,
			gold_earned Int32,
			minions_killed Int32,
			damage_dealt Int64,
			damage_taken Int64,
			healing Int32,
			vision_score Int32,
			cc_score Float32,
			objective_contribution Float32,
			win Bool
		) ENGINE = MergeTree()
		ORDER BY (match_id, puuid)
		TTL timestamp + INTERVAL 1 YEAR;`,

		`CREATE TABLE IF NOT EXISTS champion_statistics (
			date Date,
			champion_id Int32,
			platform_id String,
			pick_rate Float32,
			ban_rate Float32,
			win_rate Float32,
			match_count Int32,
			avg_kills Float32,
			avg_deaths Float32,
			avg_assists Float32,
			avg_gold Float32
		) ENGINE = MergeTree()
		ORDER BY (date, champion_id, platform_id);`,

		`CREATE TABLE IF NOT EXISTS build_statistics (
			date Date,
			champion_id Int32,
			role String,
			item_id String,
			frequency Float32,
			win_rate Float32,
			match_count Int32
		) ENGINE = MergeTree()
		ORDER BY (date, champion_id, role, item_id);`,

		`CREATE TABLE IF NOT EXISTS rune_statistics (
			date Date,
			champion_id Int32,
			role String,
			rune_id Int32,
			frequency Float32,
			win_rate Float32,
			match_count Int32
		) ENGINE = MergeTree()
		ORDER BY (date, champion_id, role, rune_id);`,

		`CREATE TABLE IF NOT EXISTS matchup_statistics (
			date Date,
			champion_id Int32,
			enemy_champion_id Int32,
			role String,
			win_rate Float32,
			match_count Int32,
			avg_kda Float32
		) ENGINE = MergeTree()
		ORDER BY (date, champion_id, enemy_champion_id);`,

		`CREATE TABLE IF NOT EXISTS player_performance (
			date Date,
			puuid String,
			champion_id Int32,
			role String,
			match_count Int32,
			win_rate Float32,
			avg_kills Float32,
			avg_deaths Float32,
			avg_assists Float32,
			avg_cs_per_minute Float32,
			avg_gold_per_minute Float32,
			combat_score Float32,
			farming_score Float32,
			vision_score Float32,
			objective_score Float32
		) ENGINE = MergeTree()
		ORDER BY (date, puuid, champion_id)
		TTL date + INTERVAL 2 YEAR;`,
	}

	for _, query := range queries {
		if err := db.conn.Exec(ctx, query); err != nil {
			logger.Error("failed to create table", "error", err)
			return fmt.Errorf("failed to create table: %w", err)
		}
	}

	logger.Info("ClickHouse schema initialized")
	return nil
}

// InsertMatchStats inserts match statistics
func (db *ClickHouseDB) InsertMatchStats(ctx context.Context, stats interface{}) error {
	batch, err := db.conn.PrepareBatch(ctx, `
		INSERT INTO match_stats (
			match_id, platform_id, timestamp, puuid, champion_id, role, lane,
			kills, deaths, assists, gold_earned, minions_killed, damage_dealt,
			damage_taken, healing, vision_score, cc_score, objective_contribution, win
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return fmt.Errorf("failed to prepare batch: %w", err)
	}

	if err := batch.Send(); err != nil {
		return fmt.Errorf("failed to send batch: %w", err)
	}

	return nil
}
