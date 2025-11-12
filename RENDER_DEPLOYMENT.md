# Study Agent Backend - Render Deployment Guide

Quick start guide for deploying Study Agent backend to Render.

## Prerequisites

- Render account (free)
- GitHub repository with code pushed
- API Keys ready:
  - `GOOGLE_API_KEY` (for Gemini fallback) - **Recommended**
  - `OPENAI_API_KEY` (for OpenAI fallback) - Optional

## Quick Start (5 minutes)

### 1. Connect GitHub to Render

```bash
# Ensure all changes are committed and pushed
cd /Users/yash/study_agent
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Create Web Service on Render

1. Go to [render.com](https://render.com/dashboard)
2. Click **"New +"** → **"Web Service"**
3. Choose **"Deploy from GitHub"**
4. Connect your `study_agent` repository
5. Fill in the form:
   - **Name**: `study-agent-backend`
   - **Environment**: `Python 3`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend` ← Important!
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 8001`
   - **Plan**: Select **Free** (or Starter for better performance)

### 3. Add Environment Variables

In the Web Service settings, go to **Environment** and add:

```
GOOGLE_API_KEY=your_actual_google_api_key_here
OPENAI_API_KEY=your_actual_openai_api_key_here (optional)
OLLAMA_MODEL=mistral
OLLAMA_BASE_URL=http://localhost:11434
FAISS_INDEX_PATH=/opt/render/project/backend/outputs/faiss_index
```

### 4. Create Persistent Disk

1. Click on **Disks** tab
2. Click **Create Disk**
3. Configure:
   - **Name**: `faiss-storage`
   - **Mounted Path**: `/opt/render/project/backend/outputs`
   - **Size**: `5 GB`
4. Click **Create**

### 5. Deploy

Click **"Create Web Service"** - Render will start building and deploying.

---

## Verify Deployment

### Check Backend Health

```bash
# Replace with your actual Render URL
curl https://study-agent-backend-xxxxx.onrender.com/health
```

Expected response:
```json
{"status": "ok"}
```

### View Logs

1. Go to Render Dashboard
2. Click on `study-agent-backend` service
3. Scroll to **Logs** section
4. Look for:
   - ✅ `SUCCESS: Using Ollama` (or Google Gemini if Ollama unavailable)
   - ✅ Service is running

### Test Upload & Generate

```bash
BACKEND_URL="https://study-agent-backend-xxxxx.onrender.com"

# 1. Upload a PDF
curl -X POST "$BACKEND_URL/upload_pdf" \
  -F "file=@your_file.pdf"

# 2. Generate study materials
curl -X POST "$BACKEND_URL/generate_all"

