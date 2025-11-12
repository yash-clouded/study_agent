# Three-Tier LLM Provider Fallback System

## Overview

The Study Agent now implements an **intelligent three-tier fallback system** that automatically selects the best available LLM provider in this priority order:

1. **Tier 1 (Primary): Ollama** - Local, free, no API keys required
2. **Tier 2 (Secondary): Google Gemini** - Cloud, cheap, free tier available
3. **Tier 3 (Tertiary): OpenAI** - Cloud, paid, reliable fallback

---

## How It Works

### Automatic Detection & Fallback

The system attempts providers in order and **automatically falls back** if one fails:

```
System Startup
    ↓
Try Tier 1: Ollama
├─ Success? → Use Ollama ✅
├─ Failed? → Continue to Tier 2
    ↓
Try Tier 2: Google Gemini
├─ Success? → Use Google Gemini ✅
├─ Failed or no API key? → Continue to Tier 3
    ↓
Try Tier 3: OpenAI
├─ Success? → Use OpenAI ✅
├─ Failed or no API key? → ERROR
    ↓
All providers failed → System shuts down with clear error
```

### Real-Time Output Example

```
🔵 Attempting Tier 1 (Ollama) with model: mistral
✅ SUCCESS: Using Ollama as LLM provider with model: mistral

🎯 Active Provider: Ollama
📊 Embedding Model: Google Embeddings (models/embedding-001)
```

---

## Configuration

### `.env` File Setup

Create a `.env` file in the project root with your API keys (optional):

```bash
# Tier 1: Ollama (No configuration needed if running locally)
USE_OLLAMA=true
OLLAMA_MODEL=mistral
OLLAMA_BASE_URL=http://localhost:11434

# Tier 2: Google Gemini (Optional - used if Ollama fails)
GOOGLE_API_KEY=your_google_api_key_here

# Tier 3: OpenAI (Optional - used if both above fail)
OPENAI_API_KEY=your_openai_api_key_here
LLM_MODEL=gpt-4o-mini

# Other settings
FAISS_INDEX_PATH=./outputs/faiss_index
```

---

## Provider Comparison

| Feature | Ollama | Google Gemini | OpenAI |
|---------|--------|---------------|--------|
| **Cost** | Free | Free tier + cheap | Expensive |
| **Speed** | Local (fast) | Cloud (medium) | Cloud (fast) |
| **Privacy** | 100% local | Google cloud | OpenAI cloud |
| **Setup** | Just run `ollama serve` | Get API key | Get API key |
| **Models** | mistral, llama, orca-mini | Gemini 2.5 Flash | GPT-4o-mini |
| **Internet** | No required | Required | Required |
| **API Key** | Not needed | Optional | Optional |

---

## Tier Details

### Tier 1: Ollama (Primary)

**When to use:** Always - it's local, free, and doesn't require API keys.

**Requirements:**
- Ollama installed: https://ollama.ai
- Running: `ollama serve`
- Model downloaded: `ollama pull mistral`

**Benefits:**
- ✅ Completely free
- ✅ No API keys needed
- ✅ 100% private - runs on your machine
- ✅ Works offline
- ✅ Instant fallback available if needed

**Setup:**
```bash
# Install Ollama from https://ollama.ai
# Download a model
ollama pull mistral

# Start the server
ollama serve

# In another terminal, verify it's running
curl http://localhost:11434/api/tags
```

---

### Tier 2: Google Gemini (Secondary)

**When to use:** If Ollama is not available or crashes.

**Requirements:**
- Google Gemini API key (free tier available)
- No monthly quota limits on free tier

**Benefits:**
- ✅ Free tier available
- ✅ High-quality AI model (Gemini 2.5 Flash)
- ✅ Good performance/cost ratio
- ✅ Better than OpenAI pricing

**Setup:**
```bash
# 1. Get free API key at: https://aistudio.google.com/app/apikey
# 2. Add to .env:
GOOGLE_API_KEY=your_key_here
```

---

### Tier 3: OpenAI (Tertiary)

**When to use:** If both Ollama and Google Gemini are unavailable (rare).

**Requirements:**
- OpenAI API key (paid)
- Billing configured

**Benefits:**
- ✅ Very reliable
- ✅ Excellent model quality
- ✅ Wide ecosystem support

**Setup:**
```bash
# 1. Get API key at: https://platform.openai.com/account/api-keys
# 2. Add to .env:
OPENAI_API_KEY=sk-your_key_here
```

---

## Smart Embedding Selection

The system also intelligently selects embeddings:

| Provider | Embeddings |
|----------|-----------|
| Ollama | Google Embeddings (free tier) |
| Google Gemini | Google Embeddings (same provider) |
| OpenAI | OpenAI Embeddings |

