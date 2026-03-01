package riot

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// DataDragonClient is the HTTP client for Data Dragon
type DataDragonClient struct {
	httpClient *http.Client
	version    string
	versionTTL time.Time
}

// NewDataDragonClient creates a new Data Dragon client
func NewDataDragonClient() *DataDragonClient {
	return &DataDragonClient{
		httpClient: &http.Client{Timeout: 30 * time.Second},
	}
}

// GetLatestVersion fetches the latest Data Dragon version
func (c *DataDragonClient) GetLatestVersion(ctx context.Context) (string, error) {
	// Return cached version if still valid
	if c.version != "" && time.Now().Before(c.versionTTL) {
		return c.version, nil
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, DataDragonBaseURL+DataDragonVersions, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("API error %d: %s", resp.StatusCode, string(body))
	}

	var versions []string
	if err := json.NewDecoder(resp.Body).Decode(&versions); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	if len(versions) == 0 {
		return "", fmt.Errorf("no versions available")
	}

	// Cache for 24 hours
	c.version = versions[0]
	c.versionTTL = time.Now().Add(24 * time.Hour)

	return c.version, nil
}

// ChampionData represents champion data from Data Dragon
type ChampionData struct {
	Type    string                     `json:"type"`
	Format  string                     `json:"format"`
	Version string                     `json:"version"`
	Data    map[string]ChampionDetails `json:"data"`
}

// ChampionDetails represents details about a specific champion
type ChampionDetails struct {
	ID      string `json:"id"`
	Key     string `json:"key"`
	Name    string `json:"name"`
	Title   string `json:"title"`
	Image   ChampionImage `json:"image"`
	Info    ChampionInfo  `json:"info"`
	Stats   ChampionStats `json:"stats"`
	Spells  []ChampionSpell `json:"spells"`
	Passive ChampionPassive `json:"passive"`
}

// ChampionImage represents champion image information
type ChampionImage struct {
	Full   string `json:"full"`
	Sprite string `json:"sprite"`
	Group  string `json:"group"`
	X      int    `json:"x"`
	Y      int    `json:"y"`
	W      int    `json:"w"`
	H      int    `json:"h"`
}

// ChampionInfo represents champion info stats
type ChampionInfo struct {
	Attack    int `json:"attack"`
	Defense   int `json:"defense"`
	Magic     int `json:"magic"`
	Difficulty int `json:"difficulty"`
}

// ChampionStats represents champion base stats
type ChampionStats struct {
	HP                float64 `json:"hp"`
	HPPerLevel        float64 `json:"hpperlevel"`
	MP                float64 `json:"mp"`
	MPPerLevel        float64 `json:"mpperlevel"`
	MoveSpeed         float64 `json:"movespeed"`
	Armor             float64 `json:"armor"`
	ArmorPerLevel     float64 `json:"armorperlevel"`
	SpellBlock        float64 `json:"spellblock"`
	SpellBlockPerLevel float64 `json:"spellblockperlevel"`
	AttackRange       float64 `json:"attackrange"`
	HPRegen           float64 `json:"hpregen"`
	HPRegenPerLevel   float64 `json:"hpregenperlevel"`
	MPRegen           float64 `json:"mpregen"`
	MPRegenPerLevel   float64 `json:"mpregenperlevel"`
	CriticalStrike    float64 `json:"crit"`
	CriticalPerLevel  float64 `json:"critperlevel"`
	AttackDamage      float64 `json:"attackdamage"`
	AttackDamagePerLevel float64 `json:"attackdamageperlevel"`
	AttackSpeed       float64 `json:"attackspeed"`
	AttackSpeedPerLevel float64 `json:"attackspeedperlevel"`
}

// ChampionSpell represents a champion spell
type ChampionSpell struct {
	ID            string   `json:"id"`
	Name          string   `json:"name"`
	Description   string   `json:"description"`
	Tooltip       string   `json:"tooltip"`
	LevelUpTip    struct {
		Label  []string `json:"label"`
		Effect []string `json:"effect"`
	} `json:"leveltip"`
	MaxRank   int    `json:"maxrank"`
	Range     interface{} `json:"range"` // Can be int or []int
	Cooldown  []float64 `json:"cooldown"`
	Cost      []int    `json:"cost"`
	CostType  string   `json:"costType"`
	Damage    []float64 `json:"damage,omitempty"`
	DamageType string   `json:"damageType,omitempty"`
	Image     ChampionImage `json:"image"`
	Resource  string   `json:"resource"`
}

