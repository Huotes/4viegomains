package riot

// AccountDTO represents an account on a given platform
type AccountDTO struct {
	PUUID    string `json:"puuid"`
	GameName string `json:"gameName"`
	TagLine  string `json:"tagLine"`
}

// SummonerDTO represents a summoner
type SummonerDTO struct {
	ID            string `json:"id"`
	AccountID     string `json:"accountId"`
	PUUID         string `json:"puuid"`
	Name          string `json:"name"`
	ProfileIconID int    `json:"profileIconId"`
	SummonerLevel int    `json:"summonerLevel"`
	RevisionDate   int64  `json:"revisionDate"`
}

// ChampionMasteryDTO represents a champion mastery entry
type ChampionMasteryDTO struct {
	SummonerID             string `json:"summonerId"`
	ChampionID             int    `json:"championId"`
	ChampionLevel          int    `json:"championLevel"`
	ChampionPoints         int    `json:"championPoints"`
	LastPlayTime           int64  `json:"lastPlayTime"`
	ChampionPointsSinceLastLevel int `json:"championPointsSinceLastLevel"`
	ChampionPointsUntilNextLevel int `json:"championPointsUntilNextLevel"`
	IsChestEarned          bool   `json:"isChestEarned"`
	IsSeasonChestEarned    bool   `json:"isSeasonChestEarned"`
}

// LeagueEntryDTO represents a single league entry
type LeagueEntryDTO struct {
	LeagueID     string `json:"leagueId"`
	SummonerID   string `json:"summonerId"`
	SummonerName string `json:"summonerName"`
	QueueType    string `json:"queueType"`
	Tier         string `json:"tier"`
	Rank         string `json:"rank"`
	LeaguePoints int    `json:"leaguePoints"`
	Wins         int    `json:"wins"`
	Losses       int    `json:"losses"`
	HotStreak    bool   `json:"hotStreak"`
	Veteran      bool   `json:"veteran"`
	FreshBlood   bool   `json:"freshBlood"`
	Inactive     bool   `json:"inactive"`
}

// LeagueListDTO represents a league list response
type LeagueListDTO struct {
	Tier    string            `json:"tier"`
	Entries []LeagueEntryDTO  `json:"entries"`
	Queue   string            `json:"queue"`
	Name    string            `json:"name"`
}

// MatchDTO represents a match
type MatchDTO struct {
	Metadata   MatchMetadataDTO `json:"metadata"`
	Info       MatchInfoDTO     `json:"info"`
}

// MatchMetadataDTO represents match metadata
type MatchMetadataDTO struct {
	DataVersion  string   `json:"dataVersion"`
	MatchID      string   `json:"matchId"`
	Participants []string `json:"participants"`
}

// MatchInfoDTO represents match info
type MatchInfoDTO struct {
	GameID            int64             `json:"gameId"`
	GameName          string            `json:"gameName"`
	GameStartTime     int64             `json:"gameStartTime"`
	GameEndTime       int64             `json:"gameEndTime"`
	GameDuration      int64             `json:"gameDuration"`
	GameVersion       string            `json:"gameVersion"`
	GameMode          string            `json:"gameMode"`
	GameType          string            `json:"gameType"`
	MapID             int               `json:"mapId"`
	PlatformID        string            `json:"platformId"`
	Queue             int               `json:"queueId"`
	TournamentCode    string            `json:"tournamentCode"`
	SeasonID          int               `json:"seasonId"`
	Participants      []ParticipantDTO  `json:"participants"`
	Teams             []TeamDTO         `json:"teams"`
}

