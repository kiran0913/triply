# AI Travel Assistant – Testing Steps

## Architecture (100% Local)

```
User → /assistant (page) → POST /api/ai/assistant
                              ↓
                    [Context: profile, trips, matches]
                              ↓
                    Ollama (local) – mistral / llama3
                              ↓
                    Structured JSON: { text, itinerarySuggestions?, tripRecommendations? }
                              ↓
                    UI renders text + itinerary cards + trip links
```

- **Server-side only** – AI calls happen in the API route
- **Rate limited** – 15 requests/min per IP (shared with other AI routes)
- **Zero cost** – Local Ollama only; no API keys

---

## Prerequisites

- Ollama running with a model (e.g. `ollama pull mistral`)
- `ENABLE_LOCAL_AI=true` in `.env`
- Logged-in user with profile (interests, travel style, etc.)
- Optional: some open trips and past trips for richer context

---

## Test Cases

### 1. Basic chat

1. Go to `/assistant`
2. Type: "What are some good solo travel destinations?"
3. Click Send
4. **Expected:** AI responds with suggestions in text

### 2. Itinerary request

1. Type: "I'm visiting Japan for 7 days in October. Any suggestions?"
2. **Expected:** Response includes:
   - Text reply
   - Optional itinerary suggestion (destination, days, activities)
   - Optional trip recommendations if matching open trips exist

### 3. Trip recommendations

1. Ensure you have open trips in the app
2. Type: "What trips could I join this month?"
3. **Expected:** Response includes clickable trip cards with:
   - Title, destination, dates
   - Reason why it fits

### 4. Suggested actions

1. On empty chat, click a suggested prompt
2. **Expected:** Message is sent and AI responds

### 5. Conversation history

1. Send: "Suggest a 3-day Paris itinerary"
2. Follow up: "Add a day trip to Versailles"
3. **Expected:** Second response uses conversation context

### 6. Fallback (no Ollama)

1. Stop Ollama or set `ENABLE_LOCAL_AI=false`
2. Send any message
3. **Expected:** "I'm sorry, the AI assistant is not available..." with no error

### 7. Unauthenticated

1. Log out and visit `/assistant`
2. **Expected:** Redirect to login

### 8. Rate limit

1. Send 16+ messages in under a minute
2. **Expected:** 429 Too Many Requests

---

## Manual API Test

```bash
curl -X POST http://localhost:3000/api/ai/assistant \
  -H "Content-Type: application/json" \
  -b "auth-token=YOUR_JWT" \
  -d '{"message":"Suggest a weekend in Tokyo"}'
```

Expected response shape:

```json
{
  "text": "...",
  "itinerarySuggestions": [
    {
      "destination": "Tokyo",
      "dates": "...",
      "days": [...],
      "totalEstimatedCost": "$..."
    }
  ],
  "tripRecommendations": [
    {
      "id": "trip-id",
      "title": "...",
      "destination": "...",
      "startDate": "...",
      "endDate": "...",
      "reason": "..."
    }
  ]
}
```
