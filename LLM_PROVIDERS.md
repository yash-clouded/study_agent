# LLM Provider Guide - Study Agent

Your Study Agent supports multiple LLM (Large Language Model) providers. Choose the one that best fits your needs!

## Quick Comparison

| Provider | Setup | Cost | Privacy | Quality | Speed |
|----------|-------|------|---------|---------|-------|
| **Ollama** | 🟢 Easy | 💚 Free | 🟢 100% | 🟡 Good | 🟡 Fast |
| **Google Gemini** | 🟢 Easy | 💚 Very Cheap | 🟠 Cloud | 🟢🟢 Great | 🟡 Fast |
| **OpenAI** | 🟢 Easy | 💛 Expensive | 🟠 Cloud | 🟢🟢🟢 Best | 🟡 Fast |

## Provider Details

### 1. Ollama (Recommended for Privacy)

**Best For**: Privacy-conscious users, offline use, learning environments

```env
USE_OLLAMA=true
OLLAMA_MODEL=mistral
```

**Pros**:
- ✅ Completely free (no API costs)
- ✅ 100% private - data never leaves your machine
- ✅ Works offline (after initial model download)
- ✅ Choose from many models
- ✅ Perfect for learning/experimentation

**Cons**:
- ❌ Requires local hardware (GPU/CPU)
- ❌ Slower than cloud models
- ❌ Setup takes more time

**Setup Time**: 10-15 minutes

**Recommended Models**:
- `mistral` (7B) - Fast & capable
- `neural-chat` (7B) - Great for chat
- `llama2` (7B) - High quality
- `orca-mini` (3B) - Very lightweight

**See Also**: `OLLAMA_GUIDE.md`

---

### 2. Google Gemini (Recommended for Value)

**Best For**: Great quality at low cost, general use

```env
GOOGLE_API_KEY=your_key_here
USE_OLLAMA=false
```

**Pros**:
- ✅ Very cheap (~$0.075 per 1M tokens)
- ✅ Excellent quality (Gemini 2.5 Flash)
- ✅ Fast inference
- ✅ No local hardware needed
- ✅ Easy to get started

**Cons**:
- ❌ Requires internet connection
- ❌ Data sent to Google
- ❌ Need API key

**Setup Time**: 5 minutes

**Get API Key**: https://aistudio.google.com/app/apikey

**Cost Estimate**:
- 1,000 flashcards: ~$0.02
- 1,000 quizzes: ~$0.02
- Very affordable!

---

### 3. OpenAI (Best Quality)

**Best For**: Highest quality output, premium use cases

```env
OPENAI_API_KEY=your_key_here
USE_OLLAMA=false
GOOGLE_API_KEY=
```

**Pros**:
- ✅ Highest quality responses
- ✅ Most capable model
- ✅ Excellent for complex reasoning
- ✅ Wide language support
- ✅ Mature API

**Cons**:
- ❌ Most expensive (~$0.50 per 1M tokens)
- ❌ Requires internet connection
- ❌ Data sent to OpenAI
- ❌ Need API key

**Setup Time**: 5 minutes

**Get API Key**: https://platform.openai.com/api-keys

**Cost Estimate**:
- 1,000 flashcards: ~$0.50
- 1,000 quizzes: ~$0.50
- Can add up with frequent use

---

## Decision Tree

```
Do you want complete privacy?
├─ YES → Use Ollama
│        ├─ Have powerful GPU? → mistral or llama2
│        └─ Limited hardware? → orca-mini
│
└─ NO (Cloud is OK?)
   ├─ Want best value? → Google Gemini
   │                     └─ Get key from aistudio.google.com
   │
   └─ Want best quality? → OpenAI
                          └─ Get key from platform.openai.com
```

## Configuration Examples

### Example 1: Maximum Privacy
```env
# .env file
USE_OLLAMA=true
OLLAMA_MODEL=mistral
GOOGLE_API_KEY=
OPENAI_API_KEY=
```

### Example 2: Best Value
```env
# .env file
USE_OLLAMA=false
GOOGLE_API_KEY=AIzaSy...
OLLAMA_MODEL=mistral
OPENAI_API_KEY=
```

### Example 3: Best Quality
```env
# .env file
USE_OLLAMA=false
OPENAI_API_KEY=sk-proj-...
GOOGLE_API_KEY=
OLLAMA_MODEL=
```

