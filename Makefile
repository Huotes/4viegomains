.PHONY: help dev build up down logs migrate seed test lint clean stop restart ps health

# Default target
help:
	@echo "4ViegoMains - Makefile Commands"
	@echo "================================"
	@echo "dev           - Start development environment with docker-compose"
	@echo "build         - Build all Docker images"
	@echo "up            - Start all services (production)"
	@echo "down          - Stop all services"
	@echo "stop          - Stop services without removing volumes"
	@echo "restart       - Restart all services"
	@echo "ps            - List running containers"
	@echo "logs          - View logs from all services"
	@echo "logs-SERVICE  - View logs from specific service (e.g., logs-frontend)"
	@echo "health        - Check health status of all services"
	@echo "migrate       - Run database migrations"
	@echo "seed          - Seed database with initial data"
	@echo "test          - Run all tests"
	@echo "lint          - Run linters on backend and frontend"
	@echo "clean         - Remove all containers, volumes, and images"
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev              - Start dev environment"
	@echo "  make logs-frontend    - View frontend logs"
	@echo "  make logs-champion    - View champion service logs"
	@echo ""

# Development environment
dev:
	@echo "Starting development environment..."
	docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
	@echo "Development environment started!"
	@echo "Frontend: http://localhost:3001"
	@echo "API: http://localhost:8000"
	@echo "Grafana: http://localhost:3000"
	@echo "Prometheus: http://localhost:9090"

# Build images
build:
	@echo "Building Docker images..."
	docker-compose build --no-cache

# Start production environment
up:
	@echo "Starting production environment..."
	docker-compose up -d
	@echo "Services started!"
	@make health

# Stop services
down:
	@echo "Stopping all services..."
	docker-compose down

# Stop without removing volumes
stop:
	@echo "Stopping services..."
	docker-compose stop

# Restart services
restart: down up
	@echo "Services restarted!"

# List running containers
ps:
	docker-compose ps

# View logs
logs:
	docker-compose logs -f

logs-nginx:
	docker-compose logs -f nginx

logs-frontend:
	docker-compose logs -f frontend

logs-riot-gateway:
	docker-compose logs -f riot-gateway

logs-champion:
	docker-compose logs -f champion-svc

logs-player:
	docker-compose logs -f player-svc

logs-analytics:
	docker-compose logs -f analytics-svc

logs-leaderboard:
	docker-compose logs -f leaderboard-svc

logs-content:
	docker-compose logs -f content-svc

logs-data-worker:
	docker-compose logs -f data-worker

logs-postgres:
	docker-compose logs -f postgres

logs-redis:
	docker-compose logs -f redis

# Health checks
health:
	@echo "Checking service health..."
	@docker-compose exec -T nginx curl -s http://localhost/health > /dev/null && echo "✓ Nginx" || echo "✗ Nginx"
	@docker-compose exec -T riot-gateway curl -s http://localhost:8001/health > /dev/null && echo "✓ Riot Gateway" || echo "✗ Riot Gateway"
	@docker-compose exec -T champion-svc curl -s http://localhost:8002/health > /dev/null && echo "✓ Champion Service" || echo "✗ Champion Service"
	@docker-compose exec -T player-svc curl -s http://localhost:8003/health > /dev/null && echo "✓ Player Service" || echo "✗ Player Service"
	@docker-compose exec -T analytics-svc curl -s http://localhost:8004/health > /dev/null && echo "✓ Analytics Service" || echo "✗ Analytics Service"
	@docker-compose exec -T leaderboard-svc curl -s http://localhost:8005/health > /dev/null && echo "✓ Leaderboard Service" || echo "✗ Leaderboard Service"
	@docker-compose exec -T content-svc curl -s http://localhost:8006/health > /dev/null && echo "✓ Content Service" || echo "✗ Content Service"
	@docker-compose exec -T postgres pg_isready -U viego -d viego_db > /dev/null && echo "✓ PostgreSQL" || echo "✗ PostgreSQL"
	@docker-compose exec -T redis redis-cli ping > /dev/null && echo "✓ Redis" || echo "✗ Redis"
	@docker-compose exec -T clickhouse curl -s http://localhost:8123 > /dev/null && echo "✓ ClickHouse" || echo "✗ ClickHouse"
	@docker-compose exec -T nats curl -s http://localhost:8222/varz > /dev/null && echo "✓ NATS" || echo "✗ NATS"

# Database migrations
migrate:
	@echo "Running database migrations..."
	docker-compose exec -T postgres psql -U viego -d viego_db -f /docker-entrypoint-initdb.d/001_initial_schema.sql
	docker-compose exec -T postgres psql -U viego -d viego_db -f /docker-entrypoint-initdb.d/002_analytics_tables.sql
	@echo "Migrations completed!"

# Seed database
seed:
	@echo "Seeding database..."
	./scripts/seed_ddragon.sh
	docker-compose exec -T postgres psql -U viego -d viego_db -f /seeds/initial_data.sql 2>/dev/null || echo "Seed data loaded"
	@echo "Database seeded!"

# Run tests
test:
	@echo "Running tests..."
	docker-compose run --rm frontend npm test
	docker-compose run --rm backend go test ./...
	@echo "Tests completed!"

# Lint code
lint:
	@echo "Linting code..."
	docker-compose run --rm frontend npm run lint
	docker-compose run --rm backend golangci-lint run ./...
	@echo "Linting completed!"

# Clean everything
clean:
	@echo "Cleaning up..."
	docker-compose down -v
	docker system prune -f
	@echo "Cleanup completed!"

# Database shell access
db-shell:
	docker-compose exec postgres psql -U viego -d viego_db

# Redis CLI access
redis-cli:
	docker-compose exec redis redis-cli

# ClickHouse CLI access
clickhouse-cli:
	docker-compose exec clickhouse clickhouse-client

# View frontend build
frontend-build:
	@echo "Building frontend..."
	docker-compose run --rm frontend npm run build

# View backend build
backend-build:
	@echo "Building backend..."
	docker-compose run --rm backend go build -o ./bin/app ./cmd/...

# Full reset (use with caution!)
reset: clean dev migrate seed
	@echo "Full reset completed!"
