-- Migration 003: Create aggregated tables for champion-svc
-- These tables store pre-computed analytics that champion-svc queries
-- The raw match data tables (viego_builds, viego_runes, etc.) remain for data-worker

-- Aggregated build statistics per role/elo/patch
CREATE TABLE IF NOT EXISTS viego.champion_build_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patch VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL,
    elo_tier VARCHAR(20) NOT NULL DEFAULT 'all',
    build_path JSONB NOT NULL DEFAULT '[]',
    win_rate NUMERIC(7, 4) NOT NULL DEFAULT 0,
    pick_rate NUMERIC(7, 4) NOT NULL DEFAULT 0,
    sample_size BIGINT NOT NULL DEFAULT 0,
    avg_kda NUMERIC(5, 2) NOT NULL DEFAULT 0,
    avg_game_length NUMERIC(7, 2) NOT NULL DEFAULT 0,
    skill_order JSONB NOT NULL DEFAULT '[]',
    summoner_spells JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_champion_build_stats_role_elo ON viego.champion_build_stats(role, elo_tier);
CREATE INDEX idx_champion_build_stats_patch ON viego.champion_build_stats(patch DESC);
CREATE INDEX idx_champion_build_stats_win_rate ON viego.champion_build_stats(win_rate DESC);

-- Aggregated rune statistics per role/elo/patch
CREATE TABLE IF NOT EXISTS viego.champion_rune_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patch VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL,
    elo_tier VARCHAR(20) NOT NULL DEFAULT 'all',
    primary_tree INTEGER NOT NULL,
    primary_runes JSONB NOT NULL DEFAULT '[]',
    secondary_tree INTEGER NOT NULL,
    secondary_runes JSONB NOT NULL DEFAULT '[]',
    stat_shards JSONB NOT NULL DEFAULT '[]',
    win_rate NUMERIC(7, 4) NOT NULL DEFAULT 0,
    pick_rate NUMERIC(7, 4) NOT NULL DEFAULT 0,
    sample_size BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_champion_rune_stats_role_elo ON viego.champion_rune_stats(role, elo_tier);
CREATE INDEX idx_champion_rune_stats_patch ON viego.champion_rune_stats(patch DESC);
CREATE INDEX idx_champion_rune_stats_win_rate ON viego.champion_rune_stats(win_rate DESC);

-- Aggregated matchup statistics per role/elo
CREATE TABLE IF NOT EXISTS viego.champion_matchup_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patch VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL,
    elo_tier VARCHAR(20) NOT NULL DEFAULT 'all',
    enemy_champion INTEGER NOT NULL,
    win_rate NUMERIC(7, 4) NOT NULL DEFAULT 0,
    sample_size BIGINT NOT NULL DEFAULT 0,
    avg_kda NUMERIC(5, 2) NOT NULL DEFAULT 0,
    gold_diff_15 NUMERIC(8, 2) NOT NULL DEFAULT 0,
    cs_diff_15 NUMERIC(6, 2) NOT NULL DEFAULT 0,
    tips JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_champion_matchup_stats_role_elo ON viego.champion_matchup_stats(role, elo_tier);
CREATE INDEX idx_champion_matchup_stats_enemy ON viego.champion_matchup_stats(enemy_champion);
CREATE INDEX idx_champion_matchup_stats_sample ON viego.champion_matchup_stats(sample_size DESC);

-- Aggregated meta statistics snapshots
CREATE TABLE IF NOT EXISTS viego.champion_meta_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patch VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL,
    elo_tier VARCHAR(20) NOT NULL DEFAULT 'all',
    win_rate NUMERIC(7, 4) NOT NULL DEFAULT 0,
    pick_rate NUMERIC(7, 4) NOT NULL DEFAULT 0,
    ban_rate NUMERIC(7, 4) NOT NULL DEFAULT 0,
    avg_kda NUMERIC(5, 2) NOT NULL DEFAULT 0,
    avg_cs_min NUMERIC(5, 2) NOT NULL DEFAULT 0,
    avg_gold_min NUMERIC(7, 2) NOT NULL DEFAULT 0,
    avg_damage_min NUMERIC(7, 2) NOT NULL DEFAULT 0,
    avg_vision NUMERIC(5, 2) NOT NULL DEFAULT 0,
    tier_rank INTEGER NOT NULL DEFAULT 0,
    total_games BIGINT NOT NULL DEFAULT 0,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_champion_meta_stats_role_elo ON viego.champion_meta_stats(role, elo_tier);
CREATE INDEX idx_champion_meta_stats_snapshot ON viego.champion_meta_stats(snapshot_date DESC);

-- Triggers
CREATE TRIGGER update_champion_build_stats_updated_at BEFORE UPDATE ON viego.champion_build_stats
    FOR EACH ROW EXECUTE FUNCTION viego.update_updated_at_column();

CREATE TRIGGER update_champion_rune_stats_updated_at BEFORE UPDATE ON viego.champion_rune_stats
    FOR EACH ROW EXECUTE FUNCTION viego.update_updated_at_column();

