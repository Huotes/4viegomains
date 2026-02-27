package models

import "time"

// ViegoBuild represents a Viego build
type ViegoBuild struct {
	ID             string `json:"id"`
	Name           string `json:"name"`
	Role           string `json:"role"` // Mid, Support, etc.
	Items          []Item `json:"items"`
	Runes          ViegoRunes `json:"runes"`
	SkillOrder     SkillOrder `json:"skill_order"`
	SummonerSpells [2]SummonerSpell `json:"summoner_spells"`
	WinRate        float32 `json:"win_rate"`
	Frequency      float32 `json:"frequency"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// Item represents an item
type Item struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Cost        int    `json:"cost"`
	IconURL     string `json:"icon_url"`
}

// ViegoRunes represents Viego rune configuration
type ViegoRunes struct {
	PrimaryTree    RuneTree `json:"primary_tree"`
	SecondaryTree  RuneTree `json:"secondary_tree"`
	StatPerks      [3]int   `json:"stat_perks"`
}

// RuneTree represents a rune tree (Primary or Secondary)
type RuneTree struct {
	TreeID       int    `json:"tree_id"`
	TreeName     string `json:"tree_name"`
	KeystoneRune Rune   `json:"keystone_rune"`
	Runes        [3]Rune `json:"runes"`
}

// Rune represents a single rune
type Rune struct {
	ID          int    `json:"id"`
	Key         string `json:"key"`
	Name        string `json:"name"`
	Description string `json:"description"`
	IconURL     string `json:"icon_url"`
}

// SkillOrder represents the skill upgrade order
type SkillOrder struct {
	Q []int `json:"q"` // Levels for Q
	W []int `json:"w"` // Levels for W
	E []int `json:"e"` // Levels for E
	R []int `json:"r"` // Levels for R
}

// SummonerSpell represents a summoner spell
type SummonerSpell struct {
	ID          int    `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	IconURL     string `json:"icon_url"`
}

// ViegoMatchup represents Viego vs another champion matchup
type ViegoMatchup struct {
	EnemyChampionID   int       `json:"enemy_champion_id"`
	EnemyChampionName string    `json:"enemy_champion_name"`
	WinRate           float32   `json:"win_rate"`
	MatchCount        int       `json:"match_count"`
	AvgKDA            float32   `json:"avg_kda"`
	Tips              []string  `json:"tips"`
	CounterItems      []Item    `json:"counter_items"`
	CreatedAt         time.Time `json:"created_at"`
}

// ViegoPerformanceAnalysis represents performance breakdown
type ViegoPerformanceAnalysis struct {
	ELOBracket   string  `json:"elo_bracket"` // Iron, Bronze, Silver, Gold, Platinum, Emerald, Diamond, Master+
	WinRate      float32 `json:"win_rate"`
	PickRate     float32 `json:"pick_rate"`
	BanRate      float32 `json:"ban_rate"`
	MatchCount   int     `json:"match_count"`
	AvgKDA       float32 `json:"avg_kda"`
	AvgKills     float32 `json:"avg_kills"`
	AvgDeaths    float32 `json:"avg_deaths"`
	AvgAssists   float32 `json:"avg_assists"`
	AvgGoldPM    float32 `json:"avg_gold_per_minute"`
	AvgCSPM      float32 `json:"avg_cs_per_minute"`
	AvgVisionScore float32 `json:"avg_vision_score"`
	UpdatedAt    time.Time `json:"updated_at"`
}
