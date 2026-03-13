#!/bin/bash

# ============================================
# Docker Commands for Faith Tracker
# ============================================

echo "=== Docker Commands for Faith Tracker ==="
echo ""

# 1. BUILD THE DOCKER IMAGE
echo "1. BUILD IMAGE:"
echo "   docker build -t faith-tracker:latest ."
echo ""

# 2. RUN THE CONTAINER
echo "2. RUN CONTAINER (detached mode):"
echo "   docker run -d -p 3000:3000 --name faith-tracker faith-tracker:latest"
echo ""

# 3. RUN WITH ENVIRONMENT VARIABLES (if needed)
echo "3. RUN WITH ENV VARIABLES:"
echo "   docker run -d -p 3000:3000 \\"
echo "     -e API_BASE_URL='http://your-api-url' \\"
echo "     --name faith-tracker faith-tracker:latest"
echo ""

# 4. CHECK CONTAINER STATUS
echo "4. CHECK CONTAINER STATUS:"
echo "   docker ps --filter 'name=faith-tracker'"
echo "   docker ps -a --filter 'name=faith-tracker'"
echo ""

# 5. VIEW CONTAINER LOGS
echo "5. VIEW LOGS:"
echo "   docker logs faith-tracker"
echo "   docker logs -f faith-tracker          # Follow logs (live)"
echo "   docker logs --tail 50 faith-tracker  # Last 50 lines"
echo ""

# 6. HEALTH CHECK COMMANDS
echo "6. HEALTH CHECK:"
echo "   # Check container health status"
echo "   docker inspect --format='{{.State.Health.Status}}' faith-tracker"
echo ""
echo "   # Test health endpoint from host"
echo "   curl -v http://localhost:3000/health"
echo "   curl -4 http://127.0.0.1:3000/health"
echo ""
echo "   # Test health endpoint from inside container"
echo "   docker exec faith-tracker curl -f http://localhost:3000/health"
echo ""

# 7. TEST APPLICATION ENDPOINTS
echo "7. TEST APPLICATION:"
echo "   # Health endpoint"
echo "   curl http://localhost:3000/health"
echo ""
echo "   # Root endpoint"
echo "   curl -I http://localhost:3000/"
echo ""
echo "   # Open in browser"
echo "   open http://localhost:3000"
echo ""

# 8. INSPECT CONTAINER
echo "8. INSPECT CONTAINER:"
echo "   # Container details"
echo "   docker inspect faith-tracker"
echo ""
echo "   # Port mapping"
echo "   docker port faith-tracker"
echo ""
echo "   # Container IP"
echo "   docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' faith-tracker"
echo ""

# 9. EXECUTE COMMANDS INSIDE CONTAINER
echo "9. EXECUTE COMMANDS:"
echo "   # Open shell"
echo "   docker exec -it faith-tracker sh"
echo ""
echo "   # Check environment variables"
echo "   docker exec faith-tracker env | grep -E 'PORT|HOSTNAME|NODE_ENV'"
echo ""
echo "   # Check processes"
echo "   docker exec faith-tracker ps aux"
echo ""
echo "   # Check listening ports"
echo "   docker exec faith-tracker netstat -tlnp"
echo ""

# 10. STOP AND REMOVE CONTAINER
echo "10. STOP AND REMOVE:"
echo "    # Stop container"
echo "    docker stop faith-tracker"
echo ""
echo "    # Remove container"
echo "    docker rm faith-tracker"
echo ""
echo "    # Stop and remove in one command"
echo "    docker stop faith-tracker && docker rm faith-tracker"
echo ""

# 11. CLEANUP
echo "11. CLEANUP:"
echo "    # Remove image"
echo "    docker rmi faith-tracker:latest"
echo ""
echo "    # Remove all stopped containers"
echo "    docker container prune"
echo ""
echo "    # Remove unused images"
echo "    docker image prune"
echo ""

# 12. RESTART CONTAINER
echo "12. RESTART:"
echo "    docker restart faith-tracker"
echo ""

# 13. VIEW RESOURCE USAGE
echo "13. RESOURCE USAGE:"
echo "    docker stats faith-tracker"
echo ""

echo "=== End of Commands ==="

