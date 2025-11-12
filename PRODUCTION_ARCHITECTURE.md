# Study Agent - Production Architecture

Complete architecture and deployment overview for Study Agent.

---

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USERS (Internet)                                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    HTTPS (TLS/SSL) │
                                    ↓
        ┌──────────────────────────────────────────────────┐
        │         VERCEL CDN (Global Edge Network)         │
        │  - Automatic HTTPS/SSL                           │
        │  - Global caching & distribution                 │
        │  - Auto-deploys on git push                       │
        └──────────────────────────────────────────────────┘
                          ↓
        ┌──────────────────────────────────────────────────┐
        │    FRONTEND (React + Vite + Axios)               │
        │  - Port: 3000 (production)                        │
        │  - Port: 5173 (dev)                              │
        │  - URL: https://study-agent-xxx.vercel.app       │
        │                                                   │
        │  Components:                                      │
        │  ├─ Upload Panel (drag-drop PDF)                │
        │  ├─ Chat (RAG-based Q&A)                        │
        │  ├─ Flashcards (generated study cards)          │
        │  ├─ Quizzes (MCQ with feedback)                 │
        │  └─ Planner (study schedule)                    │
        │                                                   │
        │  State Management:                               │
        │  ├─ files[] (App.jsx parent)                    │
        │  ├─ activeTab (App.jsx)                         │
        │  └─ Component-level state (Chat, etc)           │
        └──────────────────────────────────────────────────┘
                          │
                   HTTPS  │  Axios
                          │  baseURL: VITE_API_BASE_URL
                          ↓
        ┌──────────────────────────────────────────────────┐
        │   RENDER Web Service (FastAPI Backend)           │
        │  - Port: 8001                                    │
        │  - URL: https://study-agent-backend-xxx         │
        │  - Plan: Free (or Starter for better perf)      │
        │  - Health check: /health                        │
        │                                                   │
        │  Endpoints:                                      │
        │  ├─ POST /upload_pdf ──────────────┐           │
        │  ├─ POST /generate_all ────────────┼──→ │       │
        │  ├─ GET  /flashcards               │   FAISS    │
        │  ├─ GET  /quizzes                  │   Vector   │
        │  ├─ GET  /planner                  │   Store   │
        │  └─ POST /chat ────────────────────┤            │
        │                                     │            │
        │  Three-Tier LLM Provider System:   │            │
        │  ├─ Tier 1: Ollama (local)  FAILS  │            │
        │  ├─ Tier 2: Google Gemini  ✅ ACTIVE│ Persists   │
        │  └─ Tier 3: OpenAI (fallback)      │ on Disk   │
        │                                     │            │
        │  Three-Tier Embeddings System:    │            │
        │  ├─ Tier 1: Ollama FAILS           │            │
        │  ├─ Tier 2: Google GenAI  ✅      │            │
        │  └─ Tier 3: OpenAI (fallback)      │            │
        └──────────────────────────────────────────────────┘
                          │
            ┌─────────────┼─────────────┐
            │             │             │
            ↓             ↓             ↓
        ┌────────┐  ┌──────────┐  ┌────────────┐
        │ LangChain    │ Google Cloud   │ OpenAI API
        │ Framework    │ (Gemini 2.5)   │ (gpt-4o-mini)
        │              │ + Embeddings   │
        │              │ (models/...)   │
        └────────┘  └──────────┘  └────────────┘
            │             │             │
            └─────────────┼─────────────┘
                          ↓
        ┌──────────────────────────────────────────────────┐
        │        RENDER Persistent Disk (/outputs)         │
        │                                                   │
        │  Content persists across:                        │
        │  ├─ App restarts                               │
        │  ├─ Redeploys                                   │
        │  ├─ Service crashes                            │
        │                                                   │
        │  Stores:                                         │
        │  ├─ FAISS Index (vector embeddings)            │
        │  ├─ flashcards.json                            │
        │  ├─ quizzes.json                               │
        │  ├─ planner.json                               │
        │  ├─ reader_summary.json                        │
        │  └─ PDF files (uploaded)                       │
        │                                                   │
        │  Size: 5GB (configurable)                       │
        │  Mount path: /opt/render/project/               │
        │             backend/outputs                     │
        └──────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                      DATA FLOW EXAMPLES                                  │
