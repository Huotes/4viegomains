-- ClickHouse Match Data Schema for 4ViegoMains
-- This migration creates tables for high-volume time-series match data

-- Create viego_matches table with MergeTree engine for high-performance analytics
CREATE TABLE IF NOT EXISTS viego_matches (
    timestamp DateTime,
    match_id String,
    summoner_id String,
    summoner_name String,
    region String,

    -- Game information
    game_version String,
    game_mode String,
    queue_id Int32,
    game_type String,
    game_duration Int32,

    -- Team information
    team_id Int32,
    team_position Int32,

    -- Champion information
    champion_id Int32,
    champion_name String,

    -- Objectives and stats
    kills Int32,
    deaths Int32,
    assists Int32,
    kill_participation Decimal64(3),

    -- Resources
    total_gold Int64,
    gold_earned Int64,
    gold_spent Int64,
    cs Int32,
    cs_per_minute Decimal64(3),

    -- Damage
    total_damage_dealt Int64,
    magic_damage_dealt Int64,
    physical_damage_dealt Int64,
    true_damage_dealt Int64,
    total_damage_taken Int64,
    magic_damage_taken Int64,
    physical_damage_taken Int64,
    true_damage_taken Int64,
    damage_mitigated Int64,

    -- Healing
    total_heal Int64,
    total_heal_on_teammates Int64,

    -- Items
    item_1 Int32,
    item_2 Int32,
    item_3 Int32,
    item_4 Int32,
    item_5 Int32,
    item_6 Int32,
    boots Int32,

    -- Runes
    primary_rune_path Int32,
    primary_rune_1 Int32,
    primary_rune_2 Int32,
    primary_rune_3 Int32,
    secondary_rune_path Int32,
    secondary_rune_1 Int32,
    secondary_rune_2 Int32,
    stat_shard_1 Int32,
    stat_shard_2 Int32,
    stat_shard_3 Int32,

    -- Wards
    control_ward_bought Int32,
    trinket_upgrade_date Int32,
    vision_wards_bought_in_game Int32,
    sight_wards_bought_in_game Int32,

    -- Turrets and structures
    turrets_killed Int32,
    towers_destroyed Int32,
    inhibitors_destroyed Int32,

    -- Lane and role
    lane String,
    role String,

    -- Baron, Dragon, Herald
    baron_kills Int32,
    dragon_kills Int32,
    rift_herald_kills Int32,

    -- Game outcome
    win Boolean,

    -- Spell usage
    summoner_spell_1 Int32,
    summoner_spell_2 Int32,
    spell_1_casts Int32,
    spell_2_casts Int32,
    spell_3_casts Int32,
    spell_4_casts Int32,
    spell_5_casts Int32,

    -- Crowd control
    time_ccd Int32,

    -- Objectives participation
    objectives_stolen Int32,
    objectives_lost Int32,

    -- Additional metadata
    rank_tier String,
    rank_division String,
    rank_lp Int32,

    -- Metadata
    metadata String
)
ENGINE = MergeTree()
ORDER BY (timestamp, match_id, summoner_id)
PARTITION BY toYYYYMM(timestamp)
TTL timestamp + INTERVAL 180 DAY
SETTINGS index_granularity = 8192, ttl_only_drop_parts = 1;

-- Create aggregation table for daily statistics
CREATE TABLE IF NOT EXISTS viego_daily_stats (
    date Date,
    summoner_id String,
    region String,

    -- Count
    total_games Int32,
    wins Int32,
    losses Int32,

    -- Aggregated stats
    avg_kills Decimal64(3),
    avg_deaths Decimal64(3),
    avg_assists Decimal64(3),
    avg_kda Decimal64(3),
    avg_cs Decimal64(3),
    avg_cs_per_minute Decimal64(3),
    avg_gold Decimal64(0),
    avg_damage_dealt Decimal64(0),
    avg_damage_taken Decimal64(0),
    avg_healing Decimal64(0),
    avg_game_duration Int32,

    -- Win rate
    win_rate Decimal64(3),

    -- Most played items (JSON-like)
    popular_items String,

    -- Most played runes
    popular_runes String,

    -- Lane distribution
    lane_distribution String
)
ENGINE = MergeTree()
ORDER BY (date, summoner_id, region)
PARTITION BY toYYYYMM(date);

-- Create matchup statistics table
CREATE TABLE IF NOT EXISTS viego_matchup_stats (
    date Date,
    opponent_champion_id Int32,
    opponent_champion_name String,
    lane String,

    -- Statistics
    total_matches Int32,
    wins Int32,
    losses Int32,
    win_rate Decimal64(3),

    -- KDA
    avg_kills Decimal64(3),
    avg_deaths Decimal64(3),
    avg_assists Decimal64(3),
    avg_kda Decimal64(3),

    -- Resources
    avg_gold Decimal64(0),
    avg_cs Decimal64(3),
    avg_damage_dealt Decimal64(0),
    avg_damage_taken Decimal64(0),

    -- Difficulty
    difficulty_rating Decimal64(1)
)
ENGINE = MergeTree()
ORDER BY (date, opponent_champion_id, lane)
PARTITION BY toYYYYMM(date);