// ChampionPassive represents a champion passive
type ChampionPassive struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Image       ChampionImage `json:"image"`
}

// GetAllChampions fetches all champions
func (c *DataDragonClient) GetAllChampions(ctx context.Context) (*ChampionData, error) {
	version, err := c.GetLatestVersion(ctx)
	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf(DataDragonBaseURL+DataDragonChampions, version)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error %d: %s", resp.StatusCode, string(body))
	}

	var data ChampionData
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &data, nil
}

// GetChampionByName fetches details for a specific champion
func (c *DataDragonClient) GetChampionByName(ctx context.Context, championName string) (*ChampionDetails, error) {
	version, err := c.GetLatestVersion(ctx)
	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf(DataDragonBaseURL+DataDragonChampionDetail, version, championName)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error %d: %s", resp.StatusCode, string(body))
	}

	var wrapper struct {
		Data map[string]ChampionDetails `json:"data"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&wrapper); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	if len(wrapper.Data) == 0 {
		return nil, fmt.Errorf("champion not found: %s", championName)
	}

	for _, details := range wrapper.Data {
		return &details, nil
	}

	return nil, fmt.Errorf("champion not found: %s", championName)
}

// ItemData represents item data from Data Dragon
type ItemData struct {
	Type    string                `json:"type"`
	Version string                `json:"version"`
	Data    map[string]ItemDetails `json:"data"`
}

// ItemDetails represents details about a specific item
type ItemDetails struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Plaintext   string   `json:"plaintext"`
	Image       ChampionImage `json:"image"`
	Gold        struct {
		Base        int  `json:"base"`
		Purchasable bool `json:"purchasable"`
		Total       int  `json:"total"`
		Sell        int  `json:"sell"`
	} `json:"gold"`
	Tags  []string `json:"tags"`
	Stats struct {
		FlatHPPoolMod          float64 `json:"FlatHPPoolMod"`
		FlatMPPoolMod          float64 `json:"FlatMPPoolMod"`
		FlatMovementSpeedMod   float64 `json:"FlatMovementSpeedMod"`
		PercentMovementSpeedMod float64 `json:"PercentMovementSpeedMod"`
		FlatArmorMod           float64 `json:"FlatArmorMod"`
		FlatMagicDamageMod     float64 `json:"FlatMagicDamageMod"`
		FlatPhysicalDamageMod  float64 `json:"FlatPhysicalDamageMod"`
		FlatSpellBlockMod      float64 `json:"FlatSpellBlockMod"`
		FlatCritChanceMod      float64 `json:"FlatCritChanceMod"`
		PercentCritChanceMod   float64 `json:"PercentCritChanceMod"`
		FlatLifeStealMod       float64 `json:"FlatLifeStealMod"`
		PercentLifeStealMod    float64 `json:"PercentLifeStealMod"`
		FlatCooldownMod        float64 `json:"FlatCooldownMod"`
		PercentCooldownMod     float64 `json:"PercentCooldownMod"`
	} `json:"stats"`
}

// GetAllItems fetches all items
func (c *DataDragonClient) GetAllItems(ctx context.Context) (*ItemData, error) {
	version, err := c.GetLatestVersion(ctx)
	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf(DataDragonBaseURL+DataDragonItems, version)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error %d: %s", resp.StatusCode, string(body))
	}

	var data ItemData
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return &data, nil
}

// RuneData represents rune data from Data Dragon
type RuneData struct {
	ID   int    `json:"id"`
	Key  string `json:"key"`
	Icon string `json:"icon"`
	Name string `json:"name"`
	Slots []struct {
		Runes []struct {
			ID   int    `json:"id"`
			Key  string `json:"key"`
			Icon string `json:"icon"`
			Name string `json:"name"`
			ShortDesc string `json:"shortDesc"`
			LongDesc  string `json:"longDesc"`
		} `json:"runes"`
	} `json:"slots"`
}

// GetAllRunes fetches all runes
func (c *DataDragonClient) GetAllRunes(ctx context.Context) ([]RuneData, error) {
	version, err := c.GetLatestVersion(ctx)
	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf(DataDragonBaseURL+DataDragonRunes, version)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("API error %d: %s", resp.StatusCode, string(body))
	}

	var data []RuneData
	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return data, nil
}
