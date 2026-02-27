# 4ViegoMains Backend Setup Guide

## Quick Start

### Prerequisites
- Go 1.26+
- PostgreSQL 13+
- Redis 6+
- ClickHouse 22+
- NATS server

### Environment Setup

Create a `.env` file or export these variables:

```bash
export RIOTAPIKEY=your-riot-api-key
export POSTGRESURL=postgres://user:password@localhost:5432/viegomains
export REDISURL=redis://localhost:6379
export CLICKHOUSEURL=localhost:9000
export NATSURL=nats://localhost:4222
export PORT=8080
export LOGLEVEL=info
```

### Building

Using Go workspace:

```bash
# Build all modules
go build ./...

# Build a specific service
go build ./services/riot-gateway/cmd/main.go

# Run tests
go test ./...
```

### Running Services

```bash
# Riot Gateway (Port 8081)
go run ./services/riot-gateway/cmd/main.go

# Champion Service (Port 8082)
go run ./services/champion-svc/cmd/main.go

# Player Service (Port 8083)
go run ./services/player-svc/cmd/main.go

# Analytics Service (Port 8084)
go run ./services/analytics-svc/cmd/main.go

# Leaderboard Service (Port 8085)
go run ./services/leaderboard-svc/cmd/main.go

# Content Service (Port 8086)
go run ./services/content-svc/cmd/main.go

# Data Worker (background)
go run ./services/data-worker/cmd/main.go
```

## API Endpoints

### Riot Gateway (Primary API on port 8081)

#### Account Management
- `POST /summoners/by-riot-id` - Look up account by gameName#tagLine
- `GET /summoners/{puuid}` - Get summoner info by PUUID

#### Champion Mastery
- `GET /summoners/{puuid}/mastery` - Get all champion masteries
- `GET /summoners/{puuid}/mastery/{championId}` - Get specific champion mastery
- `GET /summoners/{puuid}/mastery/score` - Get total mastery score

#### League Info
- `GET /summoners/{puuid}/league` - Get ranked entries
- `GET /leagues/challenger?platform=NA1` - Get Challenger tier
- `GET /leagues/grandmaster?platform=NA1` - Get Grandmaster tier
- `GET /leagues/master?platform=NA1` - Get Master tier

#### Match History
- `GET /matches/{puuid}/ids?platform=NA1&start=0&count=20` - Get match IDs
- `GET /matches/{matchId}?platform=NA1` - Get match details
- `GET /matches/{matchId}/timeline?platform=NA1` - Get match timeline

#### Health Check
- `GET /healthz` - Service health status

## Architecture Overview

### Packages (shared code)

1. **config** - Configuration management with Viper
2. **riot** - Complete Riot API client with rate limiting
3. **database** - PostgreSQL, Redis, ClickHouse wrappers
4. **middleware** - HTTP middleware (logging, CORS, rate limiting, recovery)
5. **models** - Data models for all domain entities
6. **nats** - NATS pub/sub messaging
7. **response** - HTTP response helpers

### Services (microservices)

1. **riot-gateway** (8081) - Riot API proxy with caching
2. **champion-svc** (8082) - Champion analytics
3. **player-svc** (8083) - Player profiles
4. **analytics-svc** (8084) - Meta analysis
5. **leaderboard-svc** (8085) - OTP leaderboard
6. **content-svc** (8086) - Content delivery
7. **data-worker** - Background task processor

## Database Schema

### PostgreSQL (Relational)

Tables:
- `tracked_players` - Player accounts
- `matches` - Match metadata
- `match_participants` - Per-player match stats
- `champion_mastery` - Mastery progression
- `league_entries` - Ranked league data

### ClickHouse (Analytics)

Tables:
- `match_stats` - Time-series match data
- `champion_statistics` - Meta stats per champion
- `build_statistics` - Item build efficiency
- `rune_statistics` - Rune usage patterns
- `matchup_statistics` - Champion matchups
- `player_performance` - Player metrics

## Caching Strategy

Using Redis for intelligent TTL-based caching:

- **Summoners**: 24 hours (stable data)
- **Champion Mastery**: 12 hours (updates weekly)
- **League Info**: 6 hours (changes frequently)
- **Match Details**: 7 days (immutable once finished)
- **Match Timeline**: 7 days (immutable once finished)
- **League Lists**: 1 hour (updates very frequently)

## Rate Limiting

