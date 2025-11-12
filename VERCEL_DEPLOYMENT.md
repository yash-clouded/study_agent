# Study Agent Frontend - Vercel Deployment Guide

Quick start guide for deploying Study Agent frontend to Vercel.

## Prerequisites

- Vercel account (free)
- GitHub repository with code pushed
- Backend already deployed to Render (or know the backend URL)

## Quick Start (3 minutes)

### 1. Push Code to GitHub

```bash
cd /Users/yash/study_agent
git add .
git commit -m "Prepare frontend for Vercel deployment"
git push origin main
```

### 2. Create Vercel Project

1. Go to [vercel.com](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Choose **"Import Git Repository"**
4. Find and select `study_agent` repository
5. Click **"Import"**

### 3. Configure Project

Vercel will auto-detect Vite. Confirm these settings:

- **Framework**: Vite
- **Root Directory**: `frontend` ← Important!
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 4. Add Environment Variables

Click **"Environment Variables"** and add:

```
VITE_API_BASE_URL=https://study-agent-backend-xxxxx.onrender.com
```

Replace `xxxxx` with your actual Render backend URL.

**To find your Render URL**:
1. Go to [render.com/dashboard](https://render.com/dashboard)
2. Click `study-agent-backend` service
3. Copy the URL from "Settings" → "Service URL"

### 5. Deploy

Click **"Deploy"** - Vercel will build and deploy automatically.

---

## Verify Deployment

### Check Frontend is Running

Visit the URL shown in Vercel dashboard (e.g., `https://study-agent-xxx.vercel.app`)

You should see:
- ✅ Study Agent UI loads
- ✅ Upload panel visible
- ✅ Tabs for Chat, Flashcards, Quizzes, Planner

### Test API Connection

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try uploading a PDF file
4. Check Network tab - requests should go to your Render backend
5. Look for status 200 responses

### Troubleshoot Connection

If uploads fail, check:

```javascript
// Open browser console and run:
fetch('https://your-backend-url.onrender.com/health')
  .then(r => r.json())
  .then(d => console.log('Backend OK:', d))
  .catch(e => console.error('Backend failed:', e))
```

---

## Update Environment Variable

If you need to update the backend URL later:

1. Go to Vercel Dashboard → Project Settings
2. Click **"Environment Variables"**
3. Update `VITE_API_BASE_URL` with new backend URL
4. Click **"Save"**
5. Redeploy:
   - Go to Deployments tab
   - Click **"Redeploy"** on latest deployment
   - Or push new commit to auto-redeploy

---

## Automatic Redeploys

Every time you push to `main` branch, Vercel auto-deploys:

```bash
# Make changes
cd /Users/yash/study_agent/frontend
echo "// new comment" >> src/App.jsx

# Commit and push
git add src/App.jsx
git commit -m "Update App component"
git push origin main

# Vercel auto-redeploys within 1-2 minutes
# Monitor at: vercel.com/dashboard → select project → Deployments
```

---

## Configuration Files

### Current Setup

**`frontend/vite.config.js`** (already configured):
```javascript
export default {
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8001'
    }
  }
}
```

**`frontend/src/api.js`** (uses environment variable):
```javascript
const baseURL = process.env.VITE_API_BASE_URL || "http://localhost:8001";
```

**`frontend/vercel.json`** (generated for this guide):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### For Local Development (no changes needed)

```bash
cd /Users/yash/study_agent/frontend
npm run dev  # Uses http://localhost:8001 by default
```

### For Production (via Vercel env var)

Vercel uses `VITE_API_BASE_URL` environment variable.

---

## Troubleshooting

### Build Fails with "npm ERR!"

**Solution**:
```bash
cd /Users/yash/study_agent/frontend
npm install  # Install dependencies locally first
npm run build  # Test build locally
```

If local build succeeds but Vercel fails:
1. Check `package.json` has all dependencies
2. Commit and push again
3. Or click "Redeploy" in Vercel dashboard

### "Cannot find module" errors

**Solution**: Ensure all imports use correct paths

```bash
# Check if dependencies are installed
npm list react axios  # Should show versions

# If missing, add them
npm install react axios vite

# Update package.json
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

### Frontend loads but "API connection failed"

**Cause**: `VITE_API_BASE_URL` is wrong or backend is down

**Solution**:
1. Check Vercel environment variable is set correctly
2. Verify backend is running: `curl https://your-backend.onrender.com/health`
3. Check backend logs for errors
4. Update `VITE_API_BASE_URL` and redeploy

### "Failed to fetch" when uploading PDF

**Cause**: CORS issue or backend timeout

**Solution**:
1. Check backend `main.py` has CORS middleware enabled ✅ (should be line 42)
2. Verify backend can handle file upload size (default: unlimited in FastAPI)
3. Increase timeout in `frontend/src/api.js` if needed:

```javascript
const api = axios.create({
  baseURL: baseURL,
  timeout: 600000,  // 10 minutes for large files
});
```

### "Failed to compile" error in Vercel logs

**Cause**: JavaScript syntax error in source code

**Solution**:
1. Check the error message for file and line number
2. Fix the issue locally
3. Test: `npm run build`
4. Commit and push

---

## Performance Tips

### Reduce Build Size

Already optimized, but can add:

**`.env.production`** (production optimizations):
```
VITE_APP_TITLE=Study Agent
```

### Optimize Images

Already using lightweight UI, but for future:
```bash
# Compress any images
npm install -g imagemin imagemin-mozjpeg
imagemin src/assets/images --out-dir=src/assets/images-compressed
```

### Enable Caching

Vercel handles caching automatically, but you can set headers in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/dist/:path*",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## Monitoring & Debugging

### View Deployment Logs

1. Go to Vercel Dashboard
2. Select `study-agent-frontend` project
3. Click **Deployments** tab
4. Click latest deployment → **Build Logs** or **Runtime Logs**

### Common Log Entries

| Message | Meaning |
|---------|---------|
| `Build completed successfully` | ✅ Frontend built |
| `Deployment ready` | ✅ Frontend is live |
| `Installed dependencies` | Dependencies fetched from npm |
| `Running build script` | `npm run build` executing |

### Browser DevTools Debugging

In browser (DevTools → Network tab):

- **Green 200**: Successful request to backend
- **Red 404**: Backend endpoint doesn't exist
- **Red 0**: Backend unreachable (CORS or offline)
- **Red 504**: Backend timeout

---

## Cost & Limits

### Vercel Free Tier

- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Serverless functions
- 📊 **Limits**: 100GB bandwidth/month, 12 function invocations/second

### For This Project

- 🟢 **Free tier is sufficient** for MVP and demo
- 📈 Upgrade to **Pro** ($20/month) if >100GB bandwidth/month needed

---

## CI/CD Pipeline

Vercel auto-deploys on every push to main:

```
Your code
    ↓
git push origin main
    ↓
GitHub receives push
    ↓
Vercel webhook triggers
    ↓
Vercel pulls latest code
    ↓
npm install (1 min)
    ↓
npm run build (1 min)
    ↓
Deploy to CDN (instant)
    ↓
Live in 2-3 minutes
```

No manual steps needed!

---

## Preview Deployments

Vercel creates preview URLs for every pull request:

```bash
# Create a feature branch
git checkout -b new-feature

# Make changes
# Commit and push
git push origin new-feature

# Go to GitHub → create Pull Request
# Vercel automatically creates preview URL in PR comments

# Team can test at preview URL before merging
# After merge to main, automatic production deploy
```

---

## API Base URL Management

### Development
```bash
npm run dev  # Uses http://localhost:8001
```

### Production (Vercel)
```
VITE_API_BASE_URL=https://your-render-backend.onrender.com
```

### Staging (Optional)
```
VITE_API_BASE_URL=https://staging-backend.onrender.com
```

To switch between environments:
1. Vercel Dashboard → Environment Variables
2. Create variable with different values per environment
3. Or create separate Vercel projects for staging/prod

---

## Next Steps

1. ✅ Deploy frontend to Vercel (this guide)
2. ✅ Test frontend loads
3. ✅ Test API connection to backend
4. ✅ Upload a PDF and generate materials
5. ✅ Share public URL with team
6. ✅ Monitor performance and costs

---

## Helpful Commands

```bash
# Test build locally
cd /Users/yash/study_agent/frontend
npm run build

# Preview production build locally
npm run preview

# Check what will be deployed
git status
git diff

# View deployment history
git log --oneline -n 10
```

---

## Getting Help

- **Vercel Docs**: https://vercel.com/docs
- **Vite Docs**: https://vitejs.dev/guide/
- **React Docs**: https://react.dev/
- **GitHub Actions/CI**: https://github.com/features/actions

