package model

import (
	"database/sql/driver"
	"encoding/json"
)

// RunePageData represents a complete rune page
type RunePageData struct {
	ID             string    `json:"id"`
	Patch          string    `json:"patch"`
	Role           string    `json:"role"`
	EloTier        string    `json:"elo_tier"`
	PrimaryTree    int       `json:"primary_tree"`
	PrimaryRunes   IntArray  `json:"primary_runes"`
	SecondaryTree  int       `json:"secondary_tree"`
	SecondaryRunes IntArray  `json:"secondary_runes"`
	StatShards     IntArray  `json:"stat_shards"`
	WinRate        float32   `json:"win_rate"`
	PickRate       float32   `json:"pick_rate"`
	SampleSize     int64     `json:"sample_size"`
}

// IntArray is a custom type for handling integer arrays in PostgreSQL
type IntArray []int

// Scan implements the sql.Scanner interface for reading from the database
func (a *IntArray) Scan(value interface{}) error {
	if value == nil {
		*a = nil
		return nil
	}

	// Try to unmarshal JSON
	bytes, ok := value.([]byte)
	if ok {
		result := IntArray{}
		if err := json.Unmarshal(bytes, &result); err != nil {
			return err
		}
		*a = result
		return nil
	}

	return nil
}

// Value implements the driver.Valuer interface for writing to the database
func (a IntArray) Value() (driver.Value, error) {
	return json.Marshal(a)
}

// MarshalJSON implements the json.Marshaler interface
func (a IntArray) MarshalJSON() ([]byte, error) {
	return json.Marshal([]int(a))
}

// UnmarshalJSON implements the json.Unmarshaler interface
func (a *IntArray) UnmarshalJSON(data []byte) error {
	return json.Unmarshal(data, (*[]int)(a))
}