// ParticipantDTO represents a participant in a match
type ParticipantDTO struct {
	PUUID                         string                   `json:"puuid"`
	ParticipantID                 int                      `json:"participantId"`
	TeamID                        int                      `json:"teamId"`
	ChampionID                    int                      `json:"championId"`
	ChampionName                  string                   `json:"championName"`
	ChampionTransform             int                      `json:"championTransform"`
	IndividualPosition            string                   `json:"individualPosition"`
	Role                          string                   `json:"role"`
	Lane                          string                   `json:"lane"`
	SummonerID                    string                   `json:"summonerId"`
	SummonerName                  string                   `json:"summonerName"`
	SummonerLevel                 int                      `json:"summonerLevel"`
	ProfileIcon                   int                      `json:"profileIcon"`
	Spell1ID                      int                      `json:"spell1Id"`
	Spell2ID                      int                      `json:"spell2Id"`
	Runes                         []RuneDTO                `json:"perks"`
	Items                         [7]int                   `json:"items"`
	SentinelItems                 []int                    `json:"sentinelItems"`
	StatPerks                     RuneStatPerksDTO         `json:"statPerks"`
	Kills                         int                      `json:"kills"`
	Deaths                        int                      `json:"deaths"`
	Assists                       int                      `json:"assists"`
	LargestKillingSpree           int                      `json:"largestKillingSpree"`
	LargestMultiKill              int                      `json:"largestMultiKill"`
	KillingSprees                 int                      `json:"killingSprees"`
	LongestTimeSpentLiving        int                      `json:"longestTimeSpentLiving"`
	DoubleKills                   int                      `json:"doubleKills"`
	TripleKills                   int                      `json:"tripleKills"`
	QuadraKills                   int                      `json:"quadraKills"`
	PentaKills                    int                      `json:"pentaKills"`
	UnrealKills                   int                      `json:"unrealKills"`
	TotalDamageDealt              int                      `json:"totalDamageDealt"`
	TotalDamageDealtToChampions   int                      `json:"totalDamageDealtToChampions"`
	TotalDamageTaken              int                      `json:"totalDamageTaken"`
	MagicalDamageTaken            int                      `json:"magicalDamageTaken"`
	PhysicalDamageTaken           int                      `json:"physicalDamageTaken"`
	TrueDamageTaken               int                      `json:"trueDamageTaken"`
	MagicDamageDealt              int                      `json:"magicDamageDealt"`
	PhysicalDamageDealt           int                      `json:"physicalDamageDealt"`
	TrueDamageDealt               int                      `json:"trueDamageDealt"`
	TotalHeal                     int                      `json:"totalHeal"`
	TotalHealsOnTeammates         int                      `json:"totalHealsOnTeammates"`
	TotalShieldsOnTeammates       int                      `json:"totalShieldsOnTeammates"`
	Damage                        DamageDTO                `json:"damageDealtToBuildings"`
	SelfMitigatedDamage           int                      `json:"selfMitigatedDamage"`
	GoldEarned                    int                      `json:"goldEarned"`
	GoldSpent                     int                      `json:"goldSpent"`
	TotalMinionsKilled            int                      `json:"totalMinionsKilled"`
	EnemyMinionsKilled            int                      `json:"enemyMinionsKilled"`
	AlliedJungleMinionsKilled     int                      `json:"alliedJungleMinionsKilled"`
	EnemyJungleMinionsKilled      int                      `json:"enemyJungleMinionsKilled"`
	WardsPlaced                   int                      `json:"wardsPlaced"`
	WardsKilled                   int                      `json:"wardsKilled"`
	VisionWardsBought             int                      `json:"visionWardsBought"`
	TrueSight                     int                      `json:"trueSight"`
	DetectorWardsPlaced           int                      `json:"detectorWardsPlaced"`
	VisionScore                   int                      `json:"visionScore"`
	Pentakill                     bool                     `json:"pentakill"`
	Quadrakill                    bool                     `json:"quadrakill"`
	TripleKill                    bool                     `json:"tripleKill"`
	DoubleKill                    bool                     `json:"doubleKill"`
	FirstBlood                    bool                     `json:"firstBlood"`
	FirstTowerKill                bool                     `json:"firstTowerKill"`
	FirstTowerAssist              bool                     `json:"firstTowerAssist"`
	FirstInhibitorKill            bool                     `json:"firstInhibitorKill"`
	FirstInhibitorAssist          bool                     `json:"firstInhibitorAssist"`
	FirstBaron                    bool                     `json:"firstBaron"`
	FirstDragon                   bool                     `json:"firstDragon"`
	FirstRiftHerald               bool                     `json:"firstRiftHerald"`
	InhibitorKills                int                      `json:"inhibitorKills"`
	TowerKills                    int                      `json:"towerKills"`
	BaronKills                    int                      `json:"baronKills"`
	DragonKills                   int                      `json:"dragonKills"`
	RiftHeraldKills               int                      `json:"riftHeraldKills"`
	Objectives                    ObjectiveDTO             `json:"objectives"`
	Win                           bool                     `json:"win"`
	GameEnded                     bool                     `json:"gameEnded"`
	EligibleForProgression        bool                     `json:"eligibleForProgression"`
}

