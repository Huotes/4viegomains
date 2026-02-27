# 4ViegoMains Backend - Project Structure

## Overview
This is the Go backend foundation for 4ViegoMains, a League of Legends analytics platform focused on the champion Viego (Champion ID: 234).

## Project Layout

### Root Files
- **go.work**: Go workspace file that manages all modules and services

### Package Modules (`/pkg`)

#### 1. `pkg/config/`
- **config.go**: Viper-based configuration loader with environment variable support
  - Loads: RiotAPIKey, Redis URL, PostgreSQL URL, ClickHouse URL, NATS URL
  - Server configuration: port, log level
  - Region configurations with platform-to-cluster mapping

#### 2. `pkg/riot/`
Complete Riot API client implementation:
- **client.go**: HTTP client with rate limiting and retry logic
  - Methods: GetAccountByRiotID, GetSummonerByPUUID, GetMatchList, GetMatchDetail, GetMatchTimeline
  - Methods: GetChampionMastery, GetLeagueEntries, GetChallengerLeague, GetGrandmasterLeague, GetMasterLeague
  - Rate limiting with X-App-Rate-Limit and X-Method-Rate-Limit headers
  - Exponential backoff on 429 errors
- **ratelimiter.go**: Token bucket rate limiter (per-app and per-method)
- **ddragon.go**: Data Dragon client for champion, item, and rune data
  - Version caching (24-hour TTL)
  - GetAllChampions, GetChampionByName, GetAllItems, GetAllRunes
- **endpoints.go**: API constants and endpoints
  - Platform IDs: BR1, LA1, LA2, NA1, EUW1, EUN1, RU, TR1, JP1, KR, OC1, SG2, PH2, TH2, TW2, VN2
  - Regional clusters: AMERICAS, EUROPE, ASIA, SEA
  - Queue types: RANKED_SOLO_5x5, RANKED_FLEX_5x5
- **types.go**: All DTO types matching Riot API responses
  - AccountDTO, SummonerDTO, MatchDTO, MatchTimelineDTO
  - ChampionMasteryDTO, LeagueEntryDTO, LeagueListDTO
  - ParticipantDTO, TeamDTO, BanDTO, TimelineFrame, TimelineEvent

#### 3. `pkg/database/`
Database connection managers:
- **postgres.go**: PostgreSQL connection pool (pgxpool)
  - Health checks and schema initialization
  - Tables: tracked_players, matches, match_participants, champion_mastery, league_entries
- **redis.go**: Redis client wrapper (go-redis/v9)
  - JSON get/set with TTL
  - Utility methods: Exists, Delete, Increment, GetTTL, SetTTL
- **clickhouse.go**: ClickHouse connection
  - Analytics tables: match_stats, champion_statistics, build_statistics, rune_statistics, matchup_statistics, player_performance

#### 4. `pkg/middleware/`
HTTP middleware functions:
- **logging.go**: Structured logging (slog) for all requests
- **cors.go**: CORS headers with configurable allowed origins
- **recovery.go**: Panic recovery with stack trace logging
- **ratelimit.go**: Per-IP rate limiting using Redis
  - X-RateLimit-* headers support

#### 5. `pkg/models/`
Data models:
- **champion.go**: ViegoBuild, Item, Rune, RuneTree, SkillOrder, SummonerSpell, ViegoMatchup, ViegoPerformanceAnalysis
- **player.go**: TrackedPlayer, MatchSummary, PlayerProfile, RankedStats, PerformanceIndex, PlayerComparison
- **analytics.go**: RoleAnalysis, MetaStats, EloDistribution, ItemEfficiency, RuneEfficiency, PowerSpike, Synergy, MatchupData, PatchNotes, Analytics
- **leaderboard.go**: LeaderboardEntry, OTPScore, OTPComponents, Leaderboard, LeaderboardStats, PlayerRankHistory

#### 6. `pkg/nats/`
NATS pub/sub messaging:
- **client.go**: Message bus wrapper
  - Subjects: matches.collected, builds.recalculated, leaderboard.updated, patch.changed, cache.invalidate.*
  - Typed publish methods
  - Queue subscriptions with JSON unmarshaling

#### 7. `pkg/response/`
HTTP response helpers:
- **response.go**: Standard JSON response formatting
  - SuccessResponse, ErrorResponse, PaginatedResponse
  - Helper functions: Success, Error, Paginated, Created, BadRequest, NotFound, InternalServerError, etc.

### Services (`/services`)

