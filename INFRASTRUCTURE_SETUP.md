# 4ViegoMains Infrastructure Setup

## Overview
This document describes all the infrastructure files created for the 4ViegoMains project.

## Files Created

### Docker Composition Files

#### 1. docker-compose.yml
**Path:** `/sessions/tender-trusting-heisenberg/mnt/4viegomains/docker-compose.yml`

Production-ready Docker Compose configuration with:
- **Services:** 13 services total
  - nginx (1.27-alpine) on ports 80/443
  - frontend (React build)
  - 7 backend microservices:
    - riot-gateway (port 8001)
    - champion-svc (port 8002)
    - player-svc (port 8003)
    - analytics-svc (port 8004)
    - leaderboard-svc (port 8005)
    - content-svc (port 8006)
    - data-worker
  - postgres:16-alpine
  - clickhouse/clickhouse-server:24-alpine
  - redis:7-alpine (512mb allkeys-lru)
  - nats:2.10-alpine
  - prometheus
  - grafana

- **Network:** viego-net (bridge)
- **Volumes:** 6 named volumes for data persistence
- **Environment:** All services use .env file for configuration
- **Health checks:** All services have health checks configured

#### 2. docker-compose.dev.yml
**Path:** `/sessions/tender-trusting-heisenberg/mnt/4viegomains/docker-compose.dev.yml`

Development override configuration:
- Exposes all service ports for direct access
- Hot reload volume mounts for source code
- Enhanced logging with LOG_LEVEL=debug
- No SSL configuration
- Service ports exposed: 3001 (frontend), 8001-8006 (services), 5432 (postgres), 6379 (redis), 8123 (clickhouse), 4222 (nats), 9090 (prometheus), 3000 (grafana)

### Nginx Configuration Files

#### 3. nginx/nginx.conf
**Path:** `/sessions/tender-trusting-heisenberg/mnt/4viegomains/nginx/nginx.conf`

Main Nginx configuration:
- Auto worker processes with epoll
- 4096 worker connections
- Gzip compression for: JS, CSS, XML, JSON, fonts, SVG
- Rate limiting zones:
  - api: 30 requests/second
  - search: 5 requests/second
- Upstream definitions and API routing includes

#### 4. nginx/conf.d/upstream.conf
**Path:** `/sessions/tender-trusting-heisenberg/mnt/4viegomains/nginx/conf.d/upstream.conf`

Upstream definitions for:
- frontend (3000)
- riot_gateway (8001)
- champion_service (8002)
- player_service (8003)
- analytics_service (8004)
- leaderboard_service (8005)
- content_service (8006)
- ddragon_cache (external CDN)

All with keepalive 32 connections.

#### 5. nginx/conf.d/api.conf
**Path:** `/sessions/tender-trusting-heisenberg/mnt/4viegomains/nginx/conf.d/api.conf`

Complete API routing with:
- **Cache Zones:**
  - api_cache: 10m keyzone, 1GB max, 60m inactive
  - ddragon_cache: 100m keyzone, 5GB max, 365d inactive

- **HTTP/HTTPS:**
  - HTTP to HTTPS redirect on port 80
  - SSL server block on port 443
  - Self-signed certificate support

- **Security Headers:**
  - HSTS (max-age=31536000)
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: SAMEORIGIN
  - X-XSS-Protection: 1; mode=block
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy with disabled sensors

- **Location Blocks:**
  - `/` - Frontend SPA with static asset caching (30d)
  - `/api/v1/riot/` - Riot Gateway (5m cache)
  - `/api/v1/champions/` - Champion Service (10m cache)
  - `/api/v1/players/` - Player Service (5m cache)
  - `/api/v1/analytics/` - Analytics Service (15m cache)
  - `/api/v1/leaderboard/` - Leaderboard Service (5m cache)
  - `/api/v1/content/` - Content Service (30m cache)
  - `/ddragon/` - Data Dragon proxy (365d cache)
  - `/cdragon/` - Community Dragon proxy (30d cache)

- **Rate Limiting:** Configured per endpoint with burst allowances

### Configuration and Environment Files

