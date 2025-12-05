# 🧪 Railway Test Environment Setup

This guide will help you create a **staging/test environment** on Railway that deploys from the `develop` branch.

## Overview

You'll create a separate set of services for testing:

**Production Environment:**
- Branch: `main`
- Services: `backend`, `frontend`, `postgres`
- URLs: `*-production-*.railway.app`

**Test Environment:**
- Branch: `develop`
- Services: `backend-test`, `frontend-test`, `postgres-test`
- URLs: `*-test-*.railway.app`

---

## Step-by-Step Setup

### Option 1: Create New Services in Same Project (Recommended)

This keeps everything in one Railway project but with separate services for test/prod.

#### Step 1: Add Test PostgreSQL Database

1. **Go to your Railway project**
2. **Click "New" → "Database" → "PostgreSQL"**
3. **Rename the service**:
   - Click on the service name
   - Rename to: `postgres-test`
4. **Wait for provisioning** (~30 seconds)

#### Step 2: Deploy Backend Test Service

1. **Click "New" → "GitHub Repo"**
2. **Select your repository**: `extraterestra/restaurant`
3. **Configure the service**:
   - **Name**: `backend-test`
   - **Root Directory**: `server`
   - **Branch**: `develop` ⚠️ **Important!**

4. **Set Build Configuration**:
   - Go to **Settings** → **Build**
   - **Builder**: Dockerfile
   - **Dockerfile Path**: `server/Dockerfile`

5. **Add Environment Variables**:
   - Go to **Variables** tab
   - Add these variables:

   | Variable | Value |
   |----------|-------|
   | `PORT` | `5001` |
   | `NODE_ENV` | `staging` |
   | `DATABASE_URL` | **Reference** → `postgres-test.DATABASE_URL` |
   | `FRONTEND_URL` | `*` (update later with frontend URL) |

6. **Generate Domain**:
   - Go to **Settings** → **Networking**
   - Click **"Generate Domain"**
   - Copy the URL (e.g., `backend-test-production-xxxx.up.railway.app`)

#### Step 3: Deploy Frontend Test Service

1. **Click "New" → "GitHub Repo"**
2. **Select your repository**: `extraterestra/restaurant`
3. **Configure the service**:
   - **Name**: `frontend-test`
   - **Root Directory**: `.` (root)
   - **Branch**: `develop` ⚠️ **Important!**

4. **Set Build Configuration**:
   - Go to **Settings** → **Build**
   - **Builder**: Dockerfile
   - **Dockerfile Path**: `Dockerfile`

5. **Add Environment Variables**:
   - Go to **Variables** tab
   - Add these variables:

   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | `https://backend-test-production-xxxx.up.railway.app` |
   | `GEMINI_API_KEY` | Your Gemini API key |

6. **Remove Start Command**:
   - Go to **Settings** → **Deploy**
   - **Pre-deploy Command**: Leave empty
   - **Custom Start Command**: Leave empty (Dockerfile handles it)

7. **Generate Domain**:
   - Go to **Settings** → **Networking**
   - Click **"Generate Domain"**
   - Copy the URL (e.g., `frontend-test-production-xxxx.up.railway.app`)

#### Step 4: Update CORS Settings

1. **Go back to backend-test service**
2. **Update `FRONTEND_URL` variable**:
   - Variables tab
   - Update `FRONTEND_URL` to your frontend-test URL
   - Or keep as `*` for testing

3. **Redeploy backend-test**:
   - Go to Deployments tab
   - Click "Redeploy"

#### Step 5: Verify Test Environment

1. **Open frontend-test URL** in browser
2. **Test the application**:
   - ✅ Menu loads
   - ✅ Can add items to cart
   - ✅ Can create orders
   - ✅ Admin panel works at `/admin`

---

### Option 2: Create Separate Railway Project (Alternative)

If you want complete isolation between test and production:

1. **Create a new Railway project**: "Restaurant Test"
2. **Follow the same steps as production deployment**
3. **Set all services to watch `develop` branch**

**Pros:**
- Complete isolation
- Separate billing
- Can delete entire test project easily

**Cons:**
- More expensive (separate resources)
- Need to manage two projects

---

## Environment Comparison

### Production
```
Project: Restaurant (Production)
Branch: main
Services:
  - backend (port 5001)
  - frontend (port 80)
  - postgres
URLs:
  - Frontend: https://frontend-production-64e1.up.railway.app
  - Backend: https://backend-production-40df.up.railway.app
```

### Test/Staging
```
Project: Restaurant (Production) - same project
Branch: develop
Services:
  - backend-test (port 5001)
  - frontend-test (port 80)
  - postgres-test
URLs:
  - Frontend: https://frontend-test-production-xxxx.up.railway.app
  - Backend: https://backend-test-production-xxxx.up.railway.app
```

---

## Workflow After Setup

### Development Workflow

```
1. Create feature branch
   git checkout -b feature/new-feature

2. Develop and test locally
   docker-compose up -d

3. Push to feature branch
   git push origin feature/new-feature

4. Create PR to develop
   (GitHub Pull Request)

5. Merge to develop
   → Triggers Railway TEST deployment

6. Test on staging
   https://frontend-test-production-xxxx.up.railway.app

7. If tests pass, merge develop → main
   → Triggers Railway PRODUCTION deployment
```

### Auto-Deploy Configuration

**Test Environment:**
- ✅ Watches `develop` branch
- ✅ Auto-deploys on push to `develop`
- ✅ Separate database (test data)

**Production Environment:**
- ✅ Watches `main` branch
- ✅ Auto-deploys on push to `main`
- ✅ Production database (real data)

---

## Cost Considerations

Railway charges based on resource usage:

**With Test Environment:**
- PostgreSQL (prod): ~$2-5/month
- PostgreSQL (test): ~$2-5/month
- Backend (prod): ~$1-3/month
- Backend (test): ~$1-3/month
- Frontend (prod): ~$1-2/month
- Frontend (test): ~$1-2/month
- **Total**: ~$8-20/month

**Tips to Reduce Costs:**
- Use the same project (Option 1)
- Scale down test services when not in use
- Delete test environment when not needed
- Use Railway's free trial credits

---

## Troubleshooting

### Test Services Not Deploying

**Check:**
1. Branch is set to `develop` in Settings → Source
2. Dockerfile path is correct
3. Environment variables are set

### Database Connection Issues

**Fix:**
1. Ensure `DATABASE_URL` references `postgres-test` service
2. Use variable reference, not hardcoded value
3. Redeploy backend-test after fixing

### Frontend Can't Connect to Backend

**Fix:**
1. Check `VITE_API_URL` in frontend-test variables
2. Ensure it points to backend-test URL
3. Rebuild frontend-test (Vite needs rebuild for env vars)

---

## Next Steps

After setting up test environment:

1. ✅ Update README.md with test URLs
2. ✅ Configure GitHub branch protection rules
3. ✅ Set up automated testing (optional)
4. ✅ Add monitoring and alerts (optional)

---

## Summary

**You now have:**
- ✅ Production environment (main branch)
- ✅ Test/Staging environment (develop branch)
- ✅ Automatic deployments for both
- ✅ Isolated databases for each environment
- ✅ Professional development workflow

**Deployment Flow:**
```
feature → develop (test) → main (production)
            ↓                  ↓
      Railway Test      Railway Prod
```

Happy testing! 🧪🚀
