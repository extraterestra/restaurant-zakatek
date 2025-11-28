# Render Deployment - Step by Step Guide

## Quick Visual Guide for Render Interface

### Step 1: Create PostgreSQL Database

1. Go to https://dashboard.render.com
2. Click **"New +"** button (top right)
3. Select **"PostgreSQL"**
4. Fill in:
   - **Name**: `restaurant-db`
   - **Database**: `restaurant_db` (default is fine)
   - **User**: `restaurant_user` (default is fine)
   - **Region**: Choose closest (e.g., `Oregon (US West)`)
   - **Plan**: `Free` (or paid if you prefer)
5. Click **"Create Database"**
6. Wait 1-2 minutes for creation
7. Once ready, click on the database name
8. Go to **"Connections"** tab
9. Copy the **"Internal Database URL"** (starts with `postgresql://`)

---

### Step 2: Deploy Backend (Web Service)

1. Click **"New +"** → **"Web Service"**
2. Click **"Connect account"** if not connected to GitHub
3. Select repository: `extraterestra/restaurant`
4. Click **"Connect"**

**Basic Settings:**
- **Name**: `restaurant-backend`
- **Region**: Same as database
- **Branch**: `main`

**Advanced Settings** (click to expand if hidden):
- **Root Directory**: Type `server` ⚠️ **This is critical!**
- **Runtime**: Auto-detected (shows "Node")
- **Build Command**: `npm install --include=dev && npm run build`
- **Start Command**: `node dist/index.js`

**Environment Variables** (scroll down):
Click **"Add Environment Variable"** for each:
1. `PORT` = `5001`
2. `DATABASE_URL` = `<paste the Internal Database URL from Step 1>`
3. `NODE_ENV` = `production`
4. `FRONTEND_URL` = `https://restaurant-frontend.onrender.com` (you'll update this after Step 3)

5. Click **"Create Web Service"**
6. Wait 5-10 minutes for first deployment
7. Once deployed, copy the URL (e.g., `https://restaurant-backend.onrender.com`)

---

### Step 3: Deploy Frontend (Static Site)

1. Click **"New +"** → **"Static Site"**
2. Select repository: `extraterestra/restaurant`
3. Click **"Connect"**

**Settings:**
- **Name**: `restaurant-frontend`
- **Region**: Same as backend
- **Branch**: `main`
- **Root Directory**: Leave empty (or `.`)
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`

**Environment Variables:**
1. `VITE_API_URL` = `https://restaurant-backend.onrender.com` (use your actual backend URL)
2. `GEMINI_API_KEY` = `<your-gemini-api-key>`
   - 📝 **Need help getting the key?** See [HOW_TO_GET_GEMINI_API_KEY.md](./HOW_TO_GET_GEMINI_API_KEY.md)
   - Quick link: https://aistudio.google.com/app/apikey

4. Click **"Create Static Site"**
5. Wait 5-10 minutes for deployment
6. Copy your frontend URL

---

### Step 4: Update Backend with Frontend URL

1. Go back to your backend service (`restaurant-backend`)
2. Go to **"Environment"** tab
3. Update `FRONTEND_URL` to your actual frontend URL
4. Click **"Save Changes"**
5. Service will automatically redeploy

---

## Troubleshooting

### Can't find "Root Directory" field?
- Look for **"Advanced"** section and expand it
- It might be in a collapsible section
- If still not visible, the service might auto-detect from your repo structure

### Build fails?
- Check the **"Logs"** tab in your service
- Common issues:
  - Missing `DATABASE_URL` → Add it in Environment Variables
  - Build command error → Check `server/package.json` exists
  - TypeScript errors → Check `server/tsconfig.json` is correct

### Database connection errors?
- Make sure you're using **Internal Database URL** (not External)
- Check `DATABASE_URL` is set correctly in backend environment variables
- Verify database is running (green status in Render dashboard)

### CORS errors?
- Make sure `FRONTEND_URL` is set in backend environment variables
- Update CORS in `server/src/index.ts` if needed

---

## After Deployment

✅ Test your application:
- Frontend: `https://restaurant-frontend.onrender.com`
- Admin: `https://restaurant-frontend.onrender.com/admin`
- Backend API: `https://restaurant-backend.onrender.com/api/orders`

✅ Check logs:
- Backend: Go to service → **"Logs"** tab
- Frontend: Go to service → **"Logs"** tab

✅ Monitor:
- Both services should show **"Live"** status
- Database should show **"Available"** status

