# Study Agent - Quick Deployment Commands

Copy-paste commands for deploying Study Agent to production.

---

## Step 1: Prepare Local Repository

```bash
cd /Users/yash/study_agent

# Ensure everything is clean
git status  # Should show nothing to commit

# If there are changes:
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

---

## Step 2: Deploy Backend to Render

### 2.1: Add render.yaml to repository

```bash
# Check if render.yaml exists
ls -la /Users/yash/study_agent/render.yaml

# If not, it should already be created by our guide
# If needed, commit and push it:
git add render.yaml
git commit -m "Add Render deployment configuration"
git push origin main
```

### 2.2: Create Render Web Service

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Select **"Deploy from GitHub"**
4. Authorize GitHub and select `yash-clouded/study_agent`
5. Fill in form:
   - **Name**: `study-agent-backend`
   - **Environment**: `Python 3`
   - **Region**: Select your region
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 8001`
   - **Plan**: `Free`

### 2.3: Add Environment Variables in Render

After creating service, click on it and go to **Environment**:

```
GOOGLE_API_KEY=your_actual_google_api_key_here
OPENAI_API_KEY=your_actual_openai_api_key_here
OLLAMA_MODEL=mistral
OLLAMA_BASE_URL=http://localhost:11434
FAISS_INDEX_PATH=/opt/render/project/backend/outputs/faiss_index
```

### 2.4: Create Persistent Disk in Render

1. Click on service
2. Go to **Disks**
3. Click **Create**:
   - **Name**: `faiss-storage`
   - **Mounted Path**: `/opt/render/project/backend/outputs`
   - **Size**: `5 GB`

### 2.5: Deploy

Click **"Create Web Service"** and wait for build (5-10 minutes).

**Copy your backend URL** from the service page (e.g., `https://study-agent-backend-xxxxx.onrender.com`)

---

## Step 3: Deploy Frontend to Vercel

### 3.1: Create Vercel Project

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Authorize GitHub and select `yash-clouded/study_agent`
5. Fill in form:
   - **Project Name**: `study-agent-frontend` (or auto-filled)
   - **Framework**: `Vite`
   - **Root Directory**: `frontend`
6. Click **"Import"**

### 3.2: Add Environment Variables

In Vercel, go to **Settings** → **Environment Variables**:

```
VITE_API_BASE_URL=https://study-agent-backend-xxxxx.onrender.com
```

Replace `xxxxx` with your actual Render backend URL from Step 2.

### 3.3: Deploy

Click **"Deploy"** and wait for build (3-5 minutes).

**Copy your frontend URL** (e.g., `https://study-agent-xxx.vercel.app`)

---

## Step 4: Test Everything

### 4.1: Test Backend

```bash
# Replace xxxxx with your actual Render URL
curl https://study-agent-backend-xxxxx.onrender.com/health
```

Expected: `{"status":"ok"}`

### 4.2: Test Frontend

1. Open browser
2. Go to `https://study-agent-xxx.vercel.app`
3. Verify UI loads with all tabs

### 4.3: Test Integration

1. Upload a PDF file
2. Click "Generate All"
3. Wait 30-60 seconds
4. Check Flashcards, Quizzes, Planner tabs
5. Try Chat with a question

---

## Step 5: Update & Redeploy

### Push new changes:

```bash
cd /Users/yash/study_agent

# Make your changes
# ... edit files ...

# Commit and push
git add .
git commit -m "Your change description"
git push origin main
```

**Automatic redeploy**: Vercel and Render auto-deploy on push (2-5 minutes)

### Manual redeploy if needed:

**Vercel**: Dashboard → Project → Deployments → Click deploy again

**Render**: Dashboard → Service → Manual Deploy

---

## Monitoring Commands

### Check Backend Status

```bash
# Health check
curl https://study-agent-backend-xxxxx.onrender.com/health

# Real-time logs (replace xxxxx)
# Go to: https://render.com/dashboard → study-agent-backend → Logs
```

### Check Frontend Status

```bash
# Visit in browser
https://study-agent-xxx.vercel.app

# Logs (go to): https://vercel.com/dashboard → study-agent-frontend → Deployments
```

---

## Troubleshooting

### Backend won't start

```bash
# Check what's wrong - look at Render logs
# Usually: missing package in requirements.txt
# Fix locally first:
cd /Users/yash/study_agent/backend
pip install -r requirements.txt

# If that works, commit and push:
git add requirements.txt
git commit -m "Fix dependencies"
git push origin main
```

### Frontend can't connect to backend

```javascript
// In browser DevTools Console:
fetch('https://study-agent-backend-xxxxx.onrender.com/health')
  .then(r => r.json())
  .then(d => console.log(d))
  .catch(e => console.error(e))
```

If this fails, check:
1. Backend is running (Render dashboard)
2. `VITE_API_BASE_URL` is correct in Vercel environment
3. Redeploy frontend after env change

### Cold start on first request

Normal for free tier (30-60 second delay). Upgrade to Starter plan for instant starts.

---

## Environment Variables Quick Copy-Paste

### Backend (Render) - Environment Variables

```
GOOGLE_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
OLLAMA_MODEL=mistral
OLLAMA_BASE_URL=http://localhost:11434
FAISS_INDEX_PATH=/opt/render/project/backend/outputs/faiss_index
```

### Frontend (Vercel) - Environment Variables

```
VITE_API_BASE_URL=https://study-agent-backend-xxxxx.onrender.com
```

---

## URLs to Bookmark

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | https://study-agent-xxx.vercel.app | User access |
| Backend | https://study-agent-backend-xxxxx.onrender.com | API calls |
| Render Dashboard | https://render.com/dashboard | Monitor backend |
| Vercel Dashboard | https://vercel.com/dashboard | Monitor frontend |
| GitHub | https://github.com/yash-clouded/study_agent | Source code |

---

## Complete Deployment Timeline

```
1. Prepare local repo (2 min)
2. Deploy backend to Render (10 min)
3. Deploy frontend to Vercel (5 min)
4. Add environment variables (3 min)
5. Test everything (5 min)
─────────────────────────────
Total: ~25 minutes first-time
Subsequent: 2-3 minutes (just git push)
```

---

## Key Points

✅ **Automatically deployed** on every push to main  
✅ **Free tier** is sufficient for MVP  
✅ **Ollama** will fail on Render (expected) → Google Gemini takes over  
✅ **Files persist** in Render persistent disk  
✅ **Cold starts** on free tier (upgrade for instant starts)  

---

## Documentation Files

- `DEPLOYMENT.md` - Complete deployment guide
- `RENDER_DEPLOYMENT.md` - Render-specific details
- `VERCEL_DEPLOYMENT.md` - Vercel-specific details
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
- `backend/.env.example` - Backend configuration template
- `frontend/.env.example` - Frontend configuration template

---

## Need Help?

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **FastAPI**: https://fastapi.tiangolo.com/deployment/
- **GitHub**: https://docs.github.com

🚀 Ready to deploy!