# 3. Get flashcards
curl "$BACKEND_URL/flashcards"
```

---

## Frontend Integration

After backend is deployed, update frontend:

### 1. Update Frontend Environment (Vercel)

In Vercel dashboard → Project Settings → Environment Variables:

```
VITE_API_BASE_URL=https://study-agent-backend-xxxxx.onrender.com
```

Replace `xxxxx` with your actual Render URL.

### 2. Redeploy Frontend

```bash
cd /Users/yash/study_agent/frontend
git add src/api.js
git commit -m "Update API base URL for production"
git push origin main
```

Vercel will auto-redeploy. Check logs to confirm frontend can reach backend.

---

## Important Notes

### ⚠️ Ollama Not Available on Render

Render free tier containers don't support Docker daemon, so Ollama won't run.

**This is OK!** The three-tier fallback system handles it:
1. **Tier 1**: Tries Ollama → Fails
2. **Tier 2**: Falls back to Google Gemini ✅ (if GOOGLE_API_KEY set)
3. **Tier 3**: Falls back to OpenAI ✅ (if OPENAI_API_KEY set)

You should see in logs:
```
❌ Ollama Tier 1 failed: ...
✅ SUCCESS: Using Google Gemini as LLM provider
```

This is expected and correct behavior.

### ⚠️ Free Tier Cold Starts

Free tier services spin down after 15 minutes of inactivity and restart on next request (can take 30-60 seconds).

**Solution options:**
- Upgrade to **Starter** plan ($7/month) for instant start
- Keep free tier (acceptable for dev/demo)
- Use cron job to ping backend periodically

### ⚠️ FAISS Index Persistence

Files in persistent disk survive redeploys and app restarts.

**But**: If you delete the Render service, the disk is deleted too.

**Backup strategy**:
```bash
# Download FAISS index periodically
curl https://your-backend.onrender.com/get_index -o faiss_backup.tar.gz
```

(Would need to add endpoint for this in main.py if needed)

---

## Troubleshooting

### Backend stuck in "Building" state

**Solution**:
```bash
# Check if requirements.txt has issues
cd backend
pip install -r requirements.txt  # Test locally first
```

### "ModuleNotFoundError" in logs

**Solution**: Ensure requirements.txt is in `backend/` directory and dependencies are correct

```bash
cd /Users/yash/study_agent/backend
pip freeze > requirements.txt
git add requirements.txt
git commit -m "Update dependencies"
git push
```

### FAISS files not saving

**Solution**:
1. Check persistent disk is mounted
2. Verify `FAISS_INDEX_PATH=/opt/render/project/backend/outputs/faiss_index`
3. Check disk size (5GB should be enough for ~1000 PDFs)
4. Restart service from Render dashboard

### Frontend gets 503 Service Unavailable

**Solution**:
- Backend might be cold-starting (free tier)
- Wait 30-60 seconds and retry
- Check backend logs: https://render.com/dashboard
- Verify `VITE_API_BASE_URL` is correct in Vercel

### "429 Quota exceeded" from Google

**Solution**:
- Google free tier has rate limits (~60 requests/min)
- Either: pay for higher quota, or switch to OpenAI
- Or: implement request queue in frontend

---

## Performance Optimization

### For Production Use

**Recommended tier upgrade**:
- **Starter Plan ($7/month)**: Better for serious production use
  - No cold starts
  - 1GB RAM (vs 512MB free)
  - 100GB outbound/month
  - Priority support

### Reduce Cost

**Free tier is fine for**:
- MVP/Demo
- Learning
- Low traffic (<100 requests/day)

**Switch to paid for**:
- Production apps
- >500 daily requests
- Time-sensitive operations

---

## Monitoring

### Enable Logging

View logs in real-time:

```bash
# Via Render dashboard (recommended)
1. Go to render.com/dashboard
2. Click on study-agent-backend
3. Scroll to "Logs"
4. Select time range
```

### Key Log Messages to Monitor

| Message | Meaning | Action |
|---------|---------|--------|
| `✅ SUCCESS: Using Ollama` | Ollama is available (rare on Render) | ✅ Good |
| `✅ SUCCESS: Using Google Gemini` | Using Google fallback | ✅ OK (expected) |
| `✅ SUCCESS: Using OpenAI` | Using OpenAI fallback | ✅ OK (fallback) |
| `❌ All LLM providers unavailable` | No API keys set | ❌ Fix: Add GOOGLE_API_KEY |
| `Error embedding content: 429` | Rate limit exceeded | ⚠️ Upgrade Google plan |

---

## API Endpoints Reference

### Health Check
```
GET /health
```
Returns: `{"status": "ok"}`

### Upload PDF
```
POST /upload_pdf
Content-Type: multipart/form-data
Body: file=<PDF file>
```
Returns: `{"status": "ok", "chunks": <number>}`

### Generate Study Materials
```
POST /generate_all
```
Returns: `{"flashcards": <n>, "quizzes": <n>, "plan_items": <n>}`

### Get Flashcards
```
GET /flashcards
```
Returns: Array of flashcard objects

### Get Quizzes
```
GET /quizzes
```
Returns: Array of quiz objects

### Get Planner
```
GET /planner
```
Returns: Array of planner items

### Chat
```
POST /chat
Content-Type: application/json
Body: {
  "question": "Your question here",
  "chat_history": []
}
```
Returns: `{"answer": "...", "sources": [...]}`

---

## Next Steps

1. ✅ Deploy backend to Render (this guide)
2. ✅ Update frontend with backend URL
3. ✅ Deploy frontend to Vercel
4. ✅ Test full workflow
5. ✅ Monitor logs and performance
6. ✅ Scale up if needed (upgrade to Starter plan)

---

## Getting Help

- **Render Docs**: https://render.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com/deployment/
- **LangChain Docs**: https://python.langchain.com/
- **GitHub Issues**: Create issue with logs attached

