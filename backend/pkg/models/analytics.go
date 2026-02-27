package models

import "time"

// RoleAnalysis represents analysis of Viego in a specific role
type RoleAnalysis struct {
	Role              string    `json:"role"`
	PickRate          float32   `json:"pick_rate"`
	BanRate           float32   `json:"ban_rate"`
	WinRate           float32   `json:"win_rate"`
	MatchCount        int       `json:"match_count"`
	AvgKDA            float32   `json:"avg_kda"`
	AvgKills          float32   `json:"avg_kills"`
	AvgDeaths         float32   `json:"avg_deaths"`
	AvgAssists        float32   `json:"avg_assists"`
	RecommendedBuilds []ViegoBuild `json:"recommended_builds"`
	PopularRunes      []RuneTree `json:"popular_runes"`
	Matchups          []ViegoMatchup `json:"matchups"`
	UpdatedAt         time.Time `json:"updated_at"`
}

// MetaStats represents current meta statistics
type MetaStats struct {
	PatchVersion      string           `json:"patch_version"`
	ChampionTierList  []ChampionMetaTier `json:"champion_tier_list"`
	ViegoRank         int              `json:"viego_rank"`
	MetaRole          string           `json:"meta_role"`
	BanPercentage     float32          `json:"ban_percentage"`
	PickPercentage    float32          `json:"pick_percentage"`
	UpdatedAt         time.Time        `json:"updated_at"`
}

// ChampionMetaTier represents a champion's tier in the current meta
type ChampionMetaTier struct {
	ChampionID   int     `json:"champion_id"`
	ChampionName string  `json:"champion_name"`
	Tier         string  `json:"tier"` // S, A, B, C, D
	WinRate      float32 `json:"win_rate"`
	PickRate     float32 `json:"pick_rate"`
	BanRate      float32 `json:"ban_rate"`
}

// EloDistribution represents distribution of players across elo brackets
type EloDistribution struct {
	Elo          string `json:"elo"`
	PlayerCount  int    `json:"player_count"`
	WinRate      float32 `json:"win_rate"`
	PickRate     float32 `json:"pick_rate"`
	AvgKDA       float32 `json:"avg_kda"`
}

// ItemEfficiency represents item efficiency statistics
type ItemEfficiency struct {
	ItemID       int     `json:"item_id"`
	ItemName     string  `json:"item_name"`
	WinRate      float32 `json:"win_rate"`
	PickRate     float32 `json:"pick_rate"`
	AvgGameTime  int     `json:"avg_game_time"`
	SynergyScore float32 `json:"synergy_score"`
}

// RuneEfficiency represents rune efficiency statistics
type RuneEfficiency struct {
	RuneID       int     `json:"rune_id"`
	RuneName     string  `json:"rune_name"`
	WinRate      float32 `json:"win_rate"`
	PickRate     float32 `json:"pick_rate"`
	SynergyScore float32 `json:"synergy_score"`
}

// PowerSpike represents a power spike in the game
type PowerSpike struct {
	GameTime     int     `json:"game_time"` // in minutes
	Items        []Item  `json:"items"`
	Level        int     `json:"level"`
	WinRateBoost float32 `json:"win_rate_boost"`
	Description  string  `json:"description"`
}

// Synergy represents synergy between items or runes
type Synergy struct {
	Item1ID   int     `json:"item_1_id"`
	Item2ID   int     `json:"item_2_id"`
	Score     float32 `json:"score"`
	WinRate   float32 `json:"win_rate"`
	Frequency float32 `json:"frequency"`
}

// MatchupData represents detailed matchup information
type MatchupData struct {
	ChampionID       int     `json:"champion_id"`
	EnemyChampionID  int     `json:"enemy_champion_id"`
	WinRate          float32 `json:"win_rate"`
	KillParticipation float32 `json:"kill_participation"`
	FirstBloodRate   float32 `json:"first_blood_rate"`
	CounterItems     []Item  `json:"counter_items"`
	CounterRunes     []Rune  `json:"counter_runes"`
}

// PatchNotes represents patch notes impact on champion
type PatchNotes struct {
	PatchVersion string    `json:"patch_version"`
	Changes      []string  `json:"changes"`
	ImpactScore  int       `json:"impact_score"` // -5 to 5
	TrendChange  float32   `json:"trend_change"` // percentage change
	ReleasedAt   time.Time `json:"released_at"`
}

// Analytics represents comprehensive analytics
type Analytics struct {
	CurrentPatch      string               `json:"current_patch"`
	RoleAnalyses      []RoleAnalysis       `json:"role_analyses"`
	MetaStats         MetaStats            `json:"meta_stats"`
	EloDistributions  []EloDistribution    `json:"elo_distributions"`
	ItemEfficiencies  []ItemEfficiency     `json:"item_efficiencies"`
	RuneEfficiencies  []RuneEfficiency     `json:"rune_efficiencies"`
	PowerSpikes       []PowerSpike         `json:"power_spikes"`
	Synergies         []Synergy            `json:"synergies"`
	Matchups          []MatchupData        `json:"matchups"`
	PatchHistory      []PatchNotes         `json:"patch_history"`
	UpdatedAt         time.Time            `json:"updated_at"`
}
