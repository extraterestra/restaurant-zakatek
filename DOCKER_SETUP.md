# 🐳 Docker Setup Guide

This guide will help you run the SIVIK Restaurant Order Management System locally using Docker.

## Prerequisites

- **Docker Desktop** (includes Docker and Docker Compose)
  - [Download for Mac](https://docs.docker.com/desktop/install/mac-install/)
  - [Download for Windows](https://docs.docker.com/desktop/install/windows-install/)
  - [Download for Linux](https://docs.docker.com/desktop/install/linux-install/)
- **Git** (to clone the repository)

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd restaurant
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` and add your Gemini API key:**
   ```bash
   # Open .env in your favorite editor
   nano .env  # or vim, code, etc.
   
   # Update this line:
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

4. **Start all services:**
   ```bash
   docker-compose up -d
   ```

5. **Access the application:**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:5001
   - **Admin Panel**: http://localhost:3000/admin

6. **View logs (optional):**
   ```bash
   docker-compose logs -f
   ```

7. **Stop all services:**
   ```bash
   docker-compose down
   ```

## What Gets Installed?

Docker Compose will create and start three services:

### 1. PostgreSQL Database (`postgres`)
- **Port**: 5432
- **Database**: `restaurant_db`
- **User**: `restaurant_user`
- **Password**: `restaurant_password`
- **Data**: Persisted in Docker volume `postgres_data`

### 2. Backend API (`backend`)
- **Port**: 5001
- **Technology**: Node.js + Express + TypeScript
- **Endpoints**:
  - `GET /api/orders` - Get all orders
  - `POST /api/orders` - Create new order
  - `PATCH /api/orders/:id/status` - Update order status

### 3. Frontend (`frontend`)
- **Port**: 3000 (mapped to container port 80)
- **Technology**: React + Vite + TypeScript
- **Features**: Menu display, AI Chef, Shopping Cart, Admin Panel

## Environment Variables

### Required Variables

| Variable | Description | Default (Docker) | Where to Get |
|----------|-------------|------------------|--------------|
| `GEMINI_API_KEY` | Google Gemini API key | *Required* | [Get API Key](./HOW_TO_GET_GEMINI_API_KEY.md) |
| `VITE_API_URL` | Backend API URL | `http://localhost:5001` | Auto-configured |
| `DATABASE_URL` | PostgreSQL connection | Auto-configured | Auto-configured |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Backend server port | `5001` |
| `NODE_ENV` | Environment mode | `production` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## Common Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Rebuild after code changes
```bash
docker-compose up -d --build
```

### Reset database (⚠️ deletes all data)
```bash
docker-compose down -v
docker-compose up -d
```

### Check service status
```bash
docker-compose ps
```

### Access database directly
```bash
docker-compose exec postgres psql -U restaurant_user -d restaurant_db
```

## Development Workflow

### Making Code Changes

1. **Edit your code** in your favorite editor
2. **Rebuild the affected service:**
   ```bash
   # For backend changes
   docker-compose up -d --build backend
   
   # For frontend changes
   docker-compose up -d --build frontend
   ```
3. **View logs** to check for errors:
   ```bash
   docker-compose logs -f backend
   ```

### Database Management

The database data is persisted in a Docker volume, so your orders will remain even after stopping containers.

**To reset the database:**
```bash
docker-compose down -v  # -v removes volumes
docker-compose up -d
```

## Troubleshooting

### Port Already in Use

**Error**: `Bind for 0.0.0.0:3000 failed: port is already allocated`

**Solution**: Change the port mapping in `docker-compose.yml`:
```yaml
frontend:
  ports:
    - "3001:80"  # Changed from 3000 to 3001
```

### Cannot Connect to Database

**Check if PostgreSQL is healthy:**
```bash
docker-compose ps
```

Look for `healthy` status. If not healthy:
```bash
docker-compose logs postgres
docker-compose restart postgres
```

### Frontend Shows "Cannot Connect to API"

1. **Check backend is running:**
   ```bash
   docker-compose ps backend
   ```

2. **Check backend logs:**
   ```bash
   docker-compose logs backend
   ```

3. **Verify API URL** in `.env`:
   ```
   VITE_API_URL=http://localhost:5001
   ```

4. **Rebuild frontend:**
   ```bash
   docker-compose up -d --build frontend
   ```

### Gemini API Not Working

1. **Verify API key** in `.env` file
2. **Check if key is valid** at [Google AI Studio](https://makersuite.google.com/app/apikey)
3. **Rebuild frontend** to pick up new environment variable:
   ```bash
   docker-compose up -d --build frontend
   ```

### Docker Build Fails

**Clear Docker cache and rebuild:**
```bash
docker-compose down
docker system prune -a  # ⚠️ This removes all unused Docker data
docker-compose up -d --build
```

### Permission Denied Errors (Linux)

**Run Docker commands with sudo** or add your user to the docker group:
```bash
sudo usermod -aG docker $USER
# Log out and log back in
```

## Performance Tips

### Speed Up Builds

Docker builds can be slow. To speed them up:

1. **Use BuildKit** (faster builds):
   ```bash
   export DOCKER_BUILDKIT=1
   docker-compose up -d --build
   ```

2. **Limit log output:**
   ```bash
   docker-compose up -d --quiet-pull
   ```

### Reduce Resource Usage

Edit Docker Desktop settings:
- **Memory**: 4GB minimum, 8GB recommended
- **CPUs**: 2 minimum, 4 recommended
- **Disk**: 20GB minimum

## Next Steps

- 📖 Read the [Railway Deployment Guide](./RAILWAY_DEPLOYMENT.md) to deploy to production
- 🔑 Get your [Gemini API Key](./HOW_TO_GET_GEMINI_API_KEY.md)
- 📚 Check the main [README.md](./README.md) for project overview

## Support

If you encounter issues not covered here:
1. Check the [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) guide
2. Review Docker logs: `docker-compose logs -f`
3. Ensure Docker Desktop is running and up to date
