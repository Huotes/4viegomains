# 4ViegoMains — Makefile

.PHONY: help dev infra infra-down frontend backend-gateway setup logs clean status db-shell redis-shell

help: ## Mostra comandos disponíveis
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

infra: ## Sobe infraestrutura (Postgres, Redis, ClickHouse, NATS)
	docker compose -f docker-compose.dev.yml up -d
	@echo ""
	@echo "Infraestrutura rodando:"
	@echo "  PostgreSQL:   localhost:5432"
	@echo "  Redis:        localhost:6379"
	@echo "  ClickHouse:   localhost:8123"
	@echo "  NATS:         localhost:4222"
	@echo "  NATS Monitor: localhost:8222"

infra-down: ## Para infraestrutura
	docker compose -f docker-compose.dev.yml down

frontend: ## Roda frontend Next.js (hot reload)
	cd frontend && npm run dev

backend-gateway: ## Roda riot-gateway
	cd backend && RIOT_API_KEY=$${RIOT_API_KEY} REDIS_URL=redis://localhost:6379/0 NATS_URL=nats://localhost:4222 DATABASE_URL=postgres://viego:viego_secret_2024@localhost:5432/viegomains go run ./services/riot-gateway/cmd/main.go

backend-champion: ## Roda champion-svc
	cd backend && DATABASE_URL=postgres://viego:viego_secret_2024@localhost:5432/viegomains REDIS_URL=redis://localhost:6379/1 NATS_URL=nats://localhost:4222 go run ./services/champion-svc/cmd/main.go

backend-player: ## Roda player-svc
	cd backend && DATABASE_URL=postgres://viego:viego_secret_2024@localhost:5432/viegomains REDIS_URL=redis://localhost:6379/2 NATS_URL=nats://localhost:4222 CLICKHOUSE_URL=http://localhost:8123 go run ./services/player-svc/cmd/main.go

backend-worker: ## Roda data-worker
	cd backend && RIOT_API_KEY=$${RIOT_API_KEY} DATABASE_URL=postgres://viego:viego_secret_2024@localhost:5432/viegomains REDIS_URL=redis://localhost:6379/0 NATS_URL=nats://localhost:4222 CLICKHOUSE_URL=http://localhost:8123 go run ./services/data-worker/cmd/main.go

setup: ## Setup inicial completo
	@echo "Instalando dependencias do frontend..."
	cd frontend && npm install
	@echo "Subindo infraestrutura..."
	$(MAKE) infra
	@echo ""
	@echo "Setup completo! Proximos passos:"
	@echo "  1. Copie .env.example para .env e configure RIOT_API_KEY"
	@echo "  2. Terminal 1: make frontend"
	@echo "  3. Terminal 2: make backend-gateway"
	@echo "  4. Acesse http://localhost:3000"

logs: ## Mostra logs da infraestrutura
	docker compose -f docker-compose.dev.yml logs -f

clean: ## Para tudo e remove volumes (CUIDADO)
	docker compose -f docker-compose.dev.yml down -v

status: ## Status dos containers
	docker compose -f docker-compose.dev.yml ps

db-shell: ## Shell do PostgreSQL
	docker compose -f docker-compose.dev.yml exec postgres psql -U viego -d viegomains

redis-shell: ## Shell do Redis
	docker compose -f docker-compose.dev.yml exec redis redis-cli
