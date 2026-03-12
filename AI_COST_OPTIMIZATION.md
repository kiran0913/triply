# AI Architecture – 100% Free Local

## 1. Current AI Architecture

| Endpoint | Purpose | Model | Caching |
|----------|---------|-------|---------|
| `/api/ai/trip-plan` | Day-by-day itinerary | Ollama (mistral) | Yes (7 days) |
| `/api/ai/recommend-trips` | Rank trips by relevance | Ollama (mistral) | Yes (1 day) |
| `/api/ai/assistant` | Chat assistant | Ollama (mistral) | No (conversational) |
| `/api/ai/re-score-matches` | Match compatibility | Ollama (mistral) | No |

**Zero cost** – All AI runs locally via Ollama. No API keys or paid services.

---

## 2. Optimization Strategy

| Optimization | Impact |
|--------------|--------|
| **Local inference** | Ollama on localhost – no per-request cost |
| **Token limits** | num_predict: 500–600 to cap output |
| **Response caching** | DB cache (AICache) for trip-plan and recommend-trips |
| **Concurrency limit** | Max 3 concurrent AI requests to avoid CPU overload |
| **Per-user rate limit** | 10 AI calls/user/hour |
| **Usage logging** | AIUsage table for monitoring |

---

## 3. How Caching Works

**Trip Plan:**
- Cache key: `sha256(destination + startDate + endDate + budget + travelStyle + interests)`
- Expiry: 7 days
- Same params → cache hit, no Ollama call

**Recommend Trips:**
- Cache key: `sha256(userProfile + sorted trip IDs)`
- Expiry: 1 day
- Same user + same trips → cache hit

---

## 4. Testing

### Cache Hit vs Miss

**Trip Plan:**
1. Call POST `/api/ai/trip-plan` with `{ destination: "Tokyo", startDate: "2025-10-01", endDate: "2025-10-07", ... }`
2. First call → cache miss, Ollama called
3. Repeat same payload → cache hit, no Ollama call

**Recommend Trips:**
1. Call GET `/api/ai/recommend-trips`
2. First call → cache miss
3. Call again before cache expires → cache hit

### Rate Limiting

1. As a logged-in user, make 11 AI calls within an hour (any mix of trip-plan, recommend-trips, assistant)
2. 11th call → 429 with `Retry-After`