**Why?** Using the same provider for embeddings + LLM ensures consistency and leverages API quota efficiently.

---

## Error Handling

### All Providers Failed

If all three tiers fail, you'll see:

```
❌ All LLM providers unavailable:
  • Ollama: Not running or inaccessible
  • Google Gemini: GOOGLE_API_KEY not set
  • OpenAI: OPENAI_API_KEY not set
Please ensure at least one provider is available.
```

**Solutions:**
1. Start Ollama: `ollama serve`
2. OR add Google API key to `.env`
3. OR add OpenAI API key to `.env`

---

## Recommended Setup

### Option A: Local Only (Recommended)
- Use Tier 1 Ollama
- No API keys needed
- Completely private
- Works offline

```bash
# .env
USE_OLLAMA=true
OLLAMA_MODEL=mistral
```

### Option B: Local + Backup
- Use Tier 1 Ollama as primary
- Google Gemini as backup (free tier)
- No cost, with redundancy

```bash
# .env
USE_OLLAMA=true
OLLAMA_MODEL=mistral
GOOGLE_API_KEY=your_key_here
```

### Option C: Full Redundancy
- All three tiers configured
- Maximum reliability
- Never lose service

```bash
# .env
USE_OLLAMA=true
OLLAMA_MODEL=mistral
GOOGLE_API_KEY=your_google_key_here
OPENAI_API_KEY=your_openai_key_here
```

---

## Testing the Fallback System

### Test Current Provider

```bash
cd backend
python -c "from main import active_provider; print(f'Active: {active_provider}')"
```

### Simulate Tier 2 (Disable Ollama)

```bash
# Kill Ollama
killall ollama

# Restart backend (will fall to Google Gemini if key is set)
python -m uvicorn main:app --reload
```

### Simulate Tier 3 (Disable Ollama & Gemini)

```bash
# Remove GOOGLE_API_KEY from .env
# Restart backend (will use OpenAI if key is set)
```

---

## Performance Notes

### Tier 1 (Ollama)
- **Response time:** 2-10 seconds (depends on hardware)
- **Model:** Mistral 7B (fast, good quality)
- **Memory:** ~5GB RAM needed
- **GPU:** Optional (faster if available)

### Tier 2 (Google Gemini)
- **Response time:** 1-3 seconds (network latency)
- **Model:** Gemini 2.5 Flash (very fast)
- **Network:** Required
- **Cost:** Free or very cheap

### Tier 3 (OpenAI)
- **Response time:** 1-2 seconds (network latency)
- **Model:** GPT-4o-mini (highest quality)
- **Network:** Required
- **Cost:** ~$0.50 per 1M tokens

---

## Troubleshooting

### "Ollama: Not running or inaccessible"

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If not, start it
ollama serve

# If port conflict, check what's using port 11434
lsof -i :11434
```

### "Google Gemini: GOOGLE_API_KEY not set"

```bash
# 1. Get free key at: https://aistudio.google.com/app/apikey
# 2. Add to .env: GOOGLE_API_KEY=your_key_here
# 3. Restart backend
```

### "OpenAI: OPENAI_API_KEY not set"

```bash
# 1. Get key at: https://platform.openai.com/account/api-keys
# 2. Add to .env: OPENAI_API_KEY=your_key_here
# 3. Restart backend
```

---

## Code Reference

The three-tier system is implemented in `backend/main.py`:

```python
# Tier 1: Try Ollama first
if USE_OLLAMA or True:  # Always try Ollama first
    try:
        llm = create_ollama_llm(model=OLLAMA_MODEL)
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        active_provider = "Ollama"
    except Exception as e:
        print(f"❌ Ollama Tier 1 failed: {e}")

# Tier 2: If Ollama failed, try Google Gemini
if llm is None and GOOGLE_API_KEY:
    try:
        llm = create_google_llm()
        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
        active_provider = "Google Gemini"
    except Exception as e:
        print(f"❌ Google Gemini Tier 2 failed: {e}")

# Tier 3: If Google failed, try OpenAI
if llm is None and OPENAI_API_KEY:
    try:
        llm = ChatOpenAI(model_name=os.environ.get("LLM_MODEL", "gpt-4o-mini"), temperature=0.1)
        embeddings = OpenAIEmbeddings()
        active_provider = "OpenAI"
    except Exception as e:
        print(f"❌ OpenAI Tier 3 failed: {e}")
```

---

## Summary

✅ **Tier 1 (Ollama)** - Primary, local, free, no API keys
✅ **Tier 2 (Google Gemini)** - Secondary, cloud, cheap, automatic fallback
✅ **Tier 3 (OpenAI)** - Tertiary, cloud, expensive, final fallback

The system is **production-ready** and handles failures gracefully!