CREATE TRIGGER update_champion_matchup_stats_updated_at BEFORE UPDATE ON viego.champion_matchup_stats
    FOR EACH ROW EXECUTE FUNCTION viego.update_updated_at_column();

CREATE TRIGGER update_champion_meta_stats_updated_at BEFORE UPDATE ON viego.champion_meta_stats
    FOR EACH ROW EXECUTE FUNCTION viego.update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA viego TO viego;

-- Seed with initial data for current patch (14.24) across all roles
-- This gives the frontend something to display while real data accumulates

-- Meta stats per role
INSERT INTO viego.champion_meta_stats (patch, role, elo_tier, win_rate, pick_rate, ban_rate, avg_kda, avg_cs_min, avg_gold_min, avg_damage_min, avg_vision, tier_rank, total_games, snapshot_date) VALUES
('14.24', 'jungle', 'all', 0.5128, 0.0891, 0.1247, 2.85, 5.92, 412.30, 682.10, 1.42, 18, 142850, CURRENT_DATE),
('14.24', 'top',    'all', 0.4945, 0.0312, 0.1247, 2.41, 7.15, 398.50, 625.80, 0.95, 42, 38420, CURRENT_DATE),
('14.24', 'mid',    'all', 0.5067, 0.0285, 0.1247, 2.73, 7.82, 425.60, 715.30, 1.15, 31, 34780, CURRENT_DATE),
('14.24', 'bot',    'all', 0.4820, 0.0098, 0.1247, 2.52, 8.10, 440.20, 698.40, 0.72, 55, 11250, CURRENT_DATE),
('14.24', 'support','all', 0.4650, 0.0045, 0.1247, 2.18, 1.85, 285.40, 385.60, 2.85, 68, 5120, CURRENT_DATE);

-- Build stats per role (jungle is most popular)
INSERT INTO viego.champion_build_stats (patch, role, elo_tier, build_path, win_rate, pick_rate, sample_size, avg_kda, avg_game_length, skill_order, summoner_spells) VALUES
-- Jungle builds
('14.24', 'jungle', 'all', '[3124, 3153, 3078, 3036, 3053]', 0.5245, 0.4210, 60125, 3.12, 1742.5, '["Q","W","Q","E","Q","R","Q","W","Q","W","R","W","W","E","E","R","E","E"]', '[11, 4]'),
('14.24', 'jungle', 'all', '[3124, 3153, 6333, 3036, 3053]', 0.5180, 0.2850, 40680, 2.95, 1810.2, '["Q","W","Q","E","Q","R","Q","W","Q","W","R","W","W","E","E","R","E","E"]', '[11, 4]'),
('14.24', 'jungle', 'all', '[6672, 3153, 3078, 3036, 3026]', 0.5087, 0.1520, 21700, 2.78, 1695.8, '["Q","E","Q","W","Q","R","Q","E","Q","E","R","E","E","W","W","R","W","W"]', '[11, 4]'),
-- Top builds
('14.24', 'top', 'all', '[3153, 3078, 3053, 3036, 6333]', 0.5102, 0.3850, 14790, 2.68, 1820.4, '["Q","E","Q","W","Q","R","Q","E","Q","E","R","E","E","W","W","R","W","W"]', '[14, 4]'),
('14.24', 'top', 'all', '[3153, 6333, 3053, 3036, 3078]', 0.4980, 0.2750, 10565, 2.45, 1785.6, '["Q","W","Q","E","Q","R","Q","W","Q","W","R","W","W","E","E","R","E","E"]', '[14, 4]'),
-- Mid builds
('14.24', 'mid', 'all', '[3124, 3153, 3078, 3036, 3053]', 0.5190, 0.3920, 13635, 2.92, 1710.3, '["Q","W","Q","E","Q","R","Q","W","Q","W","R","W","W","E","E","R","E","E"]', '[14, 4]'),
('14.24', 'mid', 'all', '[6672, 3153, 3078, 3036, 3026]', 0.5045, 0.2680, 9315, 2.71, 1680.5, '["Q","E","Q","W","Q","R","Q","E","Q","E","R","E","E","W","W","R","W","W"]', '[14, 4]'),
-- Bot builds
('14.24', 'bot', 'all', '[6672, 3153, 3078, 3036, 3026]', 0.4912, 0.4150, 4670, 2.65, 1750.8, '["Q","E","Q","W","Q","R","Q","E","Q","E","R","E","E","W","W","R","W","W"]', '[7, 4]'),
-- Support builds
('14.24', 'support', 'all', '[3078, 3153, 3053, 3742, 3026]', 0.4720, 0.3580, 1835, 2.32, 1810.2, '["W","Q","W","E","W","R","W","Q","W","Q","R","Q","Q","E","E","R","E","E"]', '[14, 4]');

