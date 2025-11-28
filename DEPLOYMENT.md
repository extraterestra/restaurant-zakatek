# Deployment Guide

This guide covers deploying the Restaurant application to **Render** and **Vercel**.

## 🚀 Option 1: Render (Recommended for Full-Stack)

Render is ideal for deploying both frontend and backend together with a PostgreSQL database.

### Prerequisites
- GitHub account
- Render account (free tier available)

### Step 1: Deploy PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `restaurant-db`
   - **Database**: `restaurant_db` (auto-filled, you can change)
   - **User**: `restaurant_user` (auto-filled, you can change)
   - **Region**: Choose closest to you
   - **PostgreSQL Version**: Latest (default)
   - **Plan**: Free (or choose paid)
4. Click **"Create Database"**
5. Wait for database to be created (takes 1-2 minutes)
6. Once created, go to the database dashboard
7. In the **"Connections"** section, find **"Internal Database URL"**
8. **Copy the Internal Database URL** (format: `postgresql://user:password@hostname:5432/database`)
   - ⚠️ **Important**: Use the **Internal** URL, not the External one (faster and no connection limits)

### Step 2: Deploy Backend Server

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository: `extraterestra/restaurant`
3. Configure the service:
   - **Name**: `restaurant-backend`
   - **Region**: Choose closest to you (e.g., `Oregon (US West)`)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `server` ⚠️ **Important: Set this to `server`**
   - **Runtime**: Will auto-detect as `Node` (you don't need to set this manually)
   - **Build Command**: `npm install --include=dev && npm run build`
   - **Start Command**: `node dist/index.js`
4. Scroll down to **"Environment Variables"** section and click **"Add Environment Variable"**:
   - Add: `PORT` = `5001`
   - Add: `DATABASE_URL` = `<paste-internal-database-url-from-step-1>`
   - Add: `NODE_ENV` = `production`
   - Add: `FRONTEND_URL` = `https://restaurant-frontend.onrender.com` (or your frontend URL)
5. Scroll down and click **"Create Web Service"**
6. Wait for deployment to complete (first build may take 5-10 minutes)
7. Copy the service URL from the top of the page (e.g., `https://restaurant-backend.onrender.com`)

**Note**: If you don't see "Root Directory" field, look for "Advanced" settings or it might be in a collapsible section. The Runtime/Environment field is usually auto-detected from your `package.json` file.

### Step 3: Deploy Frontend

1. In Render Dashboard, click **"New +"** → **"Static Site"**
2. Connect your GitHub repository: `extraterestra/restaurant`
3. Configure:
   - **Name**: `restaurant-frontend`
   - **Region**: Same as backend (for better performance)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty or `.` (root directory)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Scroll down to **"Environment Variables"** section and click **"Add Environment Variable"**:
   - Add: `VITE_API_URL` = `https://restaurant-backend.onrender.com` (use your actual backend URL from Step 2)
   - Add: `GEMINI_API_KEY` = `<your-gemini-api-key>`
     - 📝 **Don't have a key?** See [HOW_TO_GET_GEMINI_API_KEY.md](./HOW_TO_GET_GEMINI_API_KEY.md) for instructions
     - Or visit: https://aistudio.google.com/app/apikey
5. Click **"Create Static Site"**
6. Wait for deployment (first build may take 5-10 minutes)
7. Your frontend will be available at `https://restaurant-frontend.onrender.com`

### Step 4: Update Backend CORS (if needed)

If you encounter CORS issues, update `server/src/index.ts`:

```typescript
app.use(cors({
  origin: ['https://restaurant-frontend.onrender.com', 'http://localhost:3000'],
  credentials: true
}));
```

---

## ⚡ Option 2: Vercel (Frontend) + Render (Backend)

Vercel is excellent for frontend deployment, while Render handles the backend and database.

### Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository: `extraterestra/restaurant`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   ```
   VITE_API_URL=https://restaurant-backend.onrender.com
   GEMINI_API_KEY=<your-gemini-api-key>
   ```
6. Click **"Deploy"**

### Deploy Backend to Render

Follow **Step 1** and **Step 2** from the Render section above.

---

## 🔧 Environment Variables Reference

### Frontend (.env.local or Vercel/Render env vars)
```
VITE_API_URL=https://your-backend-url.com
GEMINI_API_KEY=your-gemini-api-key
```

### Backend (Render env vars)
```
PORT=5001
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
```

---

## 📝 Post-Deployment Checklist

- [ ] Database is running and accessible
- [ ] Backend API is responding at `/api/orders`
- [ ] Frontend can connect to backend (check browser console)
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] Test creating an order
- [ ] Test admin panel at `/admin`

---

## 🐛 Troubleshooting

### CORS Errors
- Ensure backend CORS includes your frontend URL
- Check that `VITE_API_URL` is set correctly

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- For Render, use the **Internal Database URL** (not external)
- Check database is running

### Build Failures
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### API Not Found
- Verify backend URL in `VITE_API_URL`
- Check backend is deployed and running
- Test backend endpoints directly (e.g., `https://your-backend.onrender.com/api/orders`)

---

## 🔗 Quick Links

- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [PostgreSQL on Render](https://render.com/docs/databases)

---

## 💡 Tips

1. **Use Render's Internal Database URL** for backend (faster, no connection limits)
2. **Enable Auto-Deploy** in Render/Vercel to automatically deploy on git push
3. **Monitor logs** in both platforms to catch errors early
4. **Test locally** with production-like environment variables before deploying

