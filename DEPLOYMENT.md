# Study Agent - Deployment Guide

Complete guide to deploy Study Agent to production using Vercel (Frontend) and Render (Backend).

## Architecture Overview

```
┌─────────────────────┐
│   Vercel (Frontend) │
│  React + Vite       │
│  Port: 3000         │
└──────────┬──────────┘
           │ HTTPS
           ↓
┌─────────────────────────────────────────┐
│    Render (Backend)                     │
│    FastAPI + LangChain + Ollama         │
│    Port: 8001                           │
│    - Ollama LLM (Primary)               │
│    - Google Gemini (Fallback)           │
│    - OpenAI (Fallback)                  │
│    - FAISS Vector Store (Disk)          │
└─────────────────────────────────────────┘
```

---

## Part 1: Frontend Deployment (Vercel)

### Prerequisites
- GitHub account
- Vercel account (free tier works)
- Frontend code pushed to GitHub

### Step 1: Push Frontend to GitHub

```bash
cd /Users/yash/study_agent
git add frontend/
git commit -m "Update frontend for production"
git push origin main
```

### Step 2: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `frontend` directory as root
5. Configure build settings:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Add Environment Variables

In Vercel project settings, add:

```
VITE_API_BASE_URL=https://your-backend-url.onrender.com
```

Replace `your-backend-url` with your actual Render backend URL (will get this in Part 2).

### Step 4: Deploy

Click "Deploy" - Vercel will automatically build and deploy on every push to main.

---

## Part 2: Backend Deployment (Render)

### Prerequisites
- Render account (free tier works for hobby projects)
- Backend code pushed to GitHub
- API keys ready:
  - `GOOGLE_API_KEY` (for Gemini fallback)
  - `OPENAI_API_KEY` (for OpenAI fallback)
  - Optional: Both can be blank if Ollama is primary

### Step 1: Create Render.yaml Configuration

Create `/Users/yash/study_agent/render.yaml`:

```yaml
services:
  - type: web
    name: study-agent-backend
    env: python
    plan: free
    
    # Build Configuration
    buildCommand: |
      cd backend
      pip install --upgrade pip
      pip install -r requirements.txt
    
    # Start Command
    startCommand: |
      cd backend
      uvicorn main:app --host 0.0.0.0 --port $PORT
    
    # Environment Variables (add these in Render dashboard)
    envVars:
      - key: OLLAMA_BASE_URL
        value: http://localhost:11434
      - key: OLLAMA_MODEL
        value: mistral
      - key: FAISS_INDEX_PATH
        value: ./outputs/faiss_index
      - key: PORT
        value: 8001
    
    # Persistent Disk for FAISS outputs
    disk:
      name: faiss-storage
      mountPath: /opt/render/project/backend/outputs
      sizeGB: 5
```

### Step 2: Push to GitHub

```bash
cd /Users/yash/study_agent
git add render.yaml backend/
git commit -m "Add Render deployment configuration"
git push origin main
```

### Step 3: Create Render Web Service

