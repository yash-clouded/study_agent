# Study Agent - Deployment Checklist

Complete checklist for deploying Study Agent to production.

---

## Phase 1: Pre-Deployment (Local Testing)

### Backend Testing
- [ ] Backend runs locally: `cd backend && uvicorn main:app --reload`
- [ ] No import errors
- [ ] Health check works: `curl http://localhost:8001/health`
- [ ] Ollama running (if testing Tier 1)
- [ ] Can upload PDF: `curl -X POST http://localhost:8001/upload_pdf -F "file=@test.pdf"`
- [ ] Can generate materials: `curl -X POST http://localhost:8001/generate_all`
- [ ] FAISS index created in `./outputs/faiss_index`
- [ ] All required packages in `backend/requirements.txt`
- [ ] `.env` file exists with GOOGLE_API_KEY set

### Frontend Testing
- [ ] Frontend runs locally: `cd frontend && npm run dev`
- [ ] No build errors
- [ ] Can access: `http://localhost:5173`
- [ ] Upload panel visible
- [ ] Can upload PDF (with backend running)
- [ ] All tabs (Chat, Flashcards, Quizzes, Planner) are clickable
- [ ] `api.js` uses correct backend URL: `http://localhost:8001`
- [ ] All dependencies in `frontend/package.json`

### Integration Testing
- [ ] Upload PDF locally
- [ ] Generate materials (all 4 types)
- [ ] Navigate between tabs
- [ ] Files persist across tab switches
- [ ] Chat works with uploaded material
- [ ] Quiz displays options correctly
- [ ] No console errors (DevTools F12)
- [ ] No LangChain deprecation warnings in backend logs

---

## Phase 2: GitHub Setup

### Repository Setup
- [ ] All code committed: `git status` shows clean
- [ ] `.gitignore` includes:
  - `backend/__pycache__/`
  - `backend/.venv/`
  - `backend/outputs/`
  - `frontend/node_modules/`
  - `frontend/dist/`
  - `.env` (never commit API keys!)
- [ ] Code pushed to main: `git push origin main`
- [ ] GitHub repository is public (or private if needed)
- [ ] README.md explains the project

### Configuration Files
- [ ] `render.yaml` exists (backend deployment config)
- [ ] `frontend/vercel.json` exists (frontend deployment config)
- [ ] `backend/.env.example` exists (documentation)
- [ ] `frontend/.env.example` exists (documentation)
- [ ] `DEPLOYMENT.md` exists (this deployment guide)
- [ ] `RENDER_DEPLOYMENT.md` exists (backend guide)
- [ ] `VERCEL_DEPLOYMENT.md` exists (frontend guide)

---

## Phase 3: Backend Deployment (Render)

