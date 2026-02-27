package models

import "time"

// LeaderboardEntry represents a single leaderboard entry
type LeaderboardEntry struct {
	Rank             int              `json:"rank"`
	Player           TrackedPlayer    `json:"player"`
	ViegoMasteryLevel int             `json:"viego_mastery_level"`
	ViegoMatches     int              `json:"viego_matches"`
	ViegoWinRate     float32          `json:"viego_win_rate"`
	OTPScore         OTPScore         `json:"otp_score"`
	RankedTier       string           `json:"ranked_tier"`
	RankedRank       string           `json:"ranked_rank"`
	RankedLP         int              `json:"ranked_lp"`
	Region           string           `json:"region"`
	LastUpdated      time.Time        `json:"last_updated"`
}

// OTPScore represents a One-Trick-Pony score
type OTPScore struct {
	Score          float32        `json:"score"` // 0-100
	Components     OTPComponents  `json:"components"`
	Percentile     float32        `json:"percentile"` // 0-100
	GlobalRank     int            `json:"global_rank"`
	RegionalRank   int            `json:"regional_rank"`
	Updated        time.Time      `json:"updated"`
}

// OTPComponents represents the components that make up the OTP score
type OTPComponents struct {
	MasteryDedication float32 `json:"mastery_dedication"` // Mastery level and points
	PlayRate          float32 `json:"play_rate"`          // % of matches on champion
	WinRate           float32 `json:"win_rate"`           // Win rate consistency
	RankConcentration float32 `json:"rank_concentration"` // How concentrated wins are at specific elo
	Consistency       float32 `json:"consistency"`        // Recent vs overall stats
	Specialization    float32 `json:"specialization"`     // Viego-specific role/build mastery
}

// Leaderboard represents the full leaderboard
type Leaderboard struct {
	Region       string             `json:"region"`
	Entries      []LeaderboardEntry `json:"entries"`
	TotalPlayers int                `json:"total_players"`
	UpdatedAt    time.Time          `json:"updated_at"`
}

// LeaderboardFilters represents filtering options for leaderboards
type LeaderboardFilters struct {
	Region        string // Specific region or "GLOBAL"
	MinMasteryLevel int
	MinMatches      int
	MinRank         string // E.g., "DIAMOND"
	SortBy          string // "otp_score", "win_rate", "matches", "rank"
	Order           string // "asc" or "desc"
	Limit           int
	Offset          int
}

// LeaderboardStats represents aggregated leaderboard statistics
type LeaderboardStats struct {
	TotalTrackedPlayers int     `json:"total_tracked_players"`
	AverageOTPScore     float32 `json:"average_otp_score"`
	AverageWinRate      float32 `json:"average_win_rate"`
	AverageMasteryLevel float32 `json:"average_mastery_level"`
	TopPlayer           *LeaderboardEntry `json:"top_player"`
	RegionalStats       map[string]RegionalStats `json:"regional_stats"`
}

// RegionalStats represents region-specific leaderboard statistics
type RegionalStats struct {
	Region              string  `json:"region"`
	PlayerCount         int     `json:"player_count"`
	AverageOTPScore     float32 `json:"average_otp_score"`
	AverageWinRate      float32 `json:"average_win_rate"`
	AverageMasteryLevel float32 `json:"average_mastery_level"`
	TopPlayer           *LeaderboardEntry `json:"top_player"`
}

// PlayerRankHistory represents a player's rank history
type PlayerRankHistory struct {
	PlayerID  int       `json:"player_id"`
	OTPScores []OTPScoreSnapshot `json:"otp_scores"`
	RankHistory []RankSnapshot `json:"rank_history"`
}

// OTPScoreSnapshot represents an OTP score at a point in time
type OTPScoreSnapshot struct {
	Score       float32   `json:"score"`
	Rank        int       `json:"rank"`
	Percentile  float32   `json:"percentile"`
	RecordedAt  time.Time `json:"recorded_at"`
}

// RankSnapshot represents a rank at a point in time
type RankSnapshot struct {
	Tier        string    `json:"tier"`
	Rank        string    `json:"rank"`
	LeaguePoints int      `json:"league_points"`
	RecordedAt  time.Time `json:"recorded_at"`
}
