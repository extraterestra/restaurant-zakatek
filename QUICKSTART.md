# 🚀 Quick Start Guide

## For Developers (Clone & Run)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd restaurant

# 2. Set up environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 3. Start everything with Docker
docker-compose up -d

# 4. Access the app
# Frontend: http://localhost:3000
# Admin: http://localhost:3000/admin
# API: http://localhost:5001
```

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build

# Reset database (⚠️ deletes data)
docker-compose down -v
docker-compose up -d
```

## Deployment to Railway

1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Create new project from GitHub repo
4. Add PostgreSQL database
5. Deploy backend and frontend services
6. Set environment variables
7. Done! ✅

See [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) for detailed steps.

## Documentation

- 📖 [Docker Setup Guide](./DOCKER_SETUP.md) - Comprehensive Docker guide
- 🚂 [Railway Deployment](./RAILWAY_DEPLOYMENT.md) - Deploy to production
- 📚 [Main README](./README.md) - Project overview
- 🔑 [Get Gemini API Key](./HOW_TO_GET_GEMINI_API_KEY.md)

## Troubleshooting

**Port already in use?**
```bash
# Change port in docker-compose.yml
frontend:
  ports:
    - "3001:80"  # Changed from 3000
```

**Can't connect to API?**
```bash
# Check backend is running
docker-compose ps backend

# View backend logs
docker-compose logs backend
```

**Database issues?**
```bash
# Restart database
docker-compose restart postgres

# Check database logs
docker-compose logs postgres
```

For more help, see [DOCKER_SETUP.md](./DOCKER_SETUP.md) troubleshooting section.