### Create Render Account
- [ ] Sign up at [render.com](https://render.com)
- [ ] Connect GitHub account
- [ ] GitHub repository authorized for Render

### Create Web Service
- [ ] New Web Service from GitHub
- [ ] Repository: `yash-clouded/study_agent`
- [ ] Branch: `main`
- [ ] Build Command: `cd backend && pip install -r requirements.txt`
- [ ] Start Command: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Plan: Free tier
- [ ] Region: Closest to users (e.g., us-east)
- [ ] Service deployed

### Environment Variables
- [ ] `GOOGLE_API_KEY` = your actual API key
- [ ] `OPENAI_API_KEY` = your actual API key (optional)
- [ ] `OLLAMA_MODEL` = mistral
- [ ] `OLLAMA_BASE_URL` = http://localhost:11434
- [ ] `FAISS_INDEX_PATH` = /opt/render/project/backend/outputs/faiss_index

### Persistent Disk
- [ ] Disk created: `faiss-storage`
- [ ] Size: 5GB
- [ ] Mount path: `/opt/render/project/backend/outputs`
- [ ] Disk attached to web service

### Verify Deployment
- [ ] Service URL generated (e.g., https://study-agent-backend-xxxxx.onrender.com)
- [ ] Service status: "Live"
- [ ] No build errors in logs
- [ ] Logs show: `✅ SUCCESS: Using Google Gemini`
- [ ] Health check works: `curl https://study-agent-backend-xxxxx.onrender.com/health`

### Backend URL
- [ ] Copy backend URL: `https://study-agent-backend-xxxxx.onrender.com`
- [ ] Save for next step (needed for frontend)

---

## Phase 4: Frontend Deployment (Vercel)

### Create Vercel Account
- [ ] Sign up at [vercel.com](https://vercel.com)
- [ ] Connect GitHub account
- [ ] GitHub repository authorized for Vercel

### Create Vercel Project
- [ ] New Project from GitHub
- [ ] Repository: `yash-clouded/study_agent`
- [ ] Root Directory: `frontend`
- [ ] Framework: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`

### Environment Variables
- [ ] `VITE_API_BASE_URL` = `https://study-agent-backend-xxxxx.onrender.com`
- [ ] Replace `xxxxx` with actual Render URL from Phase 3

### Deploy
- [ ] Click Deploy
- [ ] Wait for build to complete (3-5 minutes)
- [ ] Deployment successful

### Verify Deployment
- [ ] Frontend URL generated (e.g., https://study-agent-xxx.vercel.app)
- [ ] Website loads (UI visible)
- [ ] No build errors in logs
- [ ] Check network requests go to Render URL

---

## Phase 5: Integration Testing (Production)

### Backend Health
- [ ] `curl https://study-agent-backend-xxxxx.onrender.com/health` returns OK
- [ ] Logs show correct provider (Google Gemini expected)
- [ ] No errors in backend logs

### Frontend Loading
- [ ] Frontend URL loads in browser
- [ ] All UI components visible
- [ ] No console errors (DevTools F12)

### File Upload
- [ ] Click Upload tab
- [ ] Drag & drop or select PDF file
- [ ] Wait for upload (should show in File list)
- [ ] Success message appears

### Material Generation
- [ ] Click "Generate All"
- [ ] Wait for generation (30-60 seconds depending on PDF size)
- [ ] Check Render logs - should show success
- [ ] No timeout errors

### View Materials
- [ ] Flashcards tab - see generated flashcards
- [ ] Quizzes tab - see generated quizzes with proper options
- [ ] Planner tab - see study plan
- [ ] All content displays correctly

### Test Chat
- [ ] Chat tab - type question about uploaded material
- [ ] Submit question
- [ ] Chat answer appears (not None)
- [ ] Sources displayed below answer
- [ ] Conversation context maintained across messages

### File Persistence
- [ ] Upload file on Upload tab
- [ ] Navigate to Chat tab
- [ ] Navigate back to Upload tab
- [ ] File still listed (didn't disappear)

---

## Phase 6: Performance & Monitoring

### Monitor Backend
- [ ] Render dashboard shows service "Live"
- [ ] No memory errors in logs
- [ ] FAISS index saved to persistent disk
- [ ] No quota exceeded errors from Google API

### Monitor Frontend
- [ ] Vercel shows "Ready" status
- [ ] No failed deployments
- [ ] Network tab shows <3s page load

### Load Testing (Optional)
- [ ] Test with larger PDFs (>100MB)
- [ ] Test multiple file uploads
- [ ] Monitor backend response times
- [ ] Check error rates

---

## Phase 7: Documentation & Share

### Create Documentation
- [ ] User guide created
- [ ] Deployment guide updated
- [ ] Environment variable guide created
- [ ] Troubleshooting guide written

### Share with Team
- [ ] Frontend URL shared: `https://study-agent-xxx.vercel.app`
- [ ] Backend URL shared: `https://study-agent-backend-xxxxx.onrender.com`
- [ ] Documentation shared
- [ ] Team can access and test

### Setup Monitoring (Optional)
- [ ] Slack notifications for deploys
- [ ] Email alerts for errors
- [ ] Weekly health check scheduled

---

## Phase 8: Post-Deployment

### Monitor First Week
- [ ] Watch error logs daily
- [ ] Monitor API response times
- [ ] Check user feedback
- [ ] Fix any issues immediately

### Optimize if Needed
- [ ] If slow: Upgrade Render plan to Starter
- [ ] If quota issues: Implement rate limiting
- [ ] If disk full: Implement output cleanup

### Maintenance Schedule
- [ ] Weekly: Review logs and metrics
- [ ] Monthly: Update dependencies
- [ ] Quarterly: Review costs and optimize

---

## Common Issues & Fixes

### Backend won't deploy
**Problem**: Build error in Render
**Solution**:
1. Check `backend/requirements.txt` has all dependencies
2. Test locally: `pip install -r requirements.txt`
3. Fix issues, commit, push
4. Render auto-redeploys

### CORS errors
**Problem**: Frontend can't connect to backend
**Solution**:
1. Verify backend CORS middleware enabled (main.py line ~42)
2. Check `VITE_API_BASE_URL` is correct
3. Redeploy frontend after env var change

### Quota exceeded
**Problem**: Google API rate limited
**Solution**:
1. Reduce upload frequency
2. Upgrade Google Cloud plan
3. Or use OpenAI (set `OPENAI_API_KEY`)

### Cold start delay
**Problem**: First request takes 30-60s on Render free tier
**Solution**:
1. This is normal (free tier spins down after 15 min)
2. Upgrade to Starter plan ($7/month) for instant starts
3. Keep free tier for dev/demo

---

## Success Criteria

✅ **Project is successfully deployed when:**

1. ✅ Backend running on Render (health check works)
2. ✅ Frontend running on Vercel (loads in browser)
3. ✅ Frontend connects to backend (API calls succeed)
4. ✅ Can upload PDF file
5. ✅ Can generate all 4 study materials (flashcards, quizzes, planner, notes)
6. ✅ Can chat with uploaded material (answer shows, not None)
7. ✅ Files persist across tab navigation
8. ✅ No console errors or deprecation warnings
9. ✅ All tabs display content correctly
10. ✅ Production URLs are accessible to team

---

## Quick Reference

**Frontend URL**: https://study-agent-xxx.vercel.app
**Backend URL**: https://study-agent-backend-xxxxx.onrender.com
**Backend Logs**: https://render.com/dashboard → study-agent-backend → Logs
**Frontend Logs**: https://vercel.com/dashboard → study-agent-frontend → Deployments
**GitHub**: https://github.com/yash-clouded/study_agent

---

## Timeline

| Phase | Estimated Time | Notes |
|-------|-----------------|-------|
| 1. Local Testing | 30 min | Can skip if confident |
| 2. GitHub Setup | 5 min | Mostly automated |
| 3. Backend Deployment | 10-15 min | Build + deploy |
| 4. Frontend Deployment | 5-10 min | Build + deploy |
| 5. Integration Testing | 15 min | Verify all features |
| 6. Monitoring Setup | 10 min | Optional but recommended |
| **Total** | **~75 minutes** | First-time deployment |

**Subsequent deployments**: 2-3 minutes (just git push)

---

## Support & Help

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **GitHub Help**: https://docs.github.com
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **React Docs**: https://react.dev/

Good luck with deployment! 🚀
