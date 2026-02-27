#!/bin/bash

set -e

echo "================================================"
echo "4ViegoMains Development Environment Setup"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running from project root
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Error: docker-compose.yml not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Check dependencies
echo -e "${YELLOW}Checking dependencies...${NC}"

check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}✗ $1 is not installed${NC}"
        return 1
    else
        echo -e "${GREEN}✓ $1 is installed${NC}"
        return 0
    fi
}

# Required dependencies
REQUIRED_DEPS=("docker" "docker-compose" "make")
MISSING_DEPS=0

for dep in "${REQUIRED_DEPS[@]}"; do
    if ! check_command "$dep"; then
        MISSING_DEPS=$((MISSING_DEPS + 1))
    fi
done

if [ $MISSING_DEPS -gt 0 ]; then
    echo -e "${RED}Error: Missing $MISSING_DEPS required dependencies${NC}"
    echo "Please install the missing tools and try again."
    exit 1
fi

echo -e "${GREEN}All dependencies installed!${NC}"
echo ""

# Check if .env exists
echo -e "${YELLOW}Setting up environment configuration...${NC}"

if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠ .env file already exists${NC}"
    read -p "Do you want to overwrite it? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cp .env.example .env
        echo -e "${GREEN}✓ Created .env from .env.example${NC}"
    fi
else
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env from .env.example${NC}"
fi

echo ""

# Prompt for Riot API key
echo -e "${YELLOW}Configuring Riot API key...${NC}"
read -p "Enter your Riot API key (or press Enter to skip for now): " RIOT_API_KEY

if [ ! -z "$RIOT_API_KEY" ]; then
    # Replace in .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/RIOT_API_KEY=.*/RIOT_API_KEY=$RIOT_API_KEY/" .env
    else
        # Linux
        sed -i "s/RIOT_API_KEY=.*/RIOT_API_KEY=$RIOT_API_KEY/" .env
    fi
    echo -e "${GREEN}✓ Riot API key configured${NC}"
else
    echo -e "${YELLOW}⚠ Riot API key not configured. Update .env manually before running migrations.${NC}"
fi

echo ""

# Create required directories
echo -e "${YELLOW}Creating required directories...${NC}"

DIRS=(
    "certs"
    "logs"
    "public"
    "backend/migrations/postgres"
    "backend/migrations/clickhouse"
)

for dir in "${DIRS[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        echo -e "${GREEN}✓ Created $dir${NC}"
    else
        echo -e "${GREEN}✓ Directory $dir already exists${NC}"
    fi
done

# Create self-signed certificates if they don't exist
if [ ! -f "certs/cert.pem" ] || [ ! -f "certs/key.pem" ]; then
    echo -e "${YELLOW}Creating self-signed SSL certificates...${NC}"
    openssl req -x509 -newkey rsa:4096 -keyout certs/key.pem -out certs/cert.pem \
        -days 365 -nodes -subj "/CN=localhost" 2>/dev/null
    echo -e "${GREEN}✓ Created self-signed certificates${NC}"
else
    echo -e "${GREEN}✓ SSL certificates already exist${NC}"
fi

echo ""

# Check Docker daemon
echo -e "${YELLOW}Checking Docker daemon...${NC}"

if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker daemon is not running${NC}"
    echo "Please start Docker and try again."
    exit 1
fi

echo -e "${GREEN}✓ Docker daemon is running${NC}"
echo ""

# Build images
echo -e "${YELLOW}Building Docker images...${NC}"
echo "This may take a few minutes..."

if docker-compose build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Docker images built successfully${NC}"
else
    echo -e "${RED}Error: Failed to build Docker images${NC}"
    echo "Run 'docker-compose build' manually to see the full error."
    exit 1
fi

echo ""

# Start services
echo -e "${YELLOW}Starting services...${NC}"

if docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Services started${NC}"
else
    echo -e "${RED}Error: Failed to start services${NC}"
    echo "Run 'docker-compose up' manually to see the full error."
    exit 1
fi

echo ""

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to be ready...${NC}"

MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    if docker-compose exec -T postgres pg_isready -U viego -d viego_db > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
        break
    fi

    ATTEMPT=$((ATTEMPT + 1))
    if [ $ATTEMPT -lt $MAX_ATTEMPTS ]; then
        echo "Waiting... ($ATTEMPT/$MAX_ATTEMPTS)"
        sleep 2
    fi
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo -e "${YELLOW}⚠ PostgreSQL took longer than expected to start${NC}"
fi

echo ""

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"

if docker-compose exec -T postgres psql -U viego -d viego_db -f /docker-entrypoint-initdb.d/001_initial_schema.sql > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Initial schema created${NC}"
else
    echo -e "${YELLOW}⚠ Initial schema may already exist${NC}"
fi

if docker-compose exec -T postgres psql -U viego -d viego_db -f /docker-entrypoint-initdb.d/002_analytics_tables.sql > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Analytics tables created${NC}"
else
    echo -e "${YELLOW}⚠ Analytics tables may already exist${NC}"
fi

echo ""

# Display service information
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}Development environment is ready!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Service URLs:"
echo -e "  Frontend:        ${YELLOW}http://localhost:3001${NC}"
echo -e "  API Gateway:     ${YELLOW}http://localhost:80${NC}"
echo -e "  Grafana:         ${YELLOW}http://localhost:3000${NC}"
echo -e "  Prometheus:      ${YELLOW}http://localhost:9090${NC}"
echo ""
echo "Database connections:"
echo -e "  PostgreSQL:      ${YELLOW}localhost:5432${NC} (user: viego, password: viego_pass)"
echo -e "  Redis:           ${YELLOW}localhost:6379${NC}"
echo -e "  ClickHouse:      ${YELLOW}localhost:8123${NC}"
echo -e "  NATS:            ${YELLOW}localhost:4222${NC}"
echo ""
echo "Useful commands:"
echo -e "  ${YELLOW}make dev${NC}      - Start development environment"
echo -e "  ${YELLOW}make logs${NC}     - View all service logs"
echo -e "  ${YELLOW}make health${NC}   - Check service health"
echo -e "  ${YELLOW}make down${NC}     - Stop all services"
echo -e "  ${YELLOW}make clean${NC}    - Remove all containers and volumes"
echo ""
echo "Next steps:"
echo "1. Update RIOT_API_KEY in .env if not already done"
echo "2. Run 'make seed' to download Data Dragon assets"
echo "3. Start developing!"
echo ""
