# Docker Quick Start Guide

## Quick Reference Commands

### 1. Build the Docker Image

```bash
docker build -t faith-tracker:latest .
```

### 2. Run the Container

```bash
docker run -d -p 3000:3000 --name faith-tracker faith-tracker:latest
```

### 3. Check Container Status

```bash
docker ps --filter "name=faith-tracker"
```

### 4. View Logs

```bash
docker logs faith-tracker
docker logs -f faith-tracker  # Follow logs in real-time
```

### 5. Health Check

```bash
# Check container health status
docker inspect --format='{{.State.Health.Status}}' faith-tracker

# Test health endpoint
curl http://localhost:3000/health

# Test from inside container
docker exec faith-tracker curl -f http://localhost:3000/health
```

### 6. Test Application

```bash
# Health endpoint
curl http://localhost:3000/health

# Root endpoint
curl -I http://localhost:3000/

# Open in browser (macOS)
open http://localhost:3000
```

### 7. Stop and Remove Container

```bash
docker stop faith-tracker
docker rm faith-tracker

# Or in one command
docker stop faith-tracker && docker rm faith-tracker
```

### 8. Restart Container

```bash
docker restart faith-tracker
```

## Complete Workflow

```bash
# 1. Build
docker build -t faith-tracker:latest .

# 2. Run
docker run -d -p 3000:3000 --name faith-tracker faith-tracker:latest

# 3. Wait for startup (5 seconds)
sleep 5

# 4. Check status
docker ps --filter "name=faith-tracker"

# 5. Check logs
docker logs faith-tracker

# 6. Test health
curl http://localhost:3000/health

# 7. Test application
curl -I http://localhost:3000/

# 8. View health status
docker inspect --format='{{.State.Health.Status}}' faith-tracker
```

## Troubleshooting

### Container not starting

```bash
# Check logs
docker logs faith-tracker

# Check if port is already in use
lsof -i :3000
```

### Health check failing

```bash
# Check container health
docker inspect --format='{{json .State.Health}}' faith-tracker

# Test from inside container
docker exec faith-tracker curl -v http://localhost:3000/health
```

### Port already in use

```bash
# Use a different port
docker run -d -p 3001:3000 --name faith-tracker faith-tracker:latest

# Then access via
curl http://localhost:3001/health
```

## Environment Variables

If you need to set environment variables:

```bash
docker run -d -p 3000:3000 \
  -e API_BASE_URL='http://your-api-url' \
  --name faith-tracker faith-tracker:latest
```

## View All Commands

Run the helper script to see all available commands:

```bash
./docker-commands.sh
```
