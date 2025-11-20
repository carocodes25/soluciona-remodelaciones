#!/bin/bash

# Health check script for all services

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🏥 SOLUCIONA - HEALTH CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Docker containers
echo "📦 Docker Containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

# Check PostgreSQL
echo "🗄️  PostgreSQL:"
PG_STATUS=$(docker inspect --format='{{.State.Health.Status}}' soluciona-postgres 2>/dev/null)
if [ "$PG_STATUS" = "healthy" ]; then
    echo -e "${GREEN}✅ Healthy${NC}"
    docker exec soluciona-postgres psql -U soluciona -d soluciona_db -c "SELECT COUNT(*) as users FROM \"User\";" 2>/dev/null || echo "Could not query database"
else
    echo -e "${RED}❌ Unhealthy or not running${NC}"
fi
echo ""

# Check Redis
echo "💾 Redis:"
REDIS_STATUS=$(docker inspect --format='{{.State.Health.Status}}' soluciona-redis 2>/dev/null)
if [ "$REDIS_STATUS" = "healthy" ]; then
    echo -e "${GREEN}✅ Healthy${NC}"
    docker exec soluciona-redis redis-cli ping 2>/dev/null
else
    echo -e "${RED}❌ Unhealthy or not running${NC}"
fi
echo ""

# Check Backend
echo "🔧 Backend API:"
BACKEND_RUNNING=$(docker ps | grep soluciona-backend)
if [ ! -z "$BACKEND_RUNNING" ]; then
    echo -e "${GREEN}✅ Running${NC}"
    # Try to curl health endpoint
    HEALTH=$(curl -s http://localhost:4000/health 2>/dev/null)
    if [ ! -z "$HEALTH" ]; then
        echo "   Response: $HEALTH"
    fi
else
    echo -e "${RED}❌ Not running${NC}"
fi
echo ""

# Check Frontend
echo "🎨 Frontend:"
FRONTEND_RUNNING=$(docker ps | grep soluciona-frontend)
if [ ! -z "$FRONTEND_RUNNING" ]; then
    echo -e "${GREEN}✅ Running${NC}"
    # Try to curl frontend
    FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 2>/dev/null)
    if [ "$FRONTEND_STATUS" = "200" ]; then
        echo -e "   ${GREEN}HTTP Status: $FRONTEND_STATUS${NC}"
    else
        echo -e "   ${YELLOW}HTTP Status: $FRONTEND_STATUS${NC}"
    fi
else
    echo -e "${RED}❌ Not running${NC}"
fi
echo ""

# Check disk space
echo "💿 Disk Space:"
df -h / | tail -1
echo ""

# Check memory usage
echo "🧠 Memory Usage:"
free -h | grep Mem
echo ""

# Check recent errors in logs
echo "📝 Recent Errors (last 10 minutes):"
echo "Backend:"
docker logs --since 10m soluciona-backend 2>&1 | grep -i error | tail -3
echo ""
echo "Frontend:"
docker logs --since 10m soluciona-frontend 2>&1 | grep -i error | tail -3
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Health Check Completed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
