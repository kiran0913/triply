# Ollama Setup – 100% Free Local AI

## Zero-Cost AI Architecture

```
1. Cache (fastest, free)  → return if hit
2. Local Ollama           → only AI backend (no OpenAI)
```

All AI features use **Ollama only**. No API keys or paid services.

---

## Installation

### macOS / Linux

```bash
curl https://ollama.ai/install.sh | sh
```

### Windows

Download the installer from https://ollama.ai and run it.

---

## Start Ollama

```bash
# Pull the default model (mistral recommended)
ollama pull mistral

# Start the server (often auto-starts after install)
ollama serve
```

**Fallback models:** `llama3`, `phi3`

---

## Environment Variables

Add to `.env`:

```
ENABLE_LOCAL_AI=true
OLLAMA_URL=http://localhost:11434
LOCAL_AI_MODEL=mistral
```

- **ENABLE_LOCAL_AI** – `true` (default) to use local AI; `false` to disable
- **OLLAMA_URL** – Ollama API URL (default: `http://localhost:11434`)
- **LOCAL_AI_MODEL** – Model name (mistral, llama3, phi3)

---

## Concurrency Limit

Max **3 concurrent AI requests** to avoid CPU overload.

---

## Testing

### 1. Trip Planner

```bash
curl -X POST http://localhost:3000/api/ai/trip-plan \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{"destination":"Paris","startDate":"2025-06-01","endDate":"2025-06-05","budget":"medium"}'
```

### 2. Recommendations

```bash
curl http://localhost:3000/api/ai/recommend-trips -H "Authorization: Bearer YOUR_JWT"
```

### 3. Assistant

```bash
curl -X POST http://localhost:3000/api/ai/assistant \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT" \
  -d '{"message":"Suggest a weekend in Tokyo"}'
```

### 4. Cache behavior

1. Call trip-plan with the same params twice
2. Second call should hit cache (instant, no Ollama call)
