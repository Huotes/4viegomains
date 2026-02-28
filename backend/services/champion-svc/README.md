# Champion Service (champion-svc)

Microservice providing comprehensive Viego champion statistics including builds, runes, matchups, and meta information for the 4ViegoMains project.

## Quick Start

### Prerequisites
- Go 1.26+
- PostgreSQL 12+
- Redis 6+
- NATS 2+

### Environment Variables

```bash
export POSTGRESURL=postgres://user:password@localhost:5432/viegomains
export REDISURL=redis://localhost:6379
export NATSURL=nats://localhost:4222
export RIOTAPIKEY=your-api-key
```

### Running the Service

```bash
cd backend/services/champion-svc
go run ./cmd/main.go
```

Service will start on `http://localhost:8082`

## API Usage Examples

### Get Top Builds for Jungle
```bash
curl "http://localhost:8082/api/v1/champion/builds?role=jungle&elo=diamond"
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "build-001",
      "patch": "14.3",
      "role": "jungle",
      "elo_tier": "diamond",
      "build_path": [3001, 3153, 3115, ...],
      "win_rate": 0.5234,
      "pick_rate": 0.1823,
      "sample_size": 15234,
      "avg_kda": 3.42,
      "avg_game_length": 2340
    }
  ]
}
```

### Get Top Runes for Mid Lane
```bash
curl "http://localhost:8082/api/v1/champion/runes?role=mid&elo=all"
```

### Get Matchup vs Ahri
```bash
curl "http://localhost:8082/api/v1/champion/matchups?role=mid&vs=103&elo=diamond"
```

### Get Counters for Top Lane
```bash
curl "http://localhost:8082/api/v1/champion/counters?role=top&elo=platinum"
```

Response:
```json
{
  "success": true,
  "data": {
    "hardest": [
      {
        "id": "matchup-001",
        "enemy_champion": 164,
        "win_rate": 0.3542,
        "sample_size": 8923,
        "avg_kda": 2.15
      }
    ],
    "easiest": [
      {
        "id": "matchup-002",
        "enemy_champion": 266,
        "win_rate": 0.6234,
        "sample_size": 12123,
        "avg_kda": 4.32
      }
    ]
  }
}
```

### Get Stats for All Roles
```bash
curl "http://localhost:8082/api/v1/champion/stats?elo=master"
```

### Get Stats for Specific Role
```bash
curl "http://localhost:8082/api/v1/champion/stats?role=bot&elo=gold"
```

## Cache Keys

The service uses Redis for caching:

- Builds: `champion:builds:{role}:{elo}:{patch}`
- Runes: `champion:runes:{role}:{elo}:{patch}`
- Matchups: `champion:matchup:{role}:{elo}:{enemyChampionId}`
- Stats: `champion:stats:{role}:{elo}`

## Testing

Test that the service is running:

```bash
curl http://localhost:8082/healthz
```

Expected response:
```json
{
  "status": "healthy"
}
```

## Docker Deployment

Build image:
```bash
docker build -t 4viegomains/champion-svc:latest .
```

Run container:
```bash
docker run -d \
  -e POSTGRESURL=postgres://postgres:password@db:5432/viegomains \
  -e REDISURL=redis://redis:6379 \
  -e NATSURL=nats://nats:4222 \
  -e RIOTAPIKEY=your-key \
  -p 8082:8082 \
  --name champion-svc \
  4viegomains/champion-svc:latest
```

## Architecture

### Handler Layer (`internal/handler/`)
- Processes HTTP requests
- Validates query parameters
- Converts request/response data formats
- Returns responses via the `response` package

### Service Layer (`internal/service/`)
- Implements business logic
- Manages caching with Redis
- Handles data aggregation and scoring
- Subscribes to NATS events for cache invalidation

### Repository Layer (`internal/repository/`)
- Database access using pgx
- Parameterized SQL queries
- Data scanning and mapping

### Model Layer (`internal/model/`)
- Data structures for database entities
- Custom types for JSONB and array handling
- Implements sql.Scanner and driver.Valuer interfaces

## Key Features

### Intelligent Caching
- Respects minimum sample sizes for statistical significance
- TTL-based expiration with different timeouts by data type
- Event-driven cache invalidation via NATS

### Weighted Scoring
- Build rankings use: `win_rate * log(sample_size)`
- Prevents bias toward low-volume builds
- Balances statistics quality with popularity

### Comprehensive Matchup Data
- Per-role specific matchups
- Multi-ELO tier support
- Early game statistics (gold diff @ 15min, CS diff @ 15min)

### Real-time Updates
- NATS subscriptions for cache invalidation
- Graceful shutdown with 30-second timeout
- Goroutine-based event handling

## Monitoring

The service logs to stdout in JSON format for easy parsing:

```json
{
  "time": "2024-02-28T12:34:56Z",
  "level": "INFO",
  "msg": "HTTP request",
  "method": "GET",
  "path": "/api/v1/champion/builds",
  "status": 200,
  "duration": "125ms"
}
```

Check logs with:
```bash
docker logs champion-svc
```

## Troubleshooting

### Cache hits not occurring
- Verify Redis connection: `redis-cli ping`
- Check cache keys: `redis-cli KEYS "champion:*"`
- Verify TTL: `redis-cli TTL champion:builds:jungle:diamond:14.3`

### Missing data
- Verify database tables exist
- Check sample sizes meet minimum threshold (100+)
- Verify patch version in queries

### Rate limiting
- Current limit: 100 requests per second per IP
- Check rate limit headers in response
- Modify in `main.go` middleware configuration

## API Response Format

All successful responses follow this format:
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ }
}
```

All error responses follow this format:
```json
{
  "success": false,
  "error": "error message",
  "code": 400
}
```

## Contributing

When adding new endpoints:
1. Create handler in `internal/handler/`
2. Implement business logic in `internal/service/`
3. Add repository methods in `internal/repository/`
4. Register route in `cmd/main.go`
5. Add cache invalidation if needed in NATS subscription
