#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🚀 SOLUCIONA - DEPLOYMENT SCRIPT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ Error: .env.production file not found!${NC}"
    echo -e "${YELLOW}Please copy .env.production.example to .env.production and configure it.${NC}"
    echo ""
    echo "Run: cp .env.production.example .env.production"
    echo "Then edit: nano .env.production"
    exit 1
fi

echo -e "${GREEN}✅ Environment file found${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    echo "Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed${NC}"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed!${NC}"
    echo "Please install Docker Compose first: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker Compose is installed${NC}"
echo ""

# Ask for deployment type
echo "Select deployment type:"
echo "1) Development (with hot-reload)"
echo "2) Production (optimized build)"
read -p "Enter choice [1-2]: " deployment_type

case $deployment_type in
    1)
        COMPOSE_FILE="docker-compose.yml"
        ENV_FILE=".env"
        MODE="development"
        echo -e "${BLUE}📦 Deploying in DEVELOPMENT mode...${NC}"
        ;;
    2)
        COMPOSE_FILE="docker-compose.prod.yml"
        ENV_FILE=".env.production"
        MODE="production"
        echo -e "${BLUE}🚀 Deploying in PRODUCTION mode...${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f $COMPOSE_FILE down

echo ""

# Pull latest changes (if in production)
if [ "$MODE" = "production" ]; then
    echo -e "${YELLOW}📥 Pulling latest code...${NC}"
    git pull origin main
    echo ""
fi

# Build and start containers
echo -e "${YELLOW}🏗️  Building and starting containers...${NC}"
docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d --build

echo ""

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Check service status
echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
docker-compose -f $COMPOSE_FILE ps

echo ""

# Check if services are healthy
POSTGRES_STATUS=$(docker inspect --format='{{.State.Health.Status}}' soluciona-postgres 2>/dev/null)
REDIS_STATUS=$(docker inspect --format='{{.State.Health.Status}}' soluciona-redis 2>/dev/null)

if [ "$POSTGRES_STATUS" = "healthy" ]; then
    echo -e "${GREEN}✅ PostgreSQL is healthy${NC}"
else
    echo -e "${RED}❌ PostgreSQL is not healthy${NC}"
fi

if [ "$REDIS_STATUS" = "healthy" ]; then
    echo -e "${GREEN}✅ Redis is healthy${NC}"
else
    echo -e "${RED}❌ Redis is not healthy${NC}"
fi

# Check backend logs for errors
BACKEND_ERRORS=$(docker logs soluciona-backend 2>&1 | grep -i error | head -5)
if [ ! -z "$BACKEND_ERRORS" ]; then
    echo -e "${YELLOW}⚠️  Backend has some errors:${NC}"
    echo "$BACKEND_ERRORS"
else
    echo -e "${GREEN}✅ Backend started successfully${NC}"
fi

# Check frontend logs for errors
FRONTEND_ERRORS=$(docker logs soluciona-frontend 2>&1 | grep -i error | head -5)
if [ ! -z "$FRONTEND_ERRORS" ]; then
    echo -e "${YELLOW}⚠️  Frontend has some errors:${NC}"
    echo "$FRONTEND_ERRORS"
else
    echo -e "${GREEN}✅ Frontend started successfully${NC}"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  ${GREEN}✨ DEPLOYMENT COMPLETED!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ "$MODE" = "development" ]; then
    echo "🌐 Application URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:4000"
    echo "   API Docs: http://localhost:4000/api"
else
    echo "🌐 Application URLs (configure your domain first):"
    echo "   Frontend: https://yourdomain.com"
    echo "   Backend:  https://api.yourdomain.com"
fi

echo ""
echo "📊 Useful commands:"
echo "   View logs:        docker-compose -f $COMPOSE_FILE logs -f"
echo "   Stop services:    docker-compose -f $COMPOSE_FILE down"
echo "   Restart service:  docker-compose -f $COMPOSE_FILE restart <service>"
echo "   Shell access:     docker exec -it soluciona-backend sh"
echo ""
echo "📁 Log files location: Use 'docker logs' command"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
echo ""
