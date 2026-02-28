# 4ViegoMains — Guia de Setup (WSL2 + Docker)

## Pré-requisitos

- WSL2 com Ubuntu
- Docker Desktop (com integração WSL2 ativada)
- Git instalado no WSL2

## 1. Clonar/Acessar o projeto

```bash
cd ~/projects  # ou onde preferir
# Se for copiar de outro local:
cp -r /caminho/para/4viegomains ~/projects/4viegomains
cd 4viegomains
```

## 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` e preencha:

```env
RIOT_API_KEY=RGAPI-sua-chave-aqui
DB_PASSWORD=viego_secret_2024
GRAFANA_PASSWORD=admin123
```

> Sua Riot API Key de desenvolvimento pode ser obtida em https://developer.riotgames.com

## 3. Instalar dependências do Frontend (local)

```bash
cd frontend
npm install
cd ..
```

## 4. Subir tudo com Docker Compose

```bash
# Subir toda a infraestrutura + serviços
docker compose up -d

# Verificar se todos os containers estão rodando
docker compose ps
```

Isso vai subir: PostgreSQL, Redis, ClickHouse, NATS, Nginx, Frontend, e todos os microserviços Go.

## 5. Verificar saúde dos serviços

```bash
# Frontend
curl http://localhost:3000

# Riot Gateway
curl http://localhost:8081/healthz

# PostgreSQL
docker compose exec postgres pg_isready

# Redis
docker compose exec redis redis-cli ping

# NATS
curl http://localhost:8222/varz
```

## 6. Acessar

- **Frontend**: http://localhost:3000
- **API Gateway (Nginx)**: http://localhost:80
- **Grafana**: http://localhost:3001 (admin / sua senha)
- **Prometheus**: http://localhost:9090
- **NATS Monitor**: http://localhost:8222

## Modo Desenvolvimento (hot reload)

Para desenvolver com hot reload no frontend:

```bash
# Terminal 1: Infraestrutura
docker compose up -d postgres redis clickhouse nats

# Terminal 2: Backend (um serviço por vez)
cd backend/services/riot-gateway
go run cmd/main.go

# Terminal 3: Frontend com hot reload
cd frontend
npm run dev
```

## Comandos úteis

```bash
# Ver logs de um serviço
docker compose logs -f riot-gateway

# Reiniciar um serviço
docker compose restart champion-svc

# Parar tudo
docker compose down

# Parar e remover volumes (CUIDADO: apaga dados)
docker compose down -v

# Rebuild após mudanças
docker compose up -d --build
```

## Troubleshooting

**Erro de porta em uso:**
```bash
# Verificar o que está usando a porta
sudo lsof -i :3000
```

**Docker sem espaço:**
```bash
docker system prune -a
```

**Riot API Key expirada:**
Development keys expiram a cada 24h. Gere uma nova em https://developer.riotgames.com e atualize o `.env`.
