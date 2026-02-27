-- PostgreSQL Analytics Tables for 4ViegoMains
-- Additional tables for in-depth analytics and content

-- Create viego_item_efficiency table
CREATE TABLE IF NOT EXISTS viego.viego_item_efficiency (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id INTEGER NOT NULL UNIQUE,
    item_name VARCHAR(100) NOT NULL,

    -- Buy frequency
    total_built INTEGER NOT NULL DEFAULT 0,
    games_with_item INTEGER NOT NULL DEFAULT 0,
    purchase_rate NUMERIC(5, 2),

    -- Win statistics
    wins_with_item INTEGER DEFAULT 0,
    losses_with_item INTEGER DEFAULT 0,
    win_rate NUMERIC(5, 2),

    -- Positioning data
    average_build_order INTEGER DEFAULT 0,

    -- Performance metrics
    average_damage_dealt BIGINT DEFAULT 0,
    average_gold_efficiency NUMERIC(5, 2) DEFAULT 0,
    average_item_powerspike_timing NUMERIC(5, 1) DEFAULT 0,

    -- Build combinations
    synergistic_items JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_viego_item_efficiency_win_rate ON viego.viego_item_efficiency(win_rate DESC);
CREATE INDEX idx_viego_item_efficiency_purchase_rate ON viego.viego_item_efficiency(purchase_rate DESC);

-- Create viego_rune_efficiency table
CREATE TABLE IF NOT EXISTS viego.viego_rune_efficiency (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rune_id INTEGER NOT NULL,
    rune_name VARCHAR(100) NOT NULL,
    rune_path VARCHAR(50) NOT NULL,

    -- Usage statistics
    total_games_used INTEGER NOT NULL DEFAULT 0,
    pick_rate NUMERIC(5, 2),

    -- Win statistics
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    win_rate NUMERIC(5, 2),

    -- Synergies with other runes
    synergistic_runes JSONB,
    conflicting_runes JSONB,

    -- Best secondary path pairings
    best_secondary_pairings JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_viego_rune_efficiency_id ON viego.viego_rune_efficiency(rune_id);
CREATE INDEX idx_viego_rune_efficiency_win_rate ON viego.viego_rune_efficiency(win_rate DESC);
CREATE INDEX idx_viego_rune_efficiency_pick_rate ON viego.viego_rune_efficiency(pick_rate DESC);

-- Create viego_synergies table for item/rune combinations
CREATE TABLE IF NOT EXISTS viego.viego_synergies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    synergy_type VARCHAR(20) NOT NULL, -- 'item_combination', 'rune_combination', 'item_rune'

    -- Primary elements
    element1_id INTEGER NOT NULL,
    element1_name VARCHAR(100) NOT NULL,
    element1_type VARCHAR(20) NOT NULL, -- 'item', 'rune'

    -- Secondary elements
    element2_id INTEGER NOT NULL,
    element2_name VARCHAR(100) NOT NULL,
    element2_type VARCHAR(20) NOT NULL,

    -- Statistics
    synergy_rate NUMERIC(5, 2), -- How often they appear together
    synergy_win_rate NUMERIC(5, 2),
    synergy_strength INTEGER CHECK (synergy_strength >= 1 AND synergy_strength <= 5), -- 1-5 rating

    -- Notes
    notes TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_viego_synergies_type ON viego.viego_synergies(synergy_type);
CREATE INDEX idx_viego_synergies_elements ON viego.viego_synergies(element1_id, element2_id);
CREATE INDEX idx_viego_synergies_strength ON viego.viego_synergies(synergy_strength DESC);

-- Create viego_power_spikes table
CREATE TABLE IF NOT EXISTS viego.viego_power_spikes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_minute INTEGER NOT NULL, -- When the spike occurs (e.g., 6, 13, 25)

    -- Item spike
    item_powerspike JSONB,
    item_spike_strength INTEGER CHECK (item_spike_strength >= 1 AND item_spike_strength <= 5),

    -- Level spike
    level_spike INTEGER,
    level_spike_strength INTEGER CHECK (level_spike_strength >= 1 AND level_spike_strength <= 5),

    -- Gold requirement
    min_gold_required BIGINT DEFAULT 0,

    -- General strength at this point
    overall_strength INTEGER CHECK (overall_strength >= 1 AND overall_strength <= 5),

    -- Description
    description TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_viego_power_spikes_minute ON viego.viego_power_spikes(game_minute);

-- Create content_guides table
CREATE TABLE IF NOT EXISTS viego.content_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,

    -- Guide metadata
    author VARCHAR(255),
    guide_type VARCHAR(50) NOT NULL, -- 'matchup_guide', 'build_guide', 'playstyle_guide', 'general_tips'
    difficulty_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced'
    target_elo VARCHAR(50),

    -- Engagement
    views INTEGER DEFAULT 0,
    rating NUMERIC(3, 1),
    total_votes INTEGER DEFAULT 0,

    -- SEO
    meta_description TEXT,
    keywords JSONB,

    -- Publishing
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_content_guides_slug ON viego.content_guides(slug);
CREATE INDEX idx_content_guides_type ON viego.content_guides(guide_type);
CREATE INDEX idx_content_guides_published ON viego.content_guides(is_published, published_at DESC);
CREATE INDEX idx_content_guides_views ON viego.content_guides(views DESC);

-- Create content_tips table
CREATE TABLE IF NOT EXISTS viego.content_tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guide_id UUID REFERENCES viego.content_guides(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,

    -- Categorization
    tip_category VARCHAR(100), -- 'early_game', 'mid_game', 'late_game', 'teamfight', 'positioning'
    tip_priority INTEGER, -- Display order

    -- Engagement
    helpful_votes INTEGER DEFAULT 0,
    unhelpful_votes INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_content_tips_guide_id ON viego.content_tips(guide_id);
CREATE INDEX idx_content_tips_category ON viego.content_tips(tip_category);
CREATE INDEX idx_content_tips_priority ON viego.content_tips(tip_priority);

-- Create matchup_analysis table for detailed matchup info
CREATE TABLE IF NOT EXISTS viego.matchup_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    matchup_id UUID REFERENCES viego.viego_matchups(id) ON DELETE CASCADE,
    opponent_champion_id INTEGER NOT NULL,

    -- Early game phase (0-15 minutes)
    early_game_strategy TEXT,
    early_game_win_rate NUMERIC(5, 2),
    early_game_difficulty INTEGER CHECK (early_game_difficulty >= 1 AND early_game_difficulty <= 5),

    -- Mid game phase (15-30 minutes)
    mid_game_strategy TEXT,
    mid_game_win_rate NUMERIC(5, 2),
    mid_game_difficulty INTEGER CHECK (mid_game_difficulty >= 1 AND mid_game_difficulty <= 5),

    -- Late game phase (30+ minutes)
    late_game_strategy TEXT,
    late_game_win_rate NUMERIC(5, 2),
    late_game_difficulty INTEGER CHECK (late_game_difficulty >= 1 AND late_game_difficulty <= 5),

    -- Item recommendations
    recommended_items JSONB,
    item_priority JSONB,

    -- Rune recommendations
    recommended_runes JSONB,

    -- Ban recommendation
    should_ban BOOLEAN DEFAULT false,
    ban_priority INTEGER,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_matchup_analysis_matchup_id ON viego.matchup_analysis(matchup_id);
CREATE INDEX idx_matchup_analysis_opponent_champion ON viego.matchup_analysis(opponent_champion_id);

-- Create viego_skill_progression table
CREATE TABLE IF NOT EXISTS viego.viego_skill_progression (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    build_id UUID NOT NULL REFERENCES viego.viego_builds(id) ON DELETE CASCADE,
    skill_order VARCHAR(100) NOT NULL, -- e.g., "QWQEQRQWQE..."

    -- Statistics
    total_matches INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    win_rate NUMERIC(5, 2),

    -- Popularity
    pick_rate NUMERIC(5, 2),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_viego_skill_progression_order ON viego.viego_skill_progression(skill_order);
CREATE INDEX idx_viego_skill_progression_win_rate ON viego.viego_skill_progression(win_rate DESC);

-- Create triggers for analytics tables
CREATE TRIGGER update_viego_item_efficiency_updated_at BEFORE UPDATE ON viego.viego_item_efficiency
    FOR EACH ROW EXECUTE FUNCTION viego.update_updated_at_column();

CREATE TRIGGER update_viego_rune_efficiency_updated_at BEFORE UPDATE ON viego.viego_rune_efficiency
    FOR EACH ROW EXECUTE FUNCTION viego.update_updated_at_column();

CREATE TRIGGER update_viego_synergies_updated_at BEFORE UPDATE ON viego.viego_synergies
    FOR EACH ROW EXECUTE FUNCTION viego.update_updated_at_column();

CREATE TRIGGER update_viego_power_spikes_updated_at BEFORE UPDATE ON viego.viego_power_spikes
    FOR EACH ROW EXECUTE FUNCTION viego.update_updated_at_column();

CREATE TRIGGER update_content_guides_updated_at BEFORE UPDATE ON viego.content_guides
    FOR EACH ROW EXECUTE FUNCTION viego.update_updated_at_column();

CREATE TRIGGER update_content_tips_updated_at BEFORE UPDATE ON viego.content_tips
    FOR EACH ROW EXECUTE FUNCTION viego.update_updated_at_column();

CREATE TRIGGER update_matchup_analysis_updated_at BEFORE UPDATE ON viego.matchup_analysis
    FOR EACH ROW EXECUTE FUNCTION viego.update_updated_at_column();

CREATE TRIGGER update_viego_skill_progression_updated_at BEFORE UPDATE ON viego.viego_skill_progression
    FOR EACH ROW EXECUTE FUNCTION viego.update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA viego TO viego;