#### 1. `riot-gateway/` (Port 8081) - Primary API Gateway
Main Riot API proxy service with Redis caching:
- **cmd/main.go**: Service entry point with full HTTP server setup
  - Endpoints:
    - POST /summoners/by-riot-id (Account lookup)
    - GET /summoners/{puuid} (Summoner info)
    - GET /summoners/{puuid}/mastery (Champion masteries)
    - GET /summoners/{puuid}/league (League entries)
    - GET /matches/{puuid}/ids (Match history)
    - GET /matches/{matchId} (Match details with 7-day cache)
    - GET /matches/{matchId}/timeline (Match timeline with 7-day cache)
    - GET /leagues/challenger|grandmaster|master
  - Middleware stack: Recovery → CORS → Logging → RateLimit
  - Graceful shutdown support
- **Dockerfile**: Multi-stage build for production deployment

#### 2. `champion-svc/` (Port 8082)
Champion analytics and metadata service stub:
- **cmd/main.go**: Basic service skeleton with /healthz endpoint
- Ready for champion statistics, builds, matchup analysis

#### 3. `player-svc/` (Port 8083)
Player profile and statistics service stub:
- **cmd/main.go**: Basic service skeleton with /healthz endpoint
- Ready for player tracking, performance index calculation

#### 4. `analytics-svc/` (Port 8084)
Advanced analytics and meta-analysis service stub:
- **cmd/main.go**: Basic service skeleton with /healthz endpoint
- Ready for meta stats, trend analysis, patch impact

#### 5. `leaderboard-svc/` (Port 8085)
OTP leaderboard service stub:
- **cmd/main.go**: Basic service skeleton with /healthz endpoint
- Ready for OTP scoring, leaderboard generation, rankings

#### 6. `content-svc/` (Port 8086)
Content delivery service stub:
- **cmd/main.go**: Basic service skeleton with /healthz endpoint
- Ready for guides, tips, media delivery

#### 7. `data-worker/`
Background worker for data processing:
- **cmd/main.go**: Worker entry point listening for NATS messages
- Processes: match collection, build recalculation, leaderboard updates

## Technology Stack

- **Language**: Go 1.26
- **Web Framework**: net/http + chi router
- **Database**: PostgreSQL (pgx), Redis (go-redis/v9), ClickHouse
- **Message Queue**: NATS
- **Configuration**: Viper
- **Logging**: slog (structured logging)
- **Rate Limiting**: Custom token bucket implementation + Redis

## Key Features

### Riot API Integration
- Rate limiting with adaptive limits from response headers
- Retry logic with exponential backoff
- Regional cluster routing
- Data Dragon integration for static data

### Caching Strategy
- Redis caching for frequently accessed data
- TTLs: 24h for summoners, 12h for masteries, 6h for league, 7d for matches, 1h for league lists

### Architecture Patterns
- Clean separation of concerns (pkg structure)
- Context propagation throughout
- Graceful shutdown handling
- Middleware composition pattern
- Error wrapping for debugging

## Configuration

Set these environment variables:
- `RIOTAPIKEY`: Riot API key (required)
- `PORT`: Server port (default: 8080)
- `LOGLEVEL`: Log level (default: info)
- `POSTGRESURL`: PostgreSQL connection string
- `REDISURL`: Redis connection URL
- `CLICKHOUSEURL`: ClickHouse connection URL
- `NATSURL`: NATS broker URL

## Compilation

All code compiles with Go 1.26 and follows standard Go conventions:
- Proper error handling with `fmt.Errorf` and error wrapping
- Context support throughout
- Standard library preference where possible
- Consistent naming conventions
- Comprehensive models for all data structures

## Database Schema

### PostgreSQL Tables
- `tracked_players`: User tracking with PUUID as unique key
- `matches`: Match metadata
- `match_participants`: Per-player match statistics
- `champion_mastery`: Champion mastery progression
- `league_entries`: Ranked statistics

### ClickHouse Tables
- `match_stats`: Time-series match statistics
- `champion_statistics`: Champion meta trends
- `build_statistics`: Item build efficiency
- `rune_statistics`: Rune usage patterns
- `matchup_statistics`: Champion matchup data
- `player_performance`: Player-specific performance metrics

## Next Steps

1. Implement database layer in `services/`
2. Add handlers for each service
3. Connect NATS for inter-service communication
4. Implement OTP score calculation
5. Build analytics engine for meta stats
6. Add authentication/authorization
7. Deploy with Docker Compose or Kubernetes
