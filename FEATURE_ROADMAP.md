# Travel Buddy App — YC-Level Feature Roadmap

## Project Snapshot

- **Stack:** Next.js (App Router), Prisma, Supabase Postgres, JWT auth
- **Current features:** Auth, profiles (save/report/message), chat, matches, trips (create/join/leave), dashboard, notifications, reviews, filters
- **Schema:** User, Trip, TripMember, Conversation, Message, Review, Notification, SavedProfile, Report
- **Dependencies:** `socket.io` and `socket.io-client` installed but unused

---

## Top 10 Features (Ranked by Impact)

### 1. Realtime chat — HIGH IMPACT ⭐
**What:** Near-instant message delivery (polling or WebSocket).  
**Why:** Core expectation in social/travel apps; users compare to WhatsApp/iMessage.  
**Dependencies:** None. Polling uses existing REST API. WebSocket would use `socket.io` (already installed) or Supabase Realtime.

### 2. Trip request approvals — HIGH IMPACT
**What:** Host must approve/decline join requests; no open join.  
**Why:** Trust, control over trip members, and clearer intent.  
**Dependencies:** Schema change (e.g. `TripMember.status: PENDING | APPROVED`), new API endpoints.

### 3. Push notifications — HIGH IMPACT
**What:** Browser/mobile push for new messages, trip invites, etc.  
**Why:** Users need to know when something needs attention without staying on the app.  
**Dependencies:** Web Push API or service (e.g. Firebase, OneSignal). Builds on notifications system.

### 4. Traveler verification — MEDIUM-HIGH IMPACT
**What:** ID or email verification flow; `User.verified` already in schema.  
**Why:** Trust and safety for meeting strangers.  
**Dependencies:** Email verification (low effort) or third-party verification service.

### 5. Group chat for trips — MEDIUM IMPACT
**What:** Trip-level group conversation for all members.  
**Why:** Natural for coordinating shared trips.  
**Dependencies:** New model (e.g. `TripConversation` or link `Conversation` to `Trip`), extends chat UI.

### 6. Trip cost splitting — MEDIUM IMPACT
**What:** Log expenses and split costs among trip members.  
**Why:** Reduces awkwardness around money; common pain point.  
**Dependencies:** New models (Expense, ExpenseSplit), UI for add/settle.

### 7. AI travel buddy suggestions — MEDIUM IMPACT (longer-term)
**What:** AI-suggested matches or trip ideas based on preferences.  
**Why:** Differentiator and improves discovery.  
**Dependencies:** AI API (OpenAI, etc.), prompt engineering, existing match/trip data.

### 8. Itinerary planner — MEDIUM IMPACT
**What:** Day-by-day plans per trip (activities, times).  
**Why:** Gives trips structure and helps coordination.  
**Dependencies:** New models (TripDay, Activity), UI for add/edit.

### 9. Activity suggestions — LOWER IMPACT
**What:** Destination-based activity ideas (from API or static data).  
**Why:** Makes planning easier.  
**Dependencies:** External API or static dataset.

### 10. Read receipts / typing indicators — POLISH
**What:** Show when messages are read and when someone is typing.  
**Why:** Improves chat feel; expected in modern apps.  
**Dependencies:** Realtime infrastructure (WebSocket or Supabase Realtime).

---

## Dependency Graph

```
Realtime chat ──────────────────► Read receipts / typing
       │
       └──► Push notifications (real-time triggers)

Trip approvals ──► Group chat for trips
       │
       └──► Trip cost splitting (members are known)

Traveler verification ──► (standalone, improves trust across all features)
```

---

## Implementation Order

1. **Realtime chat** (implemented first) — polling or WebSocket
2. **Trip request approvals** — schema + API + UI
3. **Push notifications** — Web Push + service integration
4. **Traveler verification** — email verification first
5. **Group chat for trips** — depends on trip approvals
6. **Trip cost splitting** — extends trip flows
7. **AI suggestions** — higher effort, later
8. **Itinerary planner** — new trip UX
9. **Activity suggestions** — API integration
10. **Read receipts / typing** — depends on realtime
