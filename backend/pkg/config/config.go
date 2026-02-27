package config

import (
	"fmt"
	"strings"

	"github.com/spf13/viper"
)

// RegionConfig holds configuration for a specific region
type RegionConfig struct {
	PlatformID  string
	ClusterID   string
	Description string
}

// Config holds all application configuration
type Config struct {
	// Riot API
	RiotAPIKey string

	// Database
	PostgresURL   string
	RedisURL      string
	ClickHouseURL string

	// Messaging
	NATSURL string

	// Server
	Port     int
	LogLevel string

	// Regions
	Regions map[string]RegionConfig
}

// Load loads configuration from environment variables and defaults
func Load() (*Config, error) {
	v := viper.New()

	// Set defaults
	v.SetDefault("port", 8080)
	v.SetDefault("loglevel", "info")
	v.SetDefault("riotapikey", "")
	v.SetDefault("postgresurl", "postgres://localhost:5432/viegomains")
	v.SetDefault("redisurl", "redis://localhost:6379")
	v.SetDefault("clickhouseurl", "clickhouse://localhost:9000/viegomains")
	v.SetDefault("natsurl", "nats://localhost:4222")

	// Read from environment
	v.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	v.AutomaticEnv()

	cfg := &Config{
		RiotAPIKey:    v.GetString("riotapikey"),
		PostgresURL:   v.GetString("postgresurl"),
		RedisURL:      v.GetString("redisurl"),
		ClickHouseURL: v.GetString("clickhouseurl"),
		NATSURL:       v.GetString("natsurl"),
		Port:          v.GetInt("port"),
		LogLevel:      v.GetString("loglevel"),
		Regions: map[string]RegionConfig{
			"NA1": {
				PlatformID:  "NA1",
				ClusterID:   "AMERICAS",
				Description: "North America",
			},
			"BR1": {
				PlatformID:  "BR1",
				ClusterID:   "AMERICAS",
				Description: "Brazil",
			},
			"LA1": {
				PlatformID:  "LA1",
				ClusterID:   "AMERICAS",
				Description: "Latin America North",
			},
			"LA2": {
				PlatformID:  "LA2",
				ClusterID:   "AMERICAS",
				Description: "Latin America South",
			},
			"EUW1": {
				PlatformID:  "EUW1",
				ClusterID:   "EUROPE",
				Description: "Europe West",
			},
			"EUN1": {
				PlatformID:  "EUN1",
				ClusterID:   "EUROPE",
				Description: "Europe Nordic & East",
			},
			"RU": {
				PlatformID:  "RU",
				ClusterID:   "EUROPE",
				Description: "Russia",
			},
			"TR1": {
				PlatformID:  "TR1",
				ClusterID:   "EUROPE",
				Description: "Turkey",
			},
			"KR": {
				PlatformID:  "KR",
				ClusterID:   "ASIA",
				Description: "Korea",
			},
			"JP1": {
				PlatformID:  "JP1",
				ClusterID:   "ASIA",
				Description: "Japan",
			},
			"SG2": {
				PlatformID:  "SG2",
				ClusterID:   "SEA",
				Description: "Southeast Asia",
			},
			"PH2": {
				PlatformID:  "PH2",
				ClusterID:   "SEA",
				Description: "Philippines",
			},
			"TH2": {
				PlatformID:  "TH2",
				ClusterID:   "SEA",
				Description: "Thailand",
			},
			"TW2": {
				PlatformID:  "TW2",
				ClusterID:   "SEA",
				Description: "Taiwan",
			},
			"VN2": {
				PlatformID:  "VN2",
				ClusterID:   "SEA",
				Description: "Vietnam",
			},
			"OC1": {
				PlatformID:  "OC1",
				ClusterID:   "SEA",
				Description: "Oceania",
			},
		},
	}

	if err := cfg.Validate(); err != nil {
		return nil, err
	}

	return cfg, nil
}

// Validate validates the configuration
func (c *Config) Validate() error {
	if c.RiotAPIKey == "" {
		return fmt.Errorf("RIOTAPIKEY environment variable is required")
	}
	if c.Port <= 0 || c.Port > 65535 {
		return fmt.Errorf("invalid port: %d", c.Port)
	}
	return nil
}

// GetClusterForPlatform returns the regional cluster ID for a given platform
func (c *Config) GetClusterForPlatform(platformID string) (string, error) {
	region, ok := c.Regions[platformID]
	if !ok {
		return "", fmt.Errorf("unknown platform: %s", platformID)
	}
	return region.ClusterID, nil
}