└─────────────────────────────────────────────────────────────────────────┘

1. PDF Upload Flow:
   User → Frontend (Upload) → Backend (/upload_pdf)
   → Read PDF (PyMuPDF)
   → Split into chunks (CharacterTextSplitter)
   → Create embeddings (Google GenAI Embeddings - Tier 2)
   → Build FAISS index
   → Save to persistent disk (/outputs/faiss_index/)
   ✅ Ready for search

2. Study Materials Generation:
   User → Frontend (Generate All) → Backend (/generate_all)
   → Load FAISS index
   → Retrieve chunks
   → Generate flashcards (Google Gemini - Tier 2)
   → Generate quizzes (Google Gemini - Tier 2)
   → Generate planner (deterministic)
   → Save JSON files to persistent disk
   ✅ Materials available in tabs

3. Chat with RAG:
   User → Frontend (Chat tab) → Backend (/chat)
   → Load FAISS index
   → Retrieve top-3 relevant chunks (vector similarity)
   → Format into context with chat history
   → Send to Google Gemini (Tier 2)
   → Get response + sources
   ✅ Answer returned to frontend

4. Auto-Redeploy on Code Change:
   Developer → git push origin main
   → GitHub webhook
   → Render/Vercel receives trigger
   → Build: npm install, npm run build (frontend)
             pip install, ready to serve (backend)
   → Deploy: New version live in 2-5 minutes
   ✅ No manual intervention needed
```

---

## Technology Stack

### Frontend
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | React 18 | UI library |
| Build Tool | Vite | Fast development & optimized builds |
| HTTP Client | Axios | API calls with interceptors |
| Styling | CSS3 | Component styles |
| State | React hooks | Local & parent state management |
| Hosting | Vercel | Global CDN + auto-deploy |

### Backend
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | FastAPI | Modern async Python web framework |
| Server | Uvicorn | ASGI application server |
| LLM Framework | LangChain 1.0.5 | Orchestrate LLM workflows |
| LLM Providers | Ollama, Google Gemini, OpenAI | Generation & embedding |
| Vector Store | FAISS | Similarity search on embeddings |
| PDF Parsing | PyMuPDF | Extract text from PDFs |
| Chunking | LangChain TextSplitters | Create semantic chunks |
| Hosting | Render | FastAPI deployment platform |

### Storage
| Component | Technology | Purpose |
|-----------|-----------|---------|
| Vector Index | FAISS (in-memory + disk) | Semantic similarity search |
| Persistent Disk | Render Disks (5GB) | FAISS index + outputs |
| Output Files | JSON | Flashcards, quizzes, planner |

---

## Deployment Topology

```
┌─ VERCEL (Frontend) ─┐
│                     │
│  study-agent-xxx    │ Public URL
│  .vercel.app        │ HTTPS enabled
│                     │ Global CDN
└─────────────────────┘
          ↕
       HTTPS
         ↕
┌─ RENDER (Backend) ──────────────────────────────┐
│                                                   │
│  Web Service: study-agent-backend                │
│  Region: us-east (or your choice)                │
│  Plan: Free (or Starter $7/month)               │
│  Python: 3.11                                    │
│                                                   │
│  Connected to:                                   │
│  ├─ Persistent Disk: faiss-storage (5GB)        │
│  ├─ Environment: 6 variables                    │
│  └─ Network: Public HTTPS endpoint              │
│                                                   │
└─────────────────────────────────────────────────┘
          ↕
    HTTPS to APIs
         ↕
