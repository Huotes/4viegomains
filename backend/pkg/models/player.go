package models

import "time"

// TrackedPlayer represents a player being tracked
type TrackedPlayer struct {
	ID            int       `json:"id"`
	PUUID         string    `json:"puuid"`
	SummonerID    string    `json:"summoner_id"`
	GameName      string    `json:"game_name"`
	TagLine       string    `json:"tag_line"`
	PlatformID    string    `json:"platform_id"`
	SummonerLevel int       `json:"summoner_level"`
	ProfileIcon   int       `json:"profile_icon"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

// MatchSummary represents a summary of a player's match
type MatchSummary struct {
	MatchID        string    `json:"match_id"`
	Timestamp      int64     `json:"timestamp"`
	GameDuration   int64     `json:"game_duration"`
	ChampionID     int       `json:"champion_id"`
	ChampionName   string    `json:"champion_name"`
	Role           string    `json:"role"`
	Lane           string    `json:"lane"`
	Kills          int       `json:"kills"`
	Deaths         int       `json:"deaths"`
	Assists        int       `json:"assists"`
	GoldEarned     int       `json:"gold_earned"`
	CreepScore     int       `json:"creep_score"`
	DamageDealt    int       `json:"damage_dealt"`
	DamageTaken    int       `json:"damage_taken"`
	VisionScore    int       `json:"vision_score"`
	Win            bool      `json:"win"`
	Items          [7]int    `json:"items"`
	Runes          [6]int    `json:"runes"`
	SummonerSpells [2]int    `json:"summoner_spells"`
	CreatedAt      time.Time `json:"created_at"`
}

// PlayerProfile represents a player's overall profile
type PlayerProfile struct {
	Player           TrackedPlayer `json:"player"`
	ViegoStats       ViegoStats    `json:"viego_stats"`
	RankedStats      RankedStats   `json:"ranked_stats"`
	RecentMatches    []MatchSummary `json:"recent_matches"`
	ViegoBuilds      []ViegoBuild   `json:"viego_builds"`
	ViegoMatchups    []ViegoMatchup `json:"viego_matchups"`
	PerformanceIndex PerformanceIndex `json:"performance_index"`
	LastUpdated      time.Time     `json:"last_updated"`
}

// ViegoStats represents Viego-specific statistics
type ViegoStats struct {
	MasteryLevel   int       `json:"mastery_level"`
	MasteryPoints  int       `json:"mastery_points"`
	TotalMatches   int       `json:"total_matches"`
	WinRate        float32   `json:"win_rate"`
	PickRate       float32   `json:"pick_rate"`
	BanRate        float32   `json:"ban_rate"`
	AvgKDA         float32   `json:"avg_kda"`
	AvgKills       float32   `json:"avg_kills"`
	AvgDeaths      float32   `json:"avg_deaths"`
	AvgAssists     float32   `json:"avg_assists"`
	AvgGoldPM      float32   `json:"avg_gold_per_minute"`
	AvgCSPM        float32   `json:"avg_cs_per_minute"`
	AvgVisionScore float32   `json:"avg_vision_score"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// RankedStats represents ranked statistics
type RankedStats struct {
	Tier         string    `json:"tier"`
	Rank         string    `json:"rank"`
	LeaguePoints int       `json:"league_points"`
	Wins         int       `json:"wins"`
	Losses       int       `json:"losses"`
	WinRate      float32   `json:"win_rate"`
	HotStreak    bool      `json:"hot_streak"`
	Veteran      bool      `json:"veteran"`
	FreshBlood   bool      `json:"fresh_blood"`
	Inactive     bool      `json:"inactive"`
	UpdatedAt    time.Time `json:"updated_at"`
}

// PerformanceIndex represents a composite performance score
type PerformanceIndex struct {
	Overall        float32 `json:"overall"`
	Combat         float32 `json:"combat"`
	Farming        float32 `json:"farming"`
	Vision         float32 `json:"vision"`
	Objectives     float32 `json:"objectives"`
	Consistency    float32 `json:"consistency"`
	Aggression     float32 `json:"aggression"`
	TeamPlay       float32 `json:"team_play"`
}

// PlayerComparison represents a comparison between two players
type PlayerComparison struct {
	Player1      TrackedPlayer    `json:"player_1"`
	Player2      TrackedPlayer    `json:"player_2"`
	HeadToHead   HeadToHeadStats  `json:"head_to_head"`
	StatComparison map[string]interface{} `json:"stat_comparison"`
}

// HeadToHeadStats represents head-to-head statistics
type HeadToHeadStats struct {
	Player1Wins   int     `json:"player_1_wins"`
	Player2Wins   int     `json:"player_2_wins"`
	TotalMatches  int     `json:"total_matches"`
	Player1WinRate float32 `json:"player_1_win_rate"`
	Player2WinRate float32 `json:"player_2_win_rate"`
}
