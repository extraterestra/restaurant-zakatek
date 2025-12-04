# How to Get Your GEMINI_API_KEY

The `GEMINI_API_KEY` is used for the **AI Chef** feature in your restaurant app, which provides personalized menu recommendations using Google's Gemini AI.

## Step-by-Step Instructions

### Step 1: Go to Google AI Studio

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account

### Step 2: Create an API Key

1. Once logged in, click on **"Get API Key"** button (usually in the top right or center of the page)
2. If you see a prompt, click **"Create API Key"**
3. You may be asked to:
   - Select a Google Cloud project (you can create a new one or use an existing)
   - Accept terms of service
4. Your API key will be generated and displayed

### Step 3: Copy Your API Key

1. **Copy the API key immediately** - it will look something like:
   ```
   AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
   ```
2. ⚠️ **Important**: You won't be able to see the full key again after closing the dialog, so make sure to copy it!

### Step 4: Use the API Key

#### For Local Development:
Add it to your `.env.local` file:
```
GEMINI_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
```

#### For Railway Deployment:
1. Go to your Railway dashboard
2. Select your frontend service
3. Go to "Variables" tab
4. Click "New Variable"
5. Add:
   - **Variable**: `GEMINI_API_KEY`
   - **Value**: `AIza...` (your actual key)
6. Railway will automatically redeploy

## Troubleshooting

### API Key Not Working

1. **Check the key is valid:**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Make sure the key is enabled and not expired

2. **Check environment variable:**
   - Verify the key is set correctly in Railway environment variables
   - Make sure there are no extra spaces or quotes

## Free Tier & Limits

- Google Gemini API has a **free tier** with generous limits
- Free tier includes:
  - 60 requests per minute
  - 1,500 requests per day
  - Perfect for development and small to medium applications

## Security Notes

⚠️ **Important Security Tips:**

1. **Never commit your API key to Git** - it's already in `.gitignore`
2. **Don't share your API key publicly**
3. **Use environment variables** - never hardcode it in your source code
4. **Rotate keys** if you suspect it's been compromised

## Troubleshooting

### "API Key not found" error:
- Make sure you copied the entire key (they're long!)
- Check for extra spaces before/after the key
- Verify the key is set correctly in Railway environment variables

### "Quota exceeded" error:
- You've hit the free tier limits
- Wait a bit or upgrade to a paid plan
- Check your usage in Google AI Studio dashboard

### "Invalid API Key" error:
- Double-check you copied the key correctly
- Make sure you're using the key from the correct Google Cloud project
- Try creating a new API key

## Need Help?

- [Google AI Studio Documentation](https://aistudio.google.com/app/apikey)
- [Gemini API Documentation](https://ai.google.dev/docs)

