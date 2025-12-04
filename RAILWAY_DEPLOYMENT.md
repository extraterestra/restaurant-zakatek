# 🚂 Railway Deployment Guide

This guide will help you deploy the SIVIK Restaurant Order Management System to Railway.

## Why Railway?

- ✅ **Easy deployment** from GitHub
- ✅ **Managed PostgreSQL** database included
- ✅ **Automatic HTTPS** and custom domains
- ✅ **Environment variables** management
- ✅ **Auto-deploy** on git push
- ✅ **Free tier** available for testing

## Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Railway Account** - Sign up at [railway.app](https://railway.app)
3. **Gemini API Key** - [Get one here](./HOW_TO_GET_GEMINI_API_KEY.md)

## Deployment Steps

### Step 1: Prepare Your Repository

1. **Commit all Docker files** to your repository:
   ```bash
   git add .
   git commit -m "Add Docker and Railway configuration"
   git push origin main
   ```

2. **Verify these files exist** in your repo:
   - ✅ `Dockerfile` (frontend)
   - ✅ `server/Dockerfile` (backend)
   - ✅ `railway.toml` (Railway config)
   - ✅ `.env.example` (environment template)

### Step 2: Create Railway Project

1. **Go to** [railway.app](https://railway.app)
2. **Click** "Start a New Project"
3. **Select** "Deploy from GitHub repo"
4. **Authorize** Railway to access your GitHub
5. **Select** your restaurant repository

### Step 3: Add PostgreSQL Database

1. **In your Railway project**, click **"+ New"**
2. **Select** "Database" → "PostgreSQL"
3. **Wait** for the database to provision (~30 seconds)
4. **Note**: Railway automatically creates a `DATABASE_URL` variable

### Step 4: Deploy Backend Service

1. **Click** "New" → "GitHub Repo" → Select your repository
2. **Configure the service**:
   - **Name**: `backend`
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.js`

3. **Add Environment Variables**:
   - Click on the backend service
   - Go to "Variables" tab
   - Add these variables:

   | Variable | Value |
   |----------|-------|
   | `PORT` | `5001` |
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | Reference from PostgreSQL service |
   | `FRONTEND_URL` | `*` (we'll update this later) |

4. **Reference DATABASE_URL**:
   - For `DATABASE_URL`, click "Add Reference"
   - Select your PostgreSQL service
   - Select `DATABASE_URL` variable

5. **Deploy**: Railway will automatically build and deploy

### Step 5: Deploy Frontend Service

1. **Click** "New" → "GitHub Repo" → Select your repository again
2. **Configure the service**:
   - **Name**: `frontend`
   - **Root Directory**: `.` (root)
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`

3. **Add Environment Variables**:
   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | Reference from backend service |
   | `GEMINI_API_KEY` | Your actual Gemini API key |

4. **Reference VITE_API_URL**:
   - For `VITE_API_URL`, click "Add Reference"
   - Select your backend service
   - Select `PUBLIC_URL` or manually enter: `https://backend-production-xxxx.up.railway.app`

5. **Generate Domain**:
   - Go to "Settings" tab
   - Click "Generate Domain"
   - Copy the generated URL (e.g., `https://restaurant-production-xxxx.up.railway.app`)

### Step 6: Update CORS Settings

1. **Go back to backend service**
2. **Update** `FRONTEND_URL` variable with your frontend URL
3. **Redeploy** backend service (it will auto-redeploy)

### Step 7: Verify Deployment

1. **Open your frontend URL** in a browser
2. **Check**:
   - ✅ Menu loads correctly
   - ✅ AI Chef responds
   - ✅ Can add items to cart
   - ✅ Can create an order
   - ✅ Admin panel shows orders at `/admin`

## Environment Variables Reference

### Backend Service

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `PORT` | Server port | `5001` |
| `NODE_ENV` | Environment mode | `production` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://your-app.railway.app` |

### Frontend Service

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://backend-xxx.railway.app` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |

## Custom Domain (Optional)

1. **Go to frontend service** → "Settings"
2. **Click** "Add Custom Domain"
3. **Enter** your domain (e.g., `restaurant.yourdomain.com`)
4. **Add DNS records** as shown by Railway:
   - Type: `CNAME`
   - Name: `restaurant`
   - Value: `your-app.railway.app`
5. **Wait** for DNS propagation (5-60 minutes)

## Auto-Deploy on Push

Railway automatically deploys when you push to your main branch.

**To disable auto-deploy**:
1. Go to service → "Settings"
2. Scroll to "Deployment Triggers"
3. Toggle off "Auto-deploy"

## Monitoring & Logs

### View Logs

1. **Click on a service**
2. **Go to** "Deployments" tab
3. **Click** on the latest deployment
4. **View** real-time logs

### Check Metrics

1. **Click on a service**
2. **Go to** "Metrics" tab
3. **View** CPU, Memory, Network usage

## Troubleshooting

### Build Fails

**Check build logs**:
1. Go to service → "Deployments"
2. Click on failed deployment
3. Review error messages

**Common issues**:
- Missing dependencies in `package.json`
- TypeScript compilation errors
- Incorrect build command

**Solution**: Fix locally first, then push:
```bash
# Test build locally with Docker
docker-compose build backend
docker-compose build frontend

# If successful, push
git add .
git commit -m "Fix build issues"
git push
```

### Database Connection Fails

**Check DATABASE_URL**:
1. Go to backend service → "Variables"
2. Verify `DATABASE_URL` is set
3. Verify it references the PostgreSQL service

**Check database status**:
1. Go to PostgreSQL service
2. Check if it's running (green indicator)

### Frontend Can't Connect to Backend

**Check VITE_API_URL**:
1. Go to frontend service → "Variables"
2. Verify `VITE_API_URL` points to backend URL
3. Backend URL should be: `https://backend-production-xxxx.up.railway.app`

**Check CORS**:
1. Go to backend service → "Variables"
2. Verify `FRONTEND_URL` is set to your frontend URL
3. Or set to `*` to allow all origins (less secure)

### 404 on Routes (e.g., /admin)

Railway should handle SPA routing automatically. If not:

1. **Check** that your frontend is using the correct start command
2. **Verify** `404.html` exists in your build output
3. **Check** nginx configuration in `Dockerfile`

### Environment Variables Not Working

**Rebuild after changing variables**:
1. Change the variable
2. Go to "Deployments" tab
3. Click "Redeploy" on latest deployment

**For Vite variables** (VITE_*):
- Must start with `VITE_`
- Require rebuild to take effect
- Are embedded at build time, not runtime

## Cost Estimation

Railway offers a free trial with $5 credit. After that:

- **Hobby Plan**: $5/month
  - Includes $5 usage credit
  - Pay for what you use beyond that

**Typical monthly cost for this app**:
- PostgreSQL: ~$2-5
- Backend: ~$1-3
- Frontend: ~$1-2
- **Total**: ~$4-10/month

## Scaling

### Horizontal Scaling

Railway doesn't support horizontal scaling on the Hobby plan. For high traffic:
1. Upgrade to Pro plan ($20/month)
2. Enable replicas in service settings

### Vertical Scaling

Railway auto-scales resources based on usage. To set limits:
1. Go to service → "Settings"
2. Set "Resource Limits"
   - Memory: 512MB - 8GB
   - CPU: 0.5 - 8 vCPUs

## Backup & Recovery

### Database Backups

Railway doesn't provide automatic backups on free/hobby plans.

**Manual backup**:
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Backup database
railway run pg_dump $DATABASE_URL > backup.sql
```

**Restore backup**:
```bash
railway run psql $DATABASE_URL < backup.sql
```

### Code Backups

Your code is already backed up in GitHub. To rollback:
1. Go to service → "Deployments"
2. Find a previous successful deployment
3. Click "Redeploy"

## Next Steps

- 🔒 **Add Authentication** to protect admin panel
- 📧 **Email Notifications** for new orders
- 💳 **Payment Integration** (Stripe, PayPal)
- 📱 **Mobile App** using the same backend API
- 🔔 **Push Notifications** for order updates

## Support

- 📖 [Railway Documentation](https://docs.railway.app)
- 💬 [Railway Discord](https://discord.gg/railway)
- 🐛 [Report Issues](https://github.com/railwayapp/railway/issues)

## Alternative: Docker Deployment

If you prefer to deploy using Docker directly, see [DOCKER_SETUP.md](./DOCKER_SETUP.md) for local development, then deploy to:
- **DigitalOcean App Platform**
- **AWS ECS**
- **Google Cloud Run**
- **Azure Container Instances**