### Example 4: With Fallback
```env
# .env file - tries Ollama first, falls back to Gemini
USE_OLLAMA=true
OLLAMA_MODEL=mistral
GOOGLE_API_KEY=AIzaSy...
OPENAI_API_KEY=
```

## Switching Providers

### Switch from Gemini to Ollama

1. Install Ollama: https://ollama.ai
2. Start Ollama: `ollama serve`
3. Edit `.env`:
   ```env
   USE_OLLAMA=true
   ```
4. Restart backend: `uvicorn main:app --reload`

### Switch from Ollama to Gemini

1. Edit `.env`:
   ```env
   USE_OLLAMA=false
   GOOGLE_API_KEY=your_key
   ```
2. Restart backend

### Switch from Gemini to OpenAI

1. Edit `.env`:
   ```env
   GOOGLE_API_KEY=
   OPENAI_API_KEY=your_key
   ```
2. Restart backend

## Cost Analysis

### Daily Usage Example
Generating 100 flashcards + 50 quizzes daily:

| Provider | Daily Cost | Monthly | Yearly |
|----------|-----------|---------|--------|
| Ollama | ~$0 | ~$0 | ~$0 |
| Gemini | ~$0.15 | ~$4.50 | ~$55 |
| OpenAI | ~$0.75 | ~$22.50 | ~$275 |

*Costs estimated based on token usage*

## Performance Comparison

### Generation Speed (Response time)

| Task | Ollama | Gemini | OpenAI |
|------|--------|--------|--------|
| 10 Flashcards | 30s | 3s | 2s |
| 5 Quizzes | 20s | 2s | 1s |
| Chat Response | 2-5s | <1s | <1s |

*Times vary by hardware and model*

## Quality Comparison

### Response Quality

| Dimension | Ollama | Gemini | OpenAI |
|-----------|--------|--------|--------|
| Accuracy | 🟡🟡 | 🟢🟢 | 🟢🟢🟢 |
| Clarity | 🟡🟡 | 🟢🟢 | 🟢🟢🟢 |
| Consistency | 🟡 | 🟢🟢 | 🟢🟢🟢 |
| Reasoning | 🟡 | 🟢🟢 | 🟢🟢🟢 |

## Setup Requirements

### Ollama
```bash
# macOS
Download from https://ollama.ai

# Linux
curl https://ollama.ai/install.sh | sh

# Windows
Download from https://ollama.ai
```

### Google Gemini
```bash
# 1. Get API key: https://aistudio.google.com/app/apikey
# 2. Add to .env: GOOGLE_API_KEY=your_key
# Done!
```

### OpenAI
```bash
# 1. Get API key: https://platform.openai.com/api-keys
# 2. Add to .env: OPENAI_API_KEY=your_key
# Done!
```

## Troubleshooting

### "LLM not working"

Check which provider is active:
```bash
# Look at backend startup logs
# Should show: "***Using [Provider] as LLM provider"
```

### Ollama Issues
See: `OLLAMA_GUIDE.md`

### API Key Issues
See: `README.md` → Troubleshooting

### Slow Responses

**With Ollama**:
- Try smaller model: `orca-mini`
- Check GPU usage: `ollama ps`
- Increase RAM

**With Gemini/OpenAI**:
- Check internet connection
- Retry request
- Contact provider support

## FAQ

**Q: Which should I use?**  
A: Start with Google Gemini (easy + cheap). Use Ollama if privacy is critical.

**Q: Can I use multiple providers?**  
A: Yes! Set multiple keys and Study Agent picks the enabled one.

**Q: What if Ollama is down?**  
A: It automatically falls back to Gemini or OpenAI if you have keys set.

**Q: How do I delete my data from the cloud?**  
A: Ollama is the only provider that keeps data local.

**Q: Which is fastest?**  
A: OpenAI, but Ollama is close on modern hardware.

**Q: Do I need a GPU?**  
A: Not required for Ollama, but recommended for speed.

## Resources

- **Ollama**: https://ollama.ai
- **Google Gemini**: https://aistudio.google.com
- **OpenAI**: https://openai.com
- **Study Agent Docs**: See README.md

## Summary

| Need | Provider |
|------|----------|
| Privacy | Ollama |
| Value | Google Gemini |
| Quality | OpenAI |
| Learning | Ollama |
| Production | Google Gemini or OpenAI |
| Offline | Ollama |

---

**Recommendation**: Start with **Google Gemini** for best value, switch to **Ollama** if privacy matters.