### Riot API Rate Limiting
- Adaptive limits from X-App-Rate-Limit and X-Method-Rate-Limit headers
- Token bucket per method and per app
- Exponential backoff on 429 errors
- Automatic retry with jitter

### Per-IP Rate Limiting
- 120 requests per second per IP
- Using Redis for distributed tracking
- X-RateLimit-* headers in responses

## Error Handling

All errors are:
- Wrapped with context using `fmt.Errorf`
- Logged with structured slog
- Returned as JSON with appropriate HTTP status codes

Example error response:
```json
{
  "success": false,
  "error": "Failed to fetch account data",
  "code": 500
}
```

## Testing

### Unit Tests
```bash
go test ./pkg/...
```

### Integration Tests
```bash
go test ./services/...
```

### Load Testing
```bash
# Example with hey
hey -n 1000 -c 10 http://localhost:8081/healthz
```

## Deployment

### Docker

Build image:
```bash
docker build -f services/riot-gateway/Dockerfile \
  -t 4viegomains/riot-gateway:latest \
  -f services/riot-gateway/Dockerfile .
```

Run container:
```bash
docker run -p 8081:8081 \
  -e RIOTAPIKEY=your-key \
  -e REDISURL=redis://redis:6379 \
  -e POSTGRESURL=postgres://db:5432/viegomains \
  -e CLICKHOUSEURL=clickhouse:9000 \
  -e NATSURL=nats://nats:4222 \
  4viegomains/riot-gateway:latest
```

### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: viegomains
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"

  redis:
    image: redis:7
    ports:
      - "6379:6379"

  clickhouse:
    image: clickhouse/clickhouse-server:latest
    ports:
      - "9000:9000"
      - "8123:8123"

  nats:
    image: nats:latest
    ports:
      - "4222:4222"

  riot-gateway:
    build: ./services/riot-gateway
    ports:
      - "8081:8081"
    depends_on:
      - postgres
      - redis
      - clickhouse
      - nats
    environment:
      RIOTAPIKEY: ${RIOTAPIKEY}
      POSTGRESURL: postgres://postgres:password@postgres:5432/viegomains
      REDISURL: redis://redis:6379
      CLICKHOUSEURL: clickhouse:9000
      NATSURL: nats://nats:4222
```

Start with:
```bash
docker-compose up -d
```

## Monitoring

### Health Checks
All services expose `/healthz` endpoint:
```bash
curl http://localhost:8081/healthz
```

### Structured Logging
All logs are in JSON format for easy parsing:
```
{"time":"2026-02-27T...","level":"INFO","msg":"HTTP request","method":"GET","path":"/healthz","status":200,...}
```

## Performance Considerations

1. **Rate Limiting**: Respect Riot API limits with adaptive token bucket
2. **Caching**: Aggressive caching of stable data in Redis
3. **Database**: PostgreSQL for transactional data, ClickHouse for analytics
4. **Async**: Use NATS for asynchronous processing
5. **Connection Pooling**: pgxpool with sensible defaults
6. **Context**: Proper context propagation with timeouts

## Troubleshooting

### Service won't start
- Check environment variables are set
- Verify database connections
- Check Redis availability
- Confirm NATS broker is running

### Rate limit errors
- Check Riot API key validity
- Verify rate limit headers in responses
- Check system time synchronization

### Database errors
- Verify PostgreSQL is running
- Check table creation in InitSchema
- Verify connection string format

### Cache issues
- Check Redis connection
- Verify memory availability
- Check TTL settings

## Next Steps

1. Implement service-specific handlers
2. Add database operations
3. Build OTP score calculation engine
4. Implement meta stat aggregation
5. Add authentication/authorization
6. Set up CI/CD pipeline
7. Deploy to production

## Project Structure Reference

```
backend/
├── go.work                    # Workspace file
├── pkg/
│   ├── config/                # Configuration
│   ├── riot/                  # Riot API client
│   ├── database/              # Database connections
│   ├── middleware/            # HTTP middleware
│   ├── models/                # Domain models
│   ├── nats/                  # Message queue
│   └── response/              # Response helpers
└── services/
    ├── riot-gateway/          # API gateway (8081)
    ├── champion-svc/          # Champions (8082)
    ├── player-svc/            # Players (8083)
    ├── analytics-svc/         # Analytics (8084)
    ├── leaderboard-svc/       # Leaderboard (8085)
    ├── content-svc/           # Content (8086)
    └── data-worker/           # Background jobs
```

## License & Attribution

4ViegoMains Backend - League of Legends Analytics Platform
Viego Champion Analytics Edition