┌─────────────────────────────────────────────────┐
│  External Services (Auto-Failover)              │
│                                                   │
│  Tier 1: Ollama (FAILS on Render - no Docker)  │
│  Tier 2: Google Gemini (ACTIVE)                │
│  Tier 3: OpenAI (Standby)                      │
│                                                   │
└─────────────────────────────────────────────────┘
```

---

## Three-Tier Provider System

### Why Three Tiers?

**Problem**: Single provider dependency
- If Ollama fails → entire app fails
- If Google quota exceeded → entire app fails
- If OpenAI rate limited → entire app fails

**Solution**: Automatic fallback chain with logging

### Tier Configuration

```python
# From main.py (lines 65-103)

Tier 1: Ollama (PRIMARY)
├─ Why: Local, free, zero API costs
├─ LLM: OllamaLLM (mistral 7B)
├─ Embeddings: OllamaEmbeddings
├─ Status on Render: ❌ FAILS (no Docker)
└─ Cost: $0

        ↓ (if Tier 1 fails)

Tier 2: Google Gemini (SECONDARY)
├─ Why: Cheap, free tier available (60 req/min)
├─ LLM: ChatGoogleGenerativeAI (gemini-2.5-flash)
├─ Embeddings: GoogleGenerativeAIEmbeddings
├─ Status on Render: ✅ ACTIVE
└─ Cost: $0.075/million tokens (or free tier)

        ↓ (if Tier 2 fails)

