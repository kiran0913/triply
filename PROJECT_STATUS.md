# Travel Buddy Finder – Project Status

**Last updated:** Current session  
**Stack:** Next.js 14 (App Router), Prisma, Supabase Postgres, JWT auth, TypeScript

---

## DONE – Core Features

| Feature | Status | Notes |
|---------|--------|-------|
| **Authentication** | Done | JWT, login, register, logout, me |
| **Profiles** | Done | View, edit, photo, bio, interests, travel style |
| **Matches (discover)** | Done | Filters, pass/save, connect |
| **Matches (saved)** | Done | From Match table, dashboard display |
| **Chat** | Done | Conversations, messages, notifications |
| **Trips** | Done | Create, list, view, join, leave |
| **Notifications** | Done | List, unread count, mark read |
| **Reviews** | Done | Leave review on profile, linked to trip |
| **Reports** | Done | Report user with reason |
| **Filters** | Done | Matches: destination, style, interests, budget, verified |

---

## DONE – AI Features

| Feature | Status | API | Notes |
|---------|--------|-----|-------|
| **AI Match Scoring** | Done | GET /api/matches?discover=1 | AI when ≤15 users; rule-based fallback; `matchReasons` |
| **Match score storage** | Done | On save profile | Match created/updated with AI score |
| **AI Trip Planner** | Done | POST /api/ai/trip-plan | Day-by-day itinerary, save as trip |
| **AI Trip Recommendations** | Done | GET /api/ai/recommend-trips | Trips ranked by relevance |
| **Re-score matches** | Done | POST /api/ai/re-score-matches | Refresh scores for current user |

**AI UI:**
- AI Trip Planner button (dashboard, create page)
- AITripPlannerModal (generate + save as trip)
- Recommended trips section on dashboard
- Match reasons on matches page

---

## DONE – Safety & Verification

| Feature | Status | Notes |
|---------|--------|-------|
| **Traveler verification** | Done | Levels: basic, verified, trusted |
| **Verification Center** | Done | `/verification` – email, profile, photo status |
| **Verification badges** | Done | On profile, dashboard matches, match cards |
| **AI safety scoring** | Done | Profile update → safetyScore, safetyStatus, flaggedReasons |
| **Trip safety check** | Done | Block high-risk trip descriptions |
| **Message moderation** | Done | Block high-risk, flag medium-risk, warning to sender |
| **Fraud detection** | Done | FraudEvent, fraud risk, report/save/message tracking |
| **Safety Center** | Done | `/safety` – tips, verification, report link |

---

## Database

| Item | Status |
|------|--------|
| **Schema** | Complete – User, Trip, Match, Message, Report, Review, FraudEvent, SafetyFlag |
| **Migration** | Needs `npx prisma db push` or migrate (requires DATABASE_URL, DIRECT_URL) |

**User fields added:**
- `verificationLevel`, `profileCompleted`, `photoVerified`
- `safetyScore`, `safetyStatus`, `flaggedReasons`, `fraudStatus`

---

## Pending / Needs Attention

| Item | Status | Action |
|------|--------|--------|
| **DB migration** | Pending | Run `npx prisma db push` with valid .env |
| **OPENAI_API_KEY** | Optional | Set in .env for full AI features |
| **ESLint** | Not configured | `npm run lint` may prompt for setup |
| **Admin dashboard** | Not implemented | Spec mentioned future “AI Admin Dashboard for flagged users” |
| **Real email verification** | Placeholder | `emailVerified` set on register; no verification email sent |
| **ID verification** | Placeholder | “Coming soon” in Verification Center |
| **Phone verification** | Placeholder | Not implemented |

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | Postgres connection |
| `DIRECT_URL` | Yes | Postgres direct connection (Supabase) |
| `JWT_SECRET` | Yes | Auth tokens |
| `OPENAI_API_KEY` | No | AI features (fallback to rules if missing) |
| `NEXTAUTH_*` | No | NextAuth (optional) |
| `GOOGLE_*` | No | OAuth (optional) |

---

## API Routes Summary

```
/auth/login, register, logout, me
/dashboard
/matches (GET ?discover=1)
/trips (GET, POST)
/trips/[id] (GET, join, leave)
/users/[id] (GET, PATCH)
/users/[id]/save (POST)
/users/[id]/reviews (GET)
/conversations (GET, POST)
/conversations/[id]/messages (GET, POST)
/notifications, unread-count, read
/reviews (POST)
/reports (POST)
/ai/trip-plan (POST)
/ai/recommend-trips (GET)
/ai/re-score-matches (POST)
/verification/status (GET)
/verification/update (PATCH)
```

---

## Pages

| Route | Purpose |
|-------|---------|
| / | Landing |
| /login, /signup, /onboarding | Auth |
| /dashboard | Home, upcoming trip, matches, recommended trips |
| /matches | Discover, filters, cards/list |
| /create | Create trip, AI Trip Planner button |
| /chat | Conversations, messages |
| /explore | Browse trips |
| /profile | Redirect to own profile |
| /profile/[id] | View profile, verification badge |
| /trips/[id] | Trip details, join/leave |
| /notifications | Notifications list |
| /verification | Verification Center |
| /safety | Safety Center |

---

## Next Steps (Optional)

1. Run `npx prisma db push` once .env is configured.
2. Add `OPENAI_API_KEY` for full AI features.
3. Configure ESLint if desired.
4. Consider admin UI for FraudEvent/SafetyFlag review (future).
5. Add email verification flow (e.g. send verification link).
6. Add real ID verification flow when needed.
