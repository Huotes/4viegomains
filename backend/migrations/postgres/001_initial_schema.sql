-- PostgreSQL Initial Schema for 4ViegoMains
-- This migration creates all core tables for tracking Viego champion data

CREATE SCHEMA IF NOT EXISTS viego;

-- Create viego_builds table
CREATE TABLE IF NOT EXISTS viego.viego_builds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    summoner_id VARCHAR(63) NOT NULL,
    summoner_name VARCHAR(16) NOT NULL,
    match_id VARCHAR(63) NOT NULL,
    game_version VARCHAR(20) NOT NULL,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Build items
    item1 INTEGER,
    item2 INTEGER,
    item3 INTEGER,
    item4 INTEGER,
    item5 INTEGER,
    item6 INTEGER,

    -- Boots
    boots INTEGER,

    -- Core stats at end of game
    kills INTEGER NOT NULL DEFAULT 0,
    deaths INTEGER NOT NULL DEFAULT 0,
    assists INTEGER NOT NULL DEFAULT 0,
    gold_earned INTEGER NOT NULL DEFAULT 0,
    cs INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,

    -- Win/Loss
    win BOOLEAN NOT NULL,

    -- Game duration in seconds
    game_duration INTEGER NOT NULL,

    -- Lane
    lane VARCHAR(10),
    role VARCHAR(20),

    -- Additional metadata
    metadata JSONB
);

CREATE INDEX idx_viego_builds_summoner_id ON viego.viego_builds(summoner_id);
CREATE INDEX idx_viego_builds_match_id ON viego.viego_builds(match_id);
CREATE INDEX idx_viego_builds_timestamp ON viego.viego_builds(timestamp DESC);
CREATE INDEX idx_viego_builds_created_at ON viego.viego_builds(created_at DESC);
CREATE INDEX idx_viego_builds_items ON viego.viego_builds(item1, item2, item3, item4, item5, item6);

-- Create viego_runes table
CREATE TABLE IF NOT EXISTS viego.viego_runes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    build_id UUID NOT NULL REFERENCES viego.viego_builds(id) ON DELETE CASCADE,
    match_id VARCHAR(63) NOT NULL,
    summoner_id VARCHAR(63) NOT NULL,
    timestamp BIGINT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Primary rune path
    primary_style INTEGER NOT NULL,
    primary_rune1 INTEGER NOT NULL,
    primary_rune2 INTEGER NOT NULL,
    primary_rune3 INTEGER NOT NULL,

    -- Secondary rune path
    secondary_style INTEGER NOT NULL,
    secondary_rune1 INTEGER NOT NULL,
    secondary_rune2 INTEGER NOT NULL,

    -- Stat shards
    stat_shard1 INTEGER NOT NULL,
    stat_shard2 INTEGER NOT NULL,
    stat_shard3 INTEGER NOT NULL,

    -- Metadata
    metadata JSONB
);

CREATE INDEX idx_viego_runes_build_id ON viego.viego_runes(build_id);
CREATE INDEX idx_viego_runes_summoner_id ON viego.viego_runes(summoner_id);
CREATE INDEX idx_viego_runes_match_id ON viego.viego_runes(match_id);
CREATE INDEX idx_viego_runes_timestamp ON viego.viego_runes(timestamp DESC);

-- Create tracked_players table
CREATE TABLE IF NOT EXISTS viego.tracked_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    summoner_id VARCHAR(63) NOT NULL UNIQUE,
    summoner_name VARCHAR(16) NOT NULL,
    region VARCHAR(10) NOT NULL,
    summoner_level INTEGER NOT NULL DEFAULT 1,
    profile_icon_id INTEGER,

    -- Rank information
    rank_tier VARCHAR(20),
    rank_division VARCHAR(5),
    rank_lp INTEGER DEFAULT 0,
    rank_wins INTEGER DEFAULT 0,
    rank_losses INTEGER DEFAULT 0,

    -- Viego statistics
    viego_matches_tracked INTEGER DEFAULT 0,
    viego_win_rate NUMERIC(5, 2),
    viego_average_kda NUMERIC(5, 2),

    -- Tracking info
    is_active BOOLEAN DEFAULT true,
    last_match_synced_at TIMESTAMP WITH TIME ZONE,
    last_updated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Metadata
    metadata JSONB
);