-- Create hourly match volume table for trend analysis
CREATE TABLE IF NOT EXISTS viego_match_volume_hourly (
    hour DateTime,
    region String,
    total_matches Int32,
    avg_match_duration Int32
)
ENGINE = MergeTree()
ORDER BY (hour, region)
PARTITION BY toYYYYMM(hour)
TTL hour + INTERVAL 90 DAY;

-- Create item efficiency table
CREATE TABLE IF NOT EXISTS viego_item_build_stats (
    date Date,
    item_id Int32,
    item_name String,
    position Int32, -- Item order (1-6, 7 for boots)

    -- Statistics
    total_builds Int32,
    wins_with_item Int32,
    losses_with_item Int32,
    win_rate Decimal64(3),

    -- Performance
    avg_damage_dealt Decimal64(0),
    avg_gold_efficiency Decimal64(3)
)
ENGINE = MergeTree()
ORDER BY (date, item_id, position)
PARTITION BY toYYYYMM(date);

-- Create rune efficiency table
CREATE TABLE IF NOT EXISTS viego_rune_build_stats (
    date Date,
    rune_id Int32,
    rune_name String,
    rune_path String,

    -- Statistics
    total_games Int32,
    wins Int32,
    losses Int32,
    win_rate Decimal64(3),
    pick_rate Decimal64(3)
)
ENGINE = MergeTree()
ORDER BY (date, rune_id, rune_path)
PARTITION BY toYYYYMM(date);

-- Create lane-specific statistics
CREATE TABLE IF NOT EXISTS viego_lane_stats (
    date Date,
    lane String,
    role String,

    -- Count
    total_games Int32,
    wins Int32,

    -- Statistics
    avg_kills Decimal64(3),
    avg_deaths Decimal64(3),
    avg_assists Decimal64(3),
    avg_kda Decimal64(3),
    avg_cs_per_minute Decimal64(3),
    avg_damage_dealt Decimal64(0),

    -- Win rate
    win_rate Decimal64(3),

    -- Pressure stats
    kill_participation Decimal64(3),
    objective_participation Decimal64(3)
)
ENGINE = MergeTree()
ORDER BY (date, lane, role)
PARTITION BY toYYYYMM(date);

-- Create ranking/tier progression table
CREATE TABLE IF NOT EXISTS viego_tier_progression (
    date Date,
    summoner_id String,
    region String,

    rank_tier String,
    rank_division String,
    rank_lp Int32,

    -- Change from previous
    lp_change Int32,
    tier_change String
)
ENGINE = MergeTree()
ORDER BY (date, summoner_id, region)
PARTITION BY toYYYYMM(date);

-- Create detailed event log table for match events
CREATE TABLE IF NOT EXISTS viego_match_events (
    match_id String,
    timestamp Int32,
    summoner_id String,
    event_type String, -- 'kill', 'death', 'assist', 'turret_kill', 'dragon_kill', 'baron_kill', etc.

    -- Event data
    target_id String,
    target_name String,
    target_champion_id Int32,

    -- Position data
    x_coordinate Int32,
    y_coordinate Int32,

    participant_count Int32, -- For teamfights

    created_at DateTime
)
ENGINE = MergeTree()
ORDER BY (match_id, timestamp, summoner_id)
PARTITION BY toYYYYMM(created_at)
TTL created_at + INTERVAL 90 DAY;

-- Create meta snapshots for historical analysis
CREATE TABLE IF NOT EXISTS viego_meta_snapshot (
    snapshot_date Date,

    -- Overall statistics
    total_games Int32,
    overall_win_rate Decimal64(3),
    pick_rate Decimal64(3),
    ban_rate Decimal64(3),

    -- KDA
    avg_kills Decimal64(3),
    avg_deaths Decimal64(3),
    avg_assists Decimal64(3),
    avg_kda Decimal64(3),

    -- Matchups
    best_matchups String, -- JSON array
    worst_matchups String, -- JSON array

    -- Popular builds
    most_common_build String, -- JSON
    most_common_runes String, -- JSON

    -- Stats by elo
    elo_breakdown String -- JSON
)
ENGINE = MergeTree()
ORDER BY snapshot_date
PARTITION BY toYYYYMM(snapshot_date);

-- Create table for tracking API response times and performance
CREATE TABLE IF NOT EXISTS viego_api_performance (
    timestamp DateTime,
    service_name String,
    endpoint String,
    method String,
    response_time_ms Int32,
    status_code Int32,
    error_message String
)
ENGINE = MergeTree()
ORDER BY (timestamp, service_name, endpoint)
PARTITION BY toYYYYMM(timestamp)
TTL timestamp + INTERVAL 30 DAY;