-- Rune stats per role
INSERT INTO viego.champion_rune_stats (patch, role, elo_tier, primary_tree, primary_runes, secondary_tree, secondary_runes, stat_shards, win_rate, pick_rate, sample_size) VALUES
-- Jungle runes
('14.24', 'jungle', 'all', 8000, '[8010, 9111, 9104, 8299]', 8100, '[8139, 8135]', '[5005, 5008, 5002]', 0.5285, 0.6210, 88720),
('14.24', 'jungle', 'all', 8000, '[8010, 9111, 9105, 8299]', 8400, '[8446, 8451]', '[5005, 5008, 5002]', 0.5145, 0.1850, 26420),
-- Top runes
('14.24', 'top', 'all', 8000, '[8010, 9111, 9104, 8299]', 8400, '[8444, 8451]', '[5005, 5008, 5002]', 0.5068, 0.5420, 20830),
('14.24', 'top', 'all', 8000, '[8005, 9111, 9104, 8299]', 8100, '[8139, 8135]', '[5005, 5008, 5002]', 0.4925, 0.2180, 8375),
-- Mid runes
('14.24', 'mid', 'all', 8000, '[8010, 9111, 9104, 8299]', 8100, '[8139, 8135]', '[5005, 5008, 5002]', 0.5210, 0.5850, 20345),
-- Bot runes
('14.24', 'bot', 'all', 8000, '[8010, 9111, 9104, 8299]', 8100, '[8139, 8135]', '[5005, 5008, 5002]', 0.4895, 0.5210, 5862),
-- Support runes
('14.24', 'support', 'all', 8400, '[8437, 8446, 8444, 8451]', 8000, '[9111, 9104]', '[5005, 5002, 5002]', 0.4680, 0.4520, 2315);

-- Matchup stats (jungle - most common matchups)
INSERT INTO viego.champion_matchup_stats (patch, role, elo_tier, enemy_champion, win_rate, sample_size, avg_kda, gold_diff_15, cs_diff_15, tips) VALUES
-- Jungle matchups
('14.24', 'jungle', 'all', 64,  0.5342, 8920, 3.25, 245.50, 4.20, '["Invade early when Lee Sin uses Q on camps","Take soul at level 6 to dodge abilities","Ward his red buff for tracking"]'),
('14.24', 'jungle', 'all', 121, 0.4780, 7450, 2.45, -180.30, -2.80, '["Avoid 1v1 pre-6","Counter-gank lanes instead of fighting directly","Build early tabi against her burst"]'),
('14.24', 'jungle', 'all', 203, 0.5185, 6820, 2.92, 120.80, 1.50, '["Trade when Kindred marks are down","Invade opposite side of Kindred marks","Ult during Kindred ult to steal souls"]'),
('14.24', 'jungle', 'all', 254, 0.4650, 9180, 2.38, -220.40, -3.10, '["Respect Vi early game power","Dodge Q with your E timing","Build Sterak for anti-burst"]'),
('14.24', 'jungle', 'all', 11,  0.5520, 5670, 3.45, 310.20, 5.80, '["Invade Master Yi early and often","Possess Yi in teamfights to use Wuju Style","Contest his camps on cooldown"]'),
('14.24', 'jungle', 'all', 120, 0.4520, 6340, 2.28, -280.60, -4.50, '["Hecarim outscales you in teamfights","Focus on early leads before he gets items","Save E to dodge his charge"]'),
('14.24', 'jungle', 'all', 141, 0.5410, 5280, 3.18, 195.40, 3.20, '["Kha Zix is weak in groups — force teamfights","Avoid isolated 1v1 in his jungle","Take his camps when he shows on map"]'),
('14.24', 'jungle', 'all', 28,  0.5650, 4890, 3.52, 280.30, 4.80, '["Evelynn is weak pre-6","Invade heavily levels 3-5","Buy control wards to track her"]'),
('14.24', 'jungle', 'all', 234, 0.4890, 5120, 2.62, -95.20, -1.20, '["Viego can match Lillia farm speed","Dodge her Q center for reduced damage","All-in when her passive movement speed is down"]'),
('14.24', 'jungle', 'all', 887, 0.4350, 7850, 2.15, -320.80, -5.20, '["Gwen shreds your resistances","Avoid extended trades inside her W","Gank lanes instead of contesting her"]'),
-- Top matchups
('14.24', 'top', 'all', 86,  0.4680, 4250, 2.32, -195.40, -3.80, '["Respect Garen silence range","Short trades only — E out before he spins","Build BotRK first for %hp damage"]'),
('14.24', 'top', 'all', 122, 0.4420, 3890, 2.18, -280.60, -5.20, '["Darius destroys you in extended trades","Never fight inside his E range","Farm safely and outscale mid-game"]'),
('14.24', 'top', 'all', 58,  0.5280, 3420, 2.95, 185.30, 2.80, '["Rumble is weak in melee range","Dodge flamespitter with E","All-in when his heat is low"]'),
('14.24', 'top', 'all', 39,  0.4890, 3150, 2.55, -120.40, -1.80, '["Irelia Q resets make her dangerous","Wait for her to miss E before engaging","Build early Bramble Vest"]');

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA viego TO viego;