CREATE INDEX idx_tracked_players_summoner_id ON viego.tracked_players(summoner_id);
CREATE INDEX idx_tracked_players_summoner_name ON viego.tracked_players(summoner_name);
CREATE INDEX idx_tracked_players_region ON viego.tracked_players(region);
CREATE INDEX idx_tracked_players_is_active ON viego.tracked_players(is_active);
CREATE INDEX idx_tracked_players_updated_at ON viego.tracked_players(last_updated_at DESC);

-- Create viego_matchups table
CREATE TABLE IF NOT EXISTS viego.viego_matchups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opponent_champion_id INTEGER NOT NULL,
    opponent_champion_name VARCHAR(50) NOT NULL,
    lane VARCHAR(10) NOT NULL,

    -- Statistics
    total_matches INTEGER NOT NULL DEFAULT 0,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    win_rate NUMERIC(5, 2),
    average_kda NUMERIC(5, 2),
    average_gold BIGINT DEFAULT 0,
    average_cs NUMERIC(5, 1) DEFAULT 0,
    average_damage_dealt BIGINT DEFAULT 0,
    average_damage_taken BIGINT DEFAULT 0,

    -- Difficulty rating (1-5)
    difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5),

    -- Last updated
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Metadata with tips, bans, etc
    metadata JSONB
);

CREATE UNIQUE INDEX idx_viego_matchups_champion_lane ON viego.viego_matchups(opponent_champion_id, lane);
CREATE INDEX idx_viego_matchups_lane ON viego.viego_matchups(lane);
CREATE INDEX idx_viego_matchups_win_rate ON viego.viego_matchups(win_rate DESC);

-- Create viego_meta_stats table
CREATE TABLE IF NOT EXISTS viego.viego_meta_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,

    -- Global statistics
    total_games INTEGER NOT NULL DEFAULT 0,
    total_wins INTEGER NOT NULL DEFAULT 0,
    total_losses INTEGER NOT NULL DEFAULT 0,
    overall_win_rate NUMERIC(5, 2),

    -- KDA statistics
    average_kills NUMERIC(5, 2) DEFAULT 0,
    average_deaths NUMERIC(5, 2) DEFAULT 0,
    average_assists NUMERIC(5, 2) DEFAULT 0,
    average_kda NUMERIC(5, 2) DEFAULT 0,

    -- Game statistics
    average_game_duration INTEGER DEFAULT 0,
    average_gold BIGINT DEFAULT 0,
    average_cs NUMERIC(5, 1) DEFAULT 0,
    average_damage_dealt BIGINT DEFAULT 0,
    average_damage_taken BIGINT DEFAULT 0,

    -- Lane distribution
    lane_distribution JSONB,

    -- Popular builds
    popular_items JSONB,
    popular_runes JSONB,

    -- Matchup data
    best_matchups JSONB,
    worst_matchups JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_viego_meta_stats_date ON viego.viego_meta_stats(date DESC);

-- Create audit log table
CREATE TABLE IF NOT EXISTS viego.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(255) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    record_id UUID,
    changes JSONB,
    created_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_log_table_name ON viego.audit_log(table_name);
CREATE INDEX idx_audit_log_created_at ON viego.audit_log(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION viego.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_viego_builds_updated_at BEFORE UPDATE ON viego.viego_builds
    FOR EACH ROW EXECUTE FUNCTION viego.update_updated_at_column();

CREATE TRIGGER update_tracked_players_updated_at BEFORE UPDATE ON viego.tracked_players
    FOR EACH ROW EXECUTE FUNCTION viego.update_updated_at_column();

CREATE TRIGGER update_viego_meta_stats_updated_at BEFORE UPDATE ON viego.viego_meta_stats
    FOR EACH ROW EXECUTE FUNCTION viego.update_updated_at_column();

-- Grant permissions
GRANT USAGE ON SCHEMA viego TO viego;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA viego TO viego;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA viego TO viego;
