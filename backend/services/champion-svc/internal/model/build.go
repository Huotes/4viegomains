package model

import (
	"database/sql"
	"database/sql/driver"
	"encoding/json"
)

// BuildData represents build information from the database
type BuildData struct {
	ID              string          `json:"id"`
	Patch           string          `json:"patch"`
	Role            string          `json:"role"`
	EloTier         string          `json:"elo_tier"`
	BuildPath       JSONArray       `json:"build_path"`
	WinRate         float32         `json:"win_rate"`
	PickRate        float32         `json:"pick_rate"`
	SampleSize      int64           `json:"sample_size"`
	AvgKDA          float32         `json:"avg_kda"`
	AvgGameLength   float32         `json:"avg_game_length"`
	SkillOrder      JSONArray       `json:"skill_order"`
	SummonerSpells  JSONArray       `json:"summoner_spells"`
}

// ItemStageData represents items grouped by stage
type ItemStageData struct {
	Stage string        `json:"stage"`
	Items []ItemData    `json:"items"`
}

// ItemData represents a single item
type ItemData struct {
	ID          int     `json:"id"`
	Name        string  `json:"name"`
	WinRate     float32 `json:"win_rate"`
	PickRate    float32 `json:"pick_rate"`
	Description string  `json:"description,omitempty"`
}

// SkillOrderData represents a skill order sequence
type SkillOrderData struct {
	Order        string  `json:"order"`
	WinRate      float32 `json:"win_rate"`
	PickRate     float32 `json:"pick_rate"`
	Frequency    int64   `json:"frequency"`
}

// SummonerSpellData represents a summoner spell combination
type SummonerSpellData struct {
	Summoner1  int     `json:"summoner_1"`
	Summoner2  int     `json:"summoner_2"`
	WinRate    float32 `json:"win_rate"`
	PickRate   float32 `json:"pick_rate"`
	Frequency  int64   `json:"frequency"`
}

// JSONArray is a custom type for handling JSON arrays in PostgreSQL
type JSONArray []interface{}

// Scan implements the sql.Scanner interface for reading from the database
func (a *JSONArray) Scan(value interface{}) error {
	if value == nil {
		*a = nil
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return sql.ErrNoRows
	}

	result := JSONArray{}
	if err := json.Unmarshal(bytes, &result); err != nil {
		return err
	}
	*a = result
	return nil
}

// Value implements the driver.Valuer interface for writing to the database
func (a JSONArray) Value() (driver.Value, error) {
	return json.Marshal(a)
}

// MarshalJSON implements the json.Marshaler interface
func (a JSONArray) MarshalJSON() ([]byte, error) {
	return json.Marshal([]interface{}(a))
}

// UnmarshalJSON implements the json.Unmarshaler interface
func (a *JSONArray) UnmarshalJSON(data []byte) error {
	return json.Unmarshal(data, (*[]interface{})(a))
}