#### 6. .env.example
**Path:** `/sessions/tender-trusting-heisenberg/mnt/4viegomains/.env.example`

Template environment file with all required variables:
- **Application:** NODE_ENV, LOG_LEVEL, API configuration
- **Riot API:** RIOT_API_KEY, region
- **Databases:** PostgreSQL, ClickHouse credentials and URLs
- **Cache:** Redis configuration
- **Message Queue:** NATS cluster configuration
- **Frontend:** React app configuration
- **Monitoring:** Prometheus retention, Grafana credentials
- **Service Ports:** All microservice ports
- **Security:** JWT secret, CORS origin, SSL paths
- **Feature Flags:** Match history, analytics, leaderboard, content, meta stats
- **Data Configuration:** Retention periods, limits
- **External Services:** Data Dragon, Community Dragon URLs
- **Rate Limiting:** Requests per second
- **Timeouts:** HTTP, DB, cache TTLs
- **Workers:** Concurrency, retries, batch size

#### 7. Makefile
**Path:** `/sessions/tender-trusting-heisenberg/mnt/4viegomains/Makefile`

Comprehensive make targets:
- **Environment:** dev, build, up, down, stop, restart
- **Monitoring:** logs, logs-SERVICE, health, ps
- **Database:** migrate, seed, db-shell
- **Development:** test, lint, frontend-build, backend-build
- **Cache/CLI:** redis-cli, clickhouse-cli
- **Cleanup:** clean, reset
- Over 25 available targets with comprehensive documentation

### PostgreSQL Migrations

#### 8. backend/migrations/postgres/001_initial_schema.sql
**Path:** `/sessions/tender-trusting-heisenberg/mnt/4viegomains/backend/migrations/postgres/001_initial_schema.sql`

Core database schema with 5 main tables:

**viego_builds Table:**
- UUID primary key with auto-generation
- Summoner and match tracking
- 6 item slots + boots
- Kill/Death/Assist statistics
- Gold and CS tracking
- Win/loss indicator
- Game duration and lane information
- JSONB metadata
- 7 indexes for optimal querying

**viego_runes Table:**
- Links to viego_builds
- Primary and secondary rune paths
- Stat shards
- 3 indexes for rune analysis

**tracked_players Table:**
- Unique summoner tracking
- Rank information (tier, division, LP)
- Viego-specific statistics
- Win rate and KDA calculations
- Tracking metadata
- 5 indexes for player queries

**viego_matchups Table:**
- Opponent champion matchup statistics
- Win rates by lane
- Difficulty ratings (1-5)
- KDA and gold metrics
- 2 unique indexes

**viego_meta_stats Table:**
- Daily meta statistics
- Global win rates and KDA
- Lane distribution (JSONB)
- Popular items and runes (JSONB)
- Best/worst matchups (JSONB)
- Daily snapshots

**Additional Features:**
- audit_log table for changes
- update_updated_at_column() trigger function
- Automatic timestamp updates
- PostgreSQL permissions setup for viego user
- Schema isolation with 'viego' schema

#### 9. backend/migrations/postgres/002_analytics_tables.sql
**Path:** `/sessions/tender-trusting-heisenberg/mnt/4viegomains/backend/migrations/postgres/002_analytics_tables.sql`

Analytics and content tables with 8 tables:

**viego_item_efficiency Table:**
- Item purchase frequency and rates
- Win/loss statistics per item
- Build ordering and positioning
- Damage and gold efficiency
- Synergistic items (JSONB)

**viego_rune_efficiency Table:**
- Rune performance tracking
- Pick rates and win rates
- Synergistic and conflicting runes
- Secondary path pairings

**viego_synergies Table:**
- Item/rune combination analysis
- Synergy types and strengths (1-5 rating)
- Win rate impact of synergies

**viego_power_spikes Table:**
- Game minute-based power analysis
- Item and level spikes
- Gold requirements
- Spike strength ratings

**content_guides Table:**
- User guides and tips
- Guide types: matchup, build, playstyle, general
- Difficulty levels and target elo
- View counts and ratings
- Publishing workflow
- SEO metadata (keywords, description)

**content_tips Table:**
- Tips within guides
- Categorization (early/mid/late game, teamfight, positioning)
- Helpful/unhelpful voting