1. Go to [render.com](https://render.com)
2. Click "New Web Service"
3. Connect GitHub repository
4. Select your study_agent repository
5. Configure:
   - **Name**: study-agent-backend
   - **Environment**: Python 3.11
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port 8001`
   - **Plan**: Free (or Starter for better performance)

### Step 4: Add Environment Variables

In Render dashboard, go to Environment:

```
GOOGLE_API_KEY=your_google_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=mistral
FAISS_INDEX_PATH=/opt/render/project/backend/outputs/faiss_index
```

### Step 5: Add Persistent Disk

1. Go to Disks section
2. Create disk:
   - **Name**: faiss-storage
   - **Size**: 5GB
   - **Mount Path**: `/opt/render/project/backend/outputs`

### Step 6: Deploy

Click "Create Web Service" - Render will build and deploy automatically.

### Important Note about Ollama on Render

**Ollama cannot run in standard containers**. You have two options:

**Option A: Skip Ollama, use Google/OpenAI (Recommended for Free tier)**
- Remove Ollama from environment
- Backend will automatically fallback to Google Gemini (Tier 2)
- Ensure `GOOGLE_API_KEY` is set

**Option B: Use Ollama with Render Private Spaces**
- Requires Render Starter plan ($7/month)
- Run Ollama in a separate service with persistent storage
- More complex setup but fully local inference

For this guide, we'll use **Option A** (Google Gemini fallback).

---

## Part 3: Update Configuration for Production

### Backend Configuration for Render (No Ollama)

Update `backend/main.py` to handle missing Ollama gracefully:

The three-tier system automatically handles this:
1. Tries Ollama → Fails on Render
2. Falls back to Google Gemini (Tier 2)
3. Falls back to OpenAI (Tier 3)

### Frontend Configuration Update

Update `frontend/src/api.js`:

```javascript
const baseURL = process.env.VITE_API_BASE_URL || "http://localhost:8001";

const api = axios.create({
  baseURL: baseURL,
  timeout: 300000, // 5 minutes for normal requests
});
```

---

## Part 4: Connection Test

### Test Backend Health

```bash
curl https://your-backend-url.onrender.com/health
```

Should return:
```json
{"status": "ok"}
```

### Test Frontend

Visit: `https://your-frontend-url.vercel.app`

Should load the Study Agent UI.

---

## Part 5: Production Checklist

### Frontend
- [ ] Environment variable `VITE_API_BASE_URL` set correctly
- [ ] API calls work from frontend
- [ ] File upload succeeds
- [ ] Quiz/Flashcards/Planner display correctly

### Backend
- [ ] Health check endpoint responds
- [ ] PDF upload works
- [ ] Study materials generation works
- [ ] Chat endpoint responds
- [ ] Logs show correct provider (Google Gemini or OpenAI)
- [ ] Persistent disk has FAISS outputs after generation

### Environment
- [ ] `GOOGLE_API_KEY` set in Render
- [ ] `OPENAI_API_KEY` set in Render (if using OpenAI)
- [ ] CORS enabled for Vercel domain
- [ ] Persistent disk mounted at `/opt/render/project/backend/outputs`

---

## Troubleshooting

### Backend fails to start on Render

**Problem**: Build fails with missing dependencies
**Solution**: 
```bash
cd backend
pip install -r requirements.txt --upgrade
git add requirements.txt
git commit -m "Update requirements"
git push
```

### FAISS index not persisting

**Problem**: Files disappear after redeploy
**Solution**: Ensure persistent disk is mounted correctly
- Check Render dashboard → Disks
- Mount path should be: `/opt/render/project/backend/outputs`
- Size: At least 5GB

### Frontend cannot reach backend

**Problem**: CORS errors or connection refused
**Solution**:
1. Check backend is running: `curl https://backend-url.onrender.com/health`
2. Update `VITE_API_BASE_URL` in Vercel environment
3. Redeploy frontend after env change

### Google API quota exceeded

**Problem**: "429 Quota exceeded"
**Solution**:
- Use OpenAI instead (set `OPENAI_API_KEY`)
- Or upgrade Google Cloud plan
- Or implement rate limiting in frontend

### Ollama not available on Render

**Expected**: Ollama will fail on Render (no Docker daemon)
**Solution**: This is handled by three-tier fallback to Google Gemini
- No action needed
- Check logs show "Ollama Tier 1 failed" → "Google Gemini Tier 2 SUCCESS"

---

## Monitoring & Maintenance

### View Backend Logs

Render Dashboard → Services → Logs

Look for:
- `✅ SUCCESS: Using Google Gemini`
- `Generated X flashcards`
- Any error messages

### Rebuild & Redeploy

Make code changes locally:
```bash
cd /Users/yash/study_agent
git add .
git commit -m "Your change"
git push origin main
```

Services will automatically redeploy.

### Restart Services

**Frontend** (Vercel): No-action redeploy via dashboard
**Backend** (Render): Settings → Restart Web Service

---

## Cost Summary

| Service | Plan | Cost | Notes |
|---------|------|------|-------|
| Vercel | Free | $0 | Unlimited deployments |
| Render | Free | $0 | Good for MVP, cold starts |
| Google Gemini | Free | $0 | 60 requests/min free tier |
| OpenAI | Pay-as-you-go | ~$0.01-0.10 per request | Only if Gemini fails |
| **Total** | | **$0-5/month** | Depends on usage |

---

## Next Steps

1. **Deploy Frontend to Vercel**
   - Push code → Vercel auto-deploys
   - Get frontend URL

2. **Deploy Backend to Render**
   - Add render.yaml → Push code
   - Set environment variables
   - Get backend URL

3. **Update Frontend Environment**
   - Set `VITE_API_BASE_URL` to Render URL
   - Redeploy frontend

4. **Test Full Workflow**
   - Upload PDF
   - Generate study materials
   - Check all features work

5. **Monitor & Iterate**
   - Watch logs
   - Collect user feedback
   - Deploy updates via git push

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com/deployment/
- **React Vite Docs**: https://vitejs.dev/guide/