// RuneDTO represents rune information
type RuneDTO struct {
	ID       int `json:"id"`
	Var      int `json:"var,omitempty"`
}

// RuneStatPerksDTO represents stat perks
type RuneStatPerksDTO struct {
	Offense  int `json:"offense"`
	Flex     int `json:"flex"`
	Defense  int `json:"defense"`
}

// DamageDTO represents damage dealt
type DamageDTO struct {
	Value int `json:"value"`
}

// ObjectiveDTO represents objectives
type ObjectiveDTO struct {
	Baron      ObjectiveDetailDTO `json:"baron"`
	Champion   ObjectiveDetailDTO `json:"champion"`
	Dragon     ObjectiveDetailDTO `json:"dragon"`
	Inhibitor  ObjectiveDetailDTO `json:"inhibitor"`
	RiftHerald ObjectiveDetailDTO `json:"riftHerald"`
	Tower      ObjectiveDetailDTO `json:"tower"`
}

// ObjectiveDetailDTO represents objective details
type ObjectiveDetailDTO struct {
	Kills  int `json:"kills"`
	First  bool `json:"first"`
}

// TeamDTO represents a team in a match
type TeamDTO struct {
	TeamID                  int              `json:"teamId"`
	Win                     bool             `json:"win"`
	BansDTO                 [5]BanDTO        `json:"bans"`
	Objectives              ObjectiveDTO     `json:"objectives"`
}

// BanDTO represents a champion ban
type BanDTO struct {
	ChampionID int `json:"championId"`
	PickTurn   int `json:"pickTurn"`
}

// MatchTimelineDTO represents a match timeline
type MatchTimelineDTO struct {
	Metadata MatchMetadataDTO `json:"metadata"`
	Info     TimelineInfoDTO  `json:"info"`
}

// TimelineInfoDTO represents timeline info
type TimelineInfoDTO struct {
	FrameInterval int              `json:"frameInterval"`
	Frames        []TimelineFrame  `json:"frames"`
	GameID        int64            `json:"gameId"`
	ParticipantIDs []string        `json:"participantIds"`
}

// TimelineFrame represents a single frame in the timeline
type TimelineFrame struct {
	Timestamp      int              `json:"timestamp"`
	ParticipantFrames map[string]ParticipantFrame `json:"participantFrames"`
	Events         []TimelineEvent  `json:"events"`
}

// ParticipantFrame represents a participant's state at a specific time
type ParticipantFrame struct {
	ParticipantID    int      `json:"participantId"`
	MinionsKilled    int      `json:"minionsKilled"`
	TeamScore        int      `json:"teamScore"`
	ParticipantScore int      `json:"participantScore"`
	Level            int      `json:"level"`
	Gold             int      `json:"gold"`
	Position         Position `json:"position"`
	CurrentGold      int      `json:"currentGold"`
	JungleMinionsKilled int   `json:"jungleMinionsKilled"`
}

// Position represents a position on the map
type Position struct {
	X int `json:"x"`
	Y int `json:"y"`
}

// TimelineEvent represents a game event
type TimelineEvent struct {
	RealTimestamp      int    `json:"realTimestamp"`
	Timestamp          int    `json:"timestamp"`
	Type               string `json:"type"`
	ItemID             int    `json:"itemId,omitempty"`
	ParticipantID      int    `json:"participantId,omitempty"`
	LevelUpType        string `json:"levelUpType,omitempty"`
	SkillSlot          int    `json:"skillSlot,omitempty"`
	CreatorID          int    `json:"creatorId,omitempty"`
	WardType           string `json:"wardType,omitempty"`
	Position           Position `json:"position,omitempty"`
	KillerID           int    `json:"killerId,omitempty"`
	VictimID           int    `json:"victimId,omitempty"`
	AssistingParticipantIDs []int `json:"assistingParticipantIds,omitempty"`
	BuildingType       string `json:"buildingType,omitempty"`
	TowerType          string `json:"towerType,omitempty"`
	LaneType           string `json:"laneType,omitempty"`
	TeamID             int    `json:"teamId,omitempty"`
	KillStreakLength   int    `json:"killStreakLength,omitempty"`
}