**matchup_analysis Table:**
- Detailed matchup information
- Phase-based strategies (early/mid/late game)
- Recommended items and runes
- Ban recommendations and priority

**viego_skill_progression Table:**
- Skill order statistics
- Win rates per skill progression
- Pick rates

### ClickHouse Migrations

#### 10. backend/migrations/clickhouse/001_match_data.sql
**Path:** `/sessions/tender-trusting-heisenberg/mnt/4viegomains/backend/migrations/clickhouse/001_match_data.sql`

Time-series analytics with 9 tables using MergeTree engine:

**viego_matches Table:**
- High-volume match data table
- Partitioned by month (toYYYYMM)
- 180-day TTL policy
- 50+ columns for complete match statistics
- Ordered by: timestamp, match_id, summoner_id
- Granularity: 8192

**viego_daily_stats Table:**
- Daily aggregated player statistics
- KDA, CS, gold, damage metrics
- Popular items and runes (String/JSON)
- Lane distribution analytics

**viego_matchup_stats Table:**
- Daily matchup statistics
- Opponent-focused analytics
- Difficulty ratings and win rates

**viego_match_volume_hourly Table:**
- Hourly match volume tracking
- 90-day retention
- Regional breakdown

**viego_item_build_stats Table:**
- Item efficiency by position
- Build order analysis
- Win rates per item position

**viego_rune_build_stats Table:**
- Rune performance tracking
- Pick rates and win rates
- Rune path statistics

**viego_lane_stats Table:**
- Lane-specific performance
- Role breakdowns
- Kill participation and objective metrics

**viego_tier_progression Table:**
- Rank tracking over time
- LP changes and tier progression

**viego_match_events Table:**
- Detailed match event log
- Kill, death, assist tracking
- Objective coordination
- 90-day TTL

**viego_meta_snapshot Table:**
- Historical meta snapshots
- Popularity metrics (pick/ban rates)
- Best/worst matchups by patch

**viego_api_performance Table:**
- API monitoring and performance
- Response times, status codes
- Error tracking
- 30-day retention

### Monitoring Configuration

#### 11. monitoring/prometheus.yml
**Path:** `/sessions/tender-trusting-heisenberg/mnt/4viegomains/monitoring/prometheus.yml`

Prometheus scrape configuration:
- Global: 15s scrape interval, 15s evaluation
- **Scrape Jobs:** 11 jobs configured
  - Prometheus self (9090)
  - All 7 backend services (8001-8006)
  - PostgreSQL (5432)
  - Redis (6379)
  - ClickHouse (8123)
  - NATS (8222)
  - Nginx (9113) - if exporter running
  - Node Exporter (9100) - optional
  
- **Configuration:**
  - Custom metrics paths (/metrics or /varz)
  - Appropriate scrape intervals per service
  - Timeout configuration
  - Label relabeling for service identification

### Setup and Utility Scripts

#### 12. scripts/setup_dev.sh
**Path:** `/sessions/tender-trusting-heisenberg/mnt/4viegomains/scripts/setup_dev.sh`

Interactive setup script with:
- Dependency checking (docker, docker-compose, make)
- Environment configuration from .env.example
- Interactive Riot API key input
- Self-signed SSL certificate generation
- Docker image building
- Service startup and health verification
- Database migration execution
- Comprehensive setup logging with colored output

#### 13. scripts/seed_ddragon.sh
**Path:** `/sessions/tender-trusting-heisenberg/mnt/4viegomains/scripts/seed_ddragon.sh`

Data Dragon asset downloader with:
- Latest version detection
- Retry logic (3 attempts per download)
- Asset categories:
  - Champion data and splash arts
  - Item data and icons (sample)
  - Rune data and trees
  - Summoner spells
  - Profile icons
- Version tracking JSON output
- Download statistics and summary
- Bandwidth-conscious sampling for production use

## Directory Structure

