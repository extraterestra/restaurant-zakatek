# Troubleshooting Guide

## Issue 1: `/admin` Route Shows "Not Found"

### Problem
When accessing `https://restaurant-frontend-nuu5.onrender.com/admin`, you see "Not Found" instead of the admin panel.

### Solution
This happens because Render's static site hosting doesn't handle client-side routing by default. 

**Fix Applied:**
- Created `public/_redirects` file that redirects all routes to `index.html`
- This file is automatically copied to `dist/` during build

**If it still doesn't work:**
1. Make sure `public/_redirects` exists with content: `/*    /index.html   200`
2. Rebuild and redeploy your frontend
3. Clear your browser cache and try again

---

## Issue 2: Order Submission Fails

### Problem
When trying to complete an order, you see: "Nie udało się złożyć zamówienia. Spróbuj ponownie."

### Possible Causes & Solutions

#### 1. Backend URL Not Set Correctly

**Check:**
- Go to Render Dashboard → Your Frontend Service → Environment tab
- Verify `VITE_API_URL` is set to your backend URL (e.g., `https://restaurant-backend.onrender.com`)
- Make sure there are no trailing slashes

**Fix:**
- Update `VITE_API_URL` to: `https://your-backend-service-name.onrender.com`
- Save and redeploy

#### 2. Backend Not Running

**Check:**
- Go to Render Dashboard → Your Backend Service
- Check if status is "Live" (green)
- Check the "Logs" tab for any errors

**Test Backend:**
- Open: `https://your-backend-url.onrender.com/api/orders`
- Should return: `[]` (empty array) or a list of orders
- If you get an error, the backend is not working

#### 3. CORS Error

**Check Browser Console:**
- Open browser DevTools (F12)
- Go to Console tab
- Look for CORS errors like: "Access to fetch at '...' from origin '...' has been blocked by CORS policy"

**Fix:**
- Go to Backend Service → Environment tab
- Add/Update: `FRONTEND_URL` = `https://restaurant-frontend-nuu5.onrender.com`
- Save and redeploy backend

#### 4. Database Connection Issues

**Check Backend Logs:**
- Go to Backend Service → Logs tab
- Look for database connection errors

**Fix:**
- Verify `DATABASE_URL` is set correctly in backend environment variables
- Make sure you're using the **Internal Database URL** (not External)
- Check database is running (status should be "Available")

---

## Issue 3: Environment Variables Not Working

### Problem
Frontend can't access backend even though `VITE_API_URL` is set.

### Solution

**Important:** Vite environment variables must start with `VITE_` to be accessible in the browser.

**Check:**
1. Variable name is exactly: `VITE_API_URL` (not `API_URL` or `REACT_APP_API_URL`)
2. Value doesn't have quotes: `https://backend.onrender.com` (not `"https://backend.onrender.com"`)
3. Rebuild after changing environment variables (Render should auto-redeploy)

**Debug:**
- Add this to your component temporarily to check:
  ```javascript
  console.log('API URL:', import.meta.env.VITE_API_URL);
  ```
- Check browser console to see if the URL is correct

---

## Issue 4: Admin Panel Shows "Failed to fetch orders"

### Problem
Admin panel loads but shows error: "Nie udało się pobrać zamówień..."

### Solutions

1. **Check Backend URL:**
   - Same as Issue 2 - verify `VITE_API_URL` is correct

2. **Check Backend is Accessible:**
   - Open: `https://your-backend-url.onrender.com/api/orders` in browser
   - Should return JSON (even if empty array)

3. **Check CORS:**
   - Backend must allow your frontend URL
   - Update `FRONTEND_URL` in backend environment variables

---

## Quick Debugging Steps

1. **Check Frontend Environment Variables:**
   - Render Dashboard → Frontend Service → Environment
   - Verify `VITE_API_URL` is set

2. **Check Backend Environment Variables:**
   - Render Dashboard → Backend Service → Environment
   - Verify:
     - `DATABASE_URL` is set
     - `FRONTEND_URL` includes your frontend URL
     - `PORT` is set (usually 5001)

3. **Test Backend Directly:**
   - Open: `https://your-backend-url.onrender.com/api/orders`
   - Should return JSON

4. **Check Browser Console:**
   - Open DevTools (F12) → Console
   - Look for errors when submitting order or loading admin

5. **Check Network Tab:**
   - Open DevTools (F12) → Network
   - Try submitting order
   - Look for failed requests (red)
   - Click on failed request to see error details

---

## Common Error Messages

### "Failed to fetch"
- **Cause:** Backend is down or URL is wrong
- **Fix:** Check backend status and `VITE_API_URL`

### "CORS policy blocked"
- **Cause:** Backend doesn't allow your frontend origin
- **Fix:** Add frontend URL to backend `FRONTEND_URL` env var

### "404 Not Found" on `/admin`
- **Cause:** Static hosting doesn't handle client-side routing
- **Fix:** Ensure `public/_redirects` file exists and is deployed

### "Cannot connect to database"
- **Cause:** Wrong `DATABASE_URL` or database is down
- **Fix:** Use Internal Database URL and check database status

---

## Still Having Issues?

1. Check Render service logs (both frontend and backend)
2. Check browser console for JavaScript errors
3. Verify all environment variables are set correctly
4. Make sure all services are "Live" (green status)
5. Try redeploying services

