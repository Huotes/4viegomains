package model

import (
	"database/sql/driver"
	"encoding/json"
)

// MatchupData represents a matchup between Viego and an enemy champion
type MatchupData struct {
	ID              string      `json:"id"`
	Patch           string      `json:"patch"`
	Role            string      `json:"role"`
	EloTier         string      `json:"elo_tier"`
	EnemyChampion   int         `json:"enemy_champion"`
	WinRate         float32     `json:"win_rate"`
	SampleSize      int64       `json:"sample_size"`
	AvgKDA          float32     `json:"avg_kda"`
	GoldDiff15      float32     `json:"gold_diff_15"`
	CSDiff15        float32     `json:"cs_diff_15"`
	Tips            StringArray `json:"tips"`
}

// CountersData represents counter matchups response
type CountersData struct {
	Hardest []MatchupData `json:"hardest"`
	Easiest []MatchupData `json:"easiest"`
}

// MetaStatsData represents meta statistics
type MetaStatsData struct {
	ID            string  `json:"id"`
	Patch         string  `json:"patch"`
	Role          string  `json:"role"`
	EloTier       string  `json:"elo_tier"`
	WinRate       float32 `json:"win_rate"`
	PickRate      float32 `json:"pick_rate"`
	BanRate       float32 `json:"ban_rate"`
	AvgKDA        float32 `json:"avg_kda"`
	AvgCSMin      float32 `json:"avg_cs_min"`
	AvgGoldMin    float32 `json:"avg_gold_min"`
	AvgDamageMin  float32 `json:"avg_damage_min"`
	AvgVision     float32 `json:"avg_vision"`
	TierRank      int     `json:"tier_rank"`
	TotalGames    int64   `json:"total_games"`
	SnapshotDate  string  `json:"snapshot_date"`
}

// StringArray is a custom type for handling string arrays in PostgreSQL
type StringArray []string

// Scan implements the sql.Scanner interface for reading from the database
func (a *StringArray) Scan(value interface{}) error {
	if value == nil {
		*a = nil
		return nil
	}

	// Try to unmarshal JSON
	bytes, ok := value.([]byte)
	if ok {
		result := StringArray{}
		if err := json.Unmarshal(bytes, &result); err != nil {
			return err
		}
		*a = result
		return nil
	}

	return nil
}

// Value implements the driver.Valuer interface for writing to the database
func (a StringArray) Value() (driver.Value, error) {
	return json.Marshal(a)
}

// MarshalJSON implements the json.Marshaler interface
func (a StringArray) MarshalJSON() ([]byte, error) {
	return json.Marshal([]string(a))
}

// UnmarshalJSON implements the json.Unmarshaler interface
func (a *StringArray) UnmarshalJSON(data []byte) error {
	return json.Unmarshal(data, (*[]string)(a))
}