Tier 3: OpenAI (TERTIARY)
├─ Why: Reliable, high-quality models
├─ LLM: ChatOpenAI (gpt-4o-mini)
├─ Embeddings: OpenAIEmbeddings
├─ Status on Render: ✅ Available
└─ Cost: ~$0.15/1K input tokens
```

### Log Output Example

**Local Development** (with Ollama running):
```
✅ SUCCESS: Using Ollama as LLM provider with model: mistral
📊 Embedding Model: OllamaEmbeddings (local, zero quota cost!)
```

**Render Production** (Ollama fails, falls back):
```
❌ Ollama Tier 1 failed: Connection refused
✅ SUCCESS: Using Google Gemini as LLM provider
📊 Embedding Model: GoogleGenerativeAIEmbeddings
```

---

## Performance Characteristics

### Frontend
| Metric | Value | Notes |
|--------|-------|-------|
| Build time | 1-2 min | Vite is fast |
| Page load | <3s | Global CDN |
| Cold start | instant | No server to start |
| Bundle size | ~500KB | Gzip compressed |
| Deployments | unlimited | Auto on git push |

### Backend
| Metric | Value | Notes |
|--------|-------|-------|
| Build time | 3-5 min | Pip install |
| Cold start | 30-60s | Free tier spins down |
| Startup time | 2-5s | FastAPI boot |
| Request timeout | 5 min | For generation |
| Concurrent requests | ~10-50 | Free tier limit |

### Generation Times (Approximate)
| Task | Duration | Provider |
|------|----------|----------|
| Upload PDF | 1-5s | Depends on file size |
| Create embeddings | 5-30s | Google GenAI |
| Generate flashcards | 10-30s | Google Gemini |
| Generate quizzes | 10-30s | Google Gemini |
| Generate planner | 2-5s | Deterministic |
| Chat response | 5-15s | Google Gemini + retrieval |
| **Total first run** | **30-90s** | Includes all above |

---

## Scaling Considerations

### Current Capacity (Free Tier)

```
Users: 1-10 concurrent
Files: ~100 PDFs (5GB disk)
Requests: ~1,000 daily
Cost: $0-5/month
```

### If You Need to Scale

**Option 1: Stay Free (Limited)**
- Monitor Render cold starts
- Monitor Google API quota
- Limit concurrent users to <5

**Option 2: Upgrade Render Plan ($7/month)**
- Starter plan (512MB RAM, no cold starts)
- Instant response times
- Better reliability

**Option 3: Enterprise Scale**
- Larger persistent disk (need more data)
- Dedicated database (if user management needed)
- Multiple backend instances (load balancing)
- Advanced monitoring & logging
- Estimated cost: $50-200+/month

---

## Security Considerations

### Current Setup

| Layer | Security | Notes |
|-------|----------|-------|
| Transport | HTTPS/TLS | Vercel & Render auto-managed |
| API Keys | Environment variables | Never in git |
| CORS | Enabled | Allows Vercel → Render |
| File upload | No validation | ⚠️ Consider adding |
| Database | None | Stateless design |

### Recommended for Production

1. ✅ API key rotation (quarterly)
2. ✅ Rate limiting (prevent abuse)
3. ✅ Input validation (sanitize uploads)
4. ✅ Audit logging (track user actions)
5. ✅ Backup strategy (persist disk backups)

---

## Cost Breakdown

### Monthly Costs (Estimated)

| Service | Plan | Cost | Notes |
|---------|------|------|-------|
| Vercel | Free | $0 | Unlimited deploys, 100GB/mo bandwidth |
| Render | Free | $0 | Hobby tier, okay for MVP |
| Google Gemini | Free tier | $0 | 60 requests/min, free tier |
| OpenAI | N/A (fallback) | $0 | Only if Google fails frequently |
| **Total** | | **$0** | Completely free MVP! |

### If Upgrading

| Service | Plan | Cost | Reason |
|---------|------|------|--------|
| Vercel | Pro | $20 | If >100GB bandwidth/month |
| Render | Starter | $7 | No cold starts, better perf |
| Google | Paid | $0.001-0.1 | If quota exceeded |
| **Total** | | **$27+** | Production-ready |

---

## Monitoring & Observability

### What to Monitor

**Frontend (Vercel)**
- Build success/failure
- Page load times
- Error rate
- User sessions

**Backend (Render)**
- Service status
- Response times
- Error rate
- API quota usage
- Disk space

### How to Monitor

**Vercel Dashboard**
```
https://vercel.com/dashboard
├─ Deployments (success/fail)
├─ Analytics (page views, errors)
└─ Function logs (API responses)
```

**Render Dashboard**
```
https://render.com/dashboard
├─ Service status (Live/Down)
├─ CPU/Memory usage
├─ Logs (real-time)
├─ Disk usage
└─ Bandwidth usage
```

---

## Disaster Recovery

### Data Loss Scenarios

| Scenario | Risk | Mitigation |
|----------|------|-----------|
| FAISS index deleted | Medium | Regenerate from PDF |
| PDF files deleted | Low | Reupload PDF |
| Render service deleted | High | Backup disk to local |
| Google API key leaked | High | Rotate key immediately |
| GitHub repo deleted | Medium | Clone from backup |

### Backup Strategy

```bash
# Backup FAISS index weekly
aws s3 cp /opt/render/project/backend/outputs s3://backup-bucket/ --recursive

# Alternative: Render -> Local
rsync -avz render:/opt/render/outputs local-backup/
```

---

## Deployment Checklist

See `DEPLOYMENT_CHECKLIST.md` for complete 8-phase checklist.

---

## Documentation Files

| File | Purpose |
|------|---------|
| `DEPLOYMENT.md` | Complete deployment guide |
| `RENDER_DEPLOYMENT.md` | Render-specific instructions |
| `VERCEL_DEPLOYMENT.md` | Vercel-specific instructions |
| `DEPLOYMENT_CHECKLIST.md` | Step-by-step checklist |
| `QUICK_DEPLOY.md` | Quick copy-paste commands |
| `PRODUCTION_ARCHITECTURE.md` | This file |

---

## Success Metrics

✅ **Project is production-ready when:**

1. ✅ Frontend deployed on Vercel
2. ✅ Backend deployed on Render
3. ✅ Both connected and working
4. ✅ All features functional
5. ✅ <3s frontend load time
6. ✅ <15s backend response time
7. ✅ $0/month cost (free tier)
8. ✅ Auto-deploy on git push working
9. ✅ Monitoring dashboard configured
10. ✅ Team can access and use

---

**Deployed successfully! 🚀**