```
/sessions/tender-trusting-heisenberg/mnt/4viegomains/
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
├── Makefile
├── INFRASTRUCTURE_SETUP.md (this file)
│
├── nginx/
│   ├── nginx.conf
│   └── conf.d/
│       ├── upstream.conf
│       └── api.conf
│
├── backend/
│   └── migrations/
│       ├── postgres/
│       │   ├── 001_initial_schema.sql
│       │   └── 002_analytics_tables.sql
│       └── clickhouse/
│           └── 001_match_data.sql
│
├── monitoring/
│   └── prometheus.yml
│
├── scripts/
│   ├── setup_dev.sh (executable)
│   └── seed_ddragon.sh (executable)
│
└── public/ (created by setup script)
    └── ddragon/ (populated by seed_ddragon.sh)
        ├── champion/
        ├── item/
        ├── rune/
        ├── spell/
        ├── profileicon/
        └── img/
```

## Quick Start

### 1. Initial Setup
```bash
cd /sessions/tender-trusting-heisenberg/mnt/4viegomains
./scripts/setup_dev.sh
```

### 2. Development Environment
```bash
make dev          # Start dev environment with hot reload
make logs         # View all service logs
make health       # Check service health
```

### 3. Download Data Dragon Assets
```bash
make seed         # Or manually: ./scripts/seed_ddragon.sh
```

### 4. Stop Services
```bash
make down         # Stop and remove containers
make clean        # Full cleanup including volumes
```

## Service Endpoints

### Development
- **Frontend:** http://localhost:3001
- **Nginx (HTTP):** http://localhost:80
- **Nginx (HTTPS):** https://localhost:443

### Backend Services
- **Riot Gateway:** http://localhost:8001
- **Champion Service:** http://localhost:8002
- **Player Service:** http://localhost:8003
- **Analytics Service:** http://localhost:8004
- **Leaderboard Service:** http://localhost:8005
- **Content Service:** http://localhost:8006

### Monitoring
- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3000 (admin/admin)

### Databases
- **PostgreSQL:** localhost:5432 (viego/viego_pass)
- **Redis:** localhost:6379
- **ClickHouse:** localhost:8123
- **NATS:** nats://localhost:4222

## Database Schema Summary

### PostgreSQL (13 tables)
1. **Core Tables (5)**
   - viego_builds
   - viego_runes
   - tracked_players
   - viego_matchups
   - viego_meta_stats

2. **Analytics Tables (8)**
   - viego_item_efficiency
   - viego_rune_efficiency
   - viego_synergies
   - viego_power_spikes
   - content_guides
   - content_tips
   - matchup_analysis
   - viego_skill_progression

3. **Audit (1)**
   - audit_log

### ClickHouse (10 tables)
- viego_matches (primary event table)
- viego_daily_stats
- viego_matchup_stats
- viego_match_volume_hourly
- viego_item_build_stats
- viego_rune_build_stats
- viego_lane_stats
- viego_tier_progression
- viego_match_events
- viego_api_performance
- viego_meta_snapshot

## Configuration Guide

### Environment Variables
All required environment variables are defined in `.env.example`. Copy to `.env` and customize:

```bash
cp .env.example .env
# Edit .env with your configuration
# Most importantly: RIOT_API_KEY
```

### SSL Certificates
Self-signed certificates are automatically generated by `setup_dev.sh`. For production:
```bash
# Place your certificates in certs/
certs/
├── cert.pem
└── key.pem
```

### Rate Limiting
Configured in nginx/conf.d/api.conf:
- API endpoints: 30 req/s
- Search endpoints: 5 req/s
- Burst: 50 requests allowed

### Caching Strategy
- Frontend static assets: 30 days
- API responses: 5-30 minutes (varies by service)
- Data Dragon: 1 year
- Community Dragon: 30 days

## Monitoring and Health Checks

All services include:
- Health check endpoints (`/health`)
- Prometheus metrics exposure (`/metrics`)
- Configurable logging levels
- Structured logging support

Run health checks:
```bash
make health
```

## Notes

- All files use version "3.9" docker-compose specification
- Service names match the architecture exactly
- All migrations are idempotent (safe to run multiple times)
- PostgreSQL schema uses JSONB for flexible data storage
- ClickHouse uses MergeTree for high-volume analytics
- TTL policies automatically remove old data
- Comprehensive indexing for query performance
