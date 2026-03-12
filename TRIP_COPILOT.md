# Trip Copilot – Feature Overview

## Concept

Trip Copilot is a **persistent AI travel assistant embedded inside every trip**. It helps trip members plan, coordinate, and organize trips collaboratively. The Copilot has full context of the trip (destination, dates, members, itinerary, interests, travel style, budget) and maintains conversation history.

## Architecture

```
Frontend (/trips/[id])
  └── TripCopilotPanel
        └── TripCopilotChat
              ├── Message list
              ├── Suggested prompts
              └── CopilotSuggestionCards (on add)
                    └── Add to itinerary (POST /api/trips/[id]/itinerary)

Backend
  POST /api/ai/copilot
    - Load: trip, members, itinerary, Copilot history
    - Build context prompt → Ollama (local AI)
    - Cache response (copilot:tripId:messageHash)
    - Save to TripCopilotMessage
    - Return { reply, suggestedActivities?, itineraryUpdates? }

  GET /api/ai/copilot?tripId=...
    - Return recent Copilot messages
```

## Files Created / Modified

### Created
- `prisma/schema.prisma` – added `TripCopilotMessage` model
- `app/api/ai/copilot/route.ts` – GET (history) + POST (chat)
- `lib/validations.ts` – added `copilotMessageSchema`
- `components/trip/TripCopilotPanel.tsx`
- `components/trip/TripCopilotChat.tsx`
- `components/trip/CopilotSuggestionCards.tsx`
- `TRIP_COPILOT.md` – this file

### Modified
- `prisma/schema.prisma` – `Trip` relation to `TripCopilotMessage`, `User` relation
- `app/(dashboard)/trips/[id]/page.tsx` – integrated `TripCopilotPanel`

## Database Model

```prisma
model TripCopilotMessage {
  id        String   @id @default(cuid())
  tripId    String
  userId    String
  message   String   @db.Text
  role      String   // "user" | "assistant"
  createdAt DateTime @default(now())

  trip Trip @relation(...)
  user User @relation(...)

  @@index([tripId])
  @@index([tripId, createdAt])
}
```

## API

### POST /api/ai/copilot

**Input:**
```json
{ "tripId": "...", "message": "Plan day 2 activities in Kyoto" }
```

**Output:**
```json
{
  "reply": "...",
  "suggestedActivities": [
    { "dayNumber": 2, "title": "...", "description": "...", "time": "09:00", "costEstimate": "$20" }
  ],
  "itineraryUpdates": [...]
}
```

### GET /api/ai/copilot?tripId=...

**Output:** Array of `{ id, role, message, createdAt, userId }`

## Testing Copilot

1. **Prerequisites**
   - Ollama running: `ollama pull mistral && ollama serve`
   - `ENABLE_LOCAL_AI=true` in `.env`
   - Logged-in user who is a **trip member**

2. **Navigate**
   - Go to `/trips/[id]` for a trip you’ve joined

3. **Interactions**
   - Use suggested prompts or type a custom message
   - Examples:
     - "Plan day 2 activities in Kyoto"
     - "What should we do tonight?"
     - "Estimate total cost for this itinerary"
     - "Find activities everyone would enjoy"
     - "Optimize our itinerary"

4. **Add to itinerary**
   - When Copilot returns `suggestedActivities`, click the **+** button to add an activity to the trip itinerary

5. **Cache**
   - Repeat the same question; the second response should be served from cache (no Ollama call)
