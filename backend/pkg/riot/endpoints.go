package riot

// Champion IDs
const (
	ViegoChampionID = 234
)

// Platform IDs
const (
	BR1  = "BR1"
	LA1  = "LA1"
	LA2  = "LA2"
	NA1  = "NA1"
	PH2  = "PH2"
	SG2  = "SG2"
	TH2  = "TH2"
	TW2  = "TW2"
	VN2  = "VN2"
	EUW1 = "EUW1"
	EUN1 = "EUN1"
	RU   = "RU"
	TR1  = "TR1"
	JP1  = "JP1"
	KR   = "KR"
	OC1  = "OC1"
)

// Regional Clusters
const (
	AMERICAS = "AMERICAS"
	EUROPE   = "EUROPE"
	ASIA     = "ASIA"
	SEA      = "SEA"
)

// PlatformToRegionalCluster maps platform IDs to regional clusters
var PlatformToCluster = map[string]string{
	BR1:  AMERICAS,
	LA1:  AMERICAS,
	LA2:  AMERICAS,
	NA1:  AMERICAS,
	PH2:  SEA,
	SG2:  SEA,
	TH2:  SEA,
	TW2:  SEA,
	VN2:  SEA,
	EUW1: EUROPE,
	EUN1: EUROPE,
	RU:   EUROPE,
	TR1:  EUROPE,
	JP1:  ASIA,
	KR:   ASIA,
	OC1:  SEA,
}

// API Endpoints (paths only, domain added dynamically)
const (
	// Account endpoints
	AccountByRiotIDEndpoint = "/riot/account/v1/accounts/by-riot-id/%s/%s"
	AccountByPUUIDEndpoint  = "/riot/account/v1/accounts/by-puuid/%s"

	// Summoner endpoints
	SummonerByPUUIDEndpoint     = "/lol/summoner/v4/summoners/by-puuid/%s"
	SummonerByNameEndpoint      = "/lol/summoner/v4/summoners/by-name/%s"
	SummonerBySummonerIDEndpoint = "/lol/summoner/v4/summoners/%s"

	// Match endpoints (use regional cluster)
	MatchListEndpoint     = "/lol/match/v5/matches/by-puuid/%s/ids"
	MatchDetailEndpoint   = "/lol/match/v5/matches/%s"
	MatchTimelineEndpoint = "/lol/match/v5/matches/%s/timeline"

	// Champion Mastery endpoints
	ChampionMasteryEndpoint        = "/lol/champion-mastery/v4/champion-masteries/by-summoner/%s"
	ChampionMasteryByChampionEndpoint = "/lol/champion-mastery/v4/champion-masteries/by-summoner/%s/by-champion/%d"
	ChampionMasteryTopEndpoint     = "/lol/champion-mastery/v4/champion-masteries/by-summoner/%s/top"
	ChampionMasteryScoreEndpoint   = "/lol/champion-mastery/v4/scores/by-summoner/%s"

	// League endpoints
	LeagueEntriesSummonerEndpoint = "/lol/league/v4/entries/by-summoner/%s"
	LeagueEntriesPageEndpoint     = "/lol/league/v4/entries/%s/%s"
	ChallengerLeagueEndpoint      = "/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5"
	GrandmasterLeagueEndpoint     = "/lol/league/v4/grandmasterleagues/by-queue/RANKED_SOLO_5x5"
	MasterLeagueEndpoint          = "/lol/league/v4/masterleagues/by-queue/RANKED_SOLO_5x5"

	// Data Dragon endpoints
	DataDragonBaseURL  = "https://ddragon.leagueoflegends.com"
	DataDragonVersions = "/api/versions.json"
	DataDragonChampions = "/cdn/%s/data/en_US/champion.json"
	DataDragonChampionDetail = "/cdn/%s/data/en_US/champion/%s.json"
	DataDragonItems   = "/cdn/%s/data/en_US/item.json"
	DataDragonRunes   = "/cdn/%s/data/en_US/runesReforged.json"
)

// Queue types
const (
	RankedSolo5x5   = "RANKED_SOLO_5x5"
	RankedFlex5x5   = "RANKED_FLEX_5x5"
	RankedFlexTT    = "RANKED_FLEX_TT"
)

// Tiers
var Tiers = []string{"IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "EMERALD", "DIAMOND", "MASTER", "GRANDMASTER", "CHALLENGER"}

// Ranks
var Ranks = []string{"I", "II", "III", "IV"}
