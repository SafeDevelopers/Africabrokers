#!/bin/bash

# Production Deployment Script for AfriBrok
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
COMPOSE_FILE="infrastructure/compose/docker-compose.prod.yml"
ENV_FILE="infrastructure/compose/.env.production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment to ${ENVIRONMENT}...${NC}"

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}❌ Error: ${ENV_FILE} not found!${NC}"
    echo -e "${YELLOW}Please copy .env.production.example to .env.production and configure it.${NC}"
    exit 1
fi

# Load environment variables
export $(cat $ENV_FILE | grep -v '^#' | xargs)

# Check required variables
REQUIRED_VARS=(
    "POSTGRES_PASSWORD"
    "DATABASE_URL"
    "REDIS_PASSWORD"
    "STORAGE_ENDPOINT"
    "STORAGE_BUCKET"
    "AWS_REGION"
    "AWS_ACCESS_KEY_ID"
    "AWS_SECRET_ACCESS_KEY"
    "OIDC_CLIENT_SECRET"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ] || [[ "${!var}" == *"CHANGE_ME"* ]]; then
        echo -e "${RED}❌ Error: ${var} is not set or still has default value!${NC}"
        exit 1
    fi
done

echo -e "${GREEN}✅ Environment variables validated${NC}"

# Build images
echo -e "${YELLOW}📦 Building Docker images...${NC}"
docker compose -f $COMPOSE_FILE build --no-cache

# Run database migrations
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
docker compose -f $COMPOSE_FILE run --rm core-api pnpm prisma migrate deploy || {
    echo -e "${RED}❌ Migration failed!${NC}"
    exit 1
}

# Optional: Seed database (only for first deployment)
if [ "$2" == "--seed" ]; then
    echo -e "${YELLOW}🌱 Seeding database...${NC}"
    docker compose -f $COMPOSE_FILE run --rm core-api pnpm db:seed || {
        echo -e "${YELLOW}⚠️  Seed failed, but continuing...${NC}"
    }
fi

# Start services
echo -e "${YELLOW}🚀 Starting services...${NC}"
docker compose -f $COMPOSE_FILE up -d

# Wait for services to be healthy
echo -e "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check health
echo -e "${YELLOW}🏥 Checking service health...${NC}"
HEALTH_CHECKS=(
    "core-api:http://localhost:4000/v1/health/ready"
)

ALL_HEALTHY=true
for check in "${HEALTH_CHECKS[@]}"; do
    SERVICE=$(echo $check | cut -d':' -f1)
    URL=$(echo $check | cut -d':' -f2-)
    
    if curl -f $URL > /dev/null 2>&1; then
        echo -e "${GREEN}✅ ${SERVICE} is healthy${NC}"
    else
        echo -e "${RED}❌ ${SERVICE} health check failed${NC}"
        ALL_HEALTHY=false
    fi
done

if [ "$ALL_HEALTHY" = true ]; then
    echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo -e "${GREEN}📊 Service status:${NC}"
    docker compose -f $COMPOSE_FILE ps
else
    echo -e "${RED}❌ Some services are unhealthy. Check logs:${NC}"
    echo -e "${YELLOW}docker compose -f $COMPOSE_FILE logs${NC}"
    exit 1
fi
