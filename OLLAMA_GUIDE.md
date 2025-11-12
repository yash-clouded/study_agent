# Ollama Integration Guide

## Overview

Ollama allows you to run large language models locally on your machine without relying on cloud APIs. This guide explains how to set up and use Ollama with Study Agent.

## Benefits

✅ **Privacy** - Models run entirely on your machine  
✅ **Cost** - No API fees (just compute resources)  
✅ **Speed** - Low latency local inference  
✅ **Offline** - Works without internet connection  
✅ **Flexibility** - Switch between different models easily  

## Prerequisites

- macOS 11+, Windows 10+, or Linux
- 8GB+ RAM (more for larger models)
- GPU support optional but recommended

## Installation

### Step 1: Install Ollama

1. **macOS**: Download from https://ollama.ai/download
2. **Windows**: Download from https://ollama.ai/download
3. **Linux**: Run `curl https://ollama.ai/install.sh | sh`

### Step 2: Verify Installation

```bash
ollama --version
```

### Step 3: Pull a Model

```bash
# Fast model (recommended for Study Agent)
ollama pull mistral

# Other options:
ollama pull llama2         # More capable, larger
ollama pull neural-chat    # Fast and compact
ollama pull orca-mini      # Very lightweight
ollama pull starling-lm    # Strong reasoning
```

## Configuration

### Enable Ollama in Study Agent

Edit your `backend/.env` file:

```env
# Disable cloud APIs
GOOGLE_API_KEY=
OPENAI_API_KEY=

# Enable Ollama
USE_OLLAMA=true
OLLAMA_MODEL=mistral
OLLAMA_BASE_URL=http://localhost:11434
```

## Running Ollama

### Terminal 1: Start Ollama Server

```bash
ollama serve
```

Output should show:
```
time=2025-11-12T10:00:00.000Z level=INFO msg="Listening on 127.0.0.1:11434"
```

### Terminal 2: Start Study Agent Backend

```bash
cd study_agent/backend
source .venv/bin/activate
pip install ollama  # Install if not already done
uvicorn main:app --reload
```

### Terminal 3: Start Frontend

```bash
cd study_agent/frontend
npm run dev
```

## Model Selection

### Recommended Models for Study Agent

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| mistral | 7B | ⚡ Very fast | 🎯 Good | Default choice |
| neural-chat | 7B | ⚡ Very fast | 🎯 Good | Chat-focused |
| orca-mini | 3B | ⚡⚡ Fastest | 🎯 Decent | Low-end hardware |
| llama2 | 7B | ⚡ Fast | 🎯🎯 Excellent | Better quality |
| starling-lm | 7B | ⚡ Fast | 🎯🎯 Excellent | Strong reasoning |

### Pull a Different Model

```bash
ollama pull neural-chat
```

Then update `.env`:
```env
OLLAMA_MODEL=neural-chat
```

## Performance Tuning

### For Better Quality (slower)

Edit `.env`:
```env
OLLAMA_MODEL=llama2
```

Or create a custom model (see Ollama docs).

### For Faster Speed (lower quality)

```env
OLLAMA_MODEL=orca-mini
```

### GPU Acceleration

Ollama automatically uses GPU if available:

**macOS**: Works out of the box with Apple Silicon  
**NVIDIA**: Ensure CUDA drivers installed  
**AMD**: Use `ROCM_VISIBLE_DEVICES` environment variable

## Troubleshooting

### "Cannot connect to Ollama"

```bash
# Check if Ollama is running
curl http://localhost:11434/api/tags

# If error: start Ollama
ollama serve

# Check if model exists
ollama list
```

### "Model not found"

```bash
# Pull the model
ollama pull mistral

# Verify
ollama list
```

### Slow Generation

1. Check CPU/GPU usage: `top` or Task Manager
2. Try smaller model: `orca-mini`
3. Increase OLLAMA_NUM_PREDICT in code
4. Check available RAM

### High Memory Usage

Switch to smaller model:
```bash
ollama pull orca-mini
# Update .env: OLLAMA_MODEL=orca-mini
```

## Advanced Configuration

### Custom Model Parameters

Edit `backend/utils/ollama_llm.py`:

```python
num_predict: int = 2048        # Max tokens
temperature: float = 0.1       # Lower = more focused
top_p: float = 0.95           # Nucleus sampling
top_k: int = 40               # Top-K sampling
```

### Running on Remote Server

Change `OLLAMA_BASE_URL`:

```env
OLLAMA_BASE_URL=http://your-server-ip:11434
```

Make sure Ollama server is listening on all interfaces:
```bash
ollama serve --host 0.0.0.0:11434
```

## Comparing Providers

### Ollama (Local)
- Privacy: ✅ Perfect
- Cost: ✅ Free (compute only)
- Speed: ⚡⚡ Low latency
- Quality: 🎯 Good (depends on model)
- Requires: Local GPU/CPU

### Google Gemini (Cloud)
- Privacy: ⚠️ Data sent to Google
- Cost: 💰 Very cheap (~$0.075/1M tokens)
- Speed: ⚡ Moderate latency
- Quality: 🎯🎯 Excellent
- Requires: Internet + API key

### OpenAI (Cloud)
- Privacy: ⚠️ Data sent to OpenAI
- Cost: 💰💰 Higher (~$0.50/1M tokens)
- Speed: ⚡ Moderate latency
- Quality: 🎯🎯🎯 Best
- Requires: Internet + API key

## Switching Between Providers

### To Ollama
```env
USE_OLLAMA=true
GOOGLE_API_KEY=
OPENAI_API_KEY=
```

### To Google Gemini
```env
USE_OLLAMA=false
GOOGLE_API_KEY=your_key
OPENAI_API_KEY=
```

### To OpenAI
```env
USE_OLLAMA=false
GOOGLE_API_KEY=
OPENAI_API_KEY=your_key
```

## System Requirements

### Minimum
- CPU: 4 cores
- RAM: 8GB
- Storage: 5GB (for 1-2 models)

### Recommended
- CPU: 8+ cores
- RAM: 16GB+
- GPU: NVIDIA/AMD/Apple Silicon
- Storage: 20GB+ (for multiple models)

### Ideal
- CPU: 16+ cores
- RAM: 32GB+
- GPU: RTX 3080 or better
- Storage: 50GB+

## Tips & Tricks

1. **Pre-load model** - Keep frequently used model in memory:
   ```bash
   ollama pull mistral
   ```

2. **Monitor Ollama** - Check memory usage:
   ```bash
   ollama ps
   ```

3. **Unload model** - Free up memory:
   ```bash
   ollama stop mistral
   ```

4. **Custom models** - Create custom Modelfile for specific behaviors

5. **Batch operations** - Process multiple requests efficiently

## Support

- Ollama Docs: https://github.com/ollama/ollama
- Model Library: https://ollama.ai/library
- Community: GitHub Discussions

## Next Steps

1. Install Ollama
2. Pull a model
3. Update `.env` with `USE_OLLAMA=true`
4. Start Ollama server: `ollama serve`
5. Start Study Agent backend and frontend
6. Use as normal - your data never leaves your machine!
