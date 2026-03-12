# AI Safety + Fraud Detection + Traveler Verification

## 1. Current Project Structure (Relevant Parts)

- **Stack**: Next.js (App Router), Prisma, Supabase Postgres, JWT auth, TypeScript
- **Existing**: Auth, profiles, matches, chat, trips, join/leave, notifications, reviews, filters, AI matching, AI trip planner
- **API routes**: `/api/auth/*`, `/api/users/[id]`, `/api/trips`, `/api/conversations/[id]/messages`, `/api/reports`, etc.
- **Dashboard**: Home, Matches, Create, Chat, Profile, Explore
- **Schema**: User, Trip, Match, Message, Report, Review, SavedProfile, etc.

---

## 2. MVP Architecture

### Layered Trust Model

1. **Rule-based checks first** – Fast, no API cost (regex, length, pattern)
2. **AI reasoning second** – When `OPENAI_API_KEY` is set, AI enhances safety checks
3. **Detection + flagging** – Do not auto-ban; flag and store for review

### Components

| Component          | Purpose                                                                 |
|-------------------|-------------------------------------------------------------------------|
| `lib/verification.ts` | Verification level (basic/verified/trusted), profileCompleted, photoVerified |
| `lib/safety.ts`       | AI + rule-based profile, message, trip safety checks                    |
| `lib/fraud.ts`        | FraudEvent recording, fraud risk evaluation, pattern checks             |
| Prisma models         | User verification/safety/fraud fields; FraudEvent; SafetyFlag           |

---

## 3. Implementation Order (as requested)

1. **Traveler Verification** – schema, API, badges, verification center
2. **Safety scoring** – profile and trip evaluation, safety score
3. **Message moderation** – pre-send checks, block high risk, flag medium
4. **Fraud flags** – FraudEvent, fraud risk, report/save/message tracking
5. **Safety Center UI** – page with tips, verification status, report link

---

## 4. Files Created or Modified

### Created

| File | Purpose |
|------|---------|
| `lib/verification.ts` | Verification level logic |
| `lib/safety.ts` | AI + rule-based safety checks |
| `lib/fraud.ts` | FraudEvent, fraud evaluation |
| `app/api/verification/status/route.ts` | GET verification status |
| `app/api/verification/update/route.ts` | PATCH recompute verification |
| `components/VerificationBadge.tsx` | Trust badge component |
| `app/(dashboard)/verification/page.tsx` | Verification center |
| `app/(dashboard)/safety/page.tsx` | Safety center page |

### Modified

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | User verification/safety/fraud fields; FraudEvent; SafetyFlag |
| `app/api/auth/register/route.ts` | Set `emailVerified` on signup |
| `app/api/users/[id]/route.ts` | Verification + safety scoring on profile update |
| `app/api/users/[id]/save/route.ts` | Fraud tracking for rapid saves |
| `app/api/trips/route.ts` | Trip description safety check (block high risk) |
| `app/api/conversations/[id]/messages/route.ts` | Message moderation, fraud tracking, SafetyFlag |
| `app/api/reports/route.ts` | FraudEvent for reported user, fraud status update |
| `app/(dashboard)/profile/[id]/page.tsx` | VerificationBadge, verification center link |
| `app/(dashboard)/dashboard/page.tsx` | VerificationBadge on match cards |
| `app/(dashboard)/matches/page.tsx` | VerificationBadge on match cards |
| `app/(dashboard)/chat/page.tsx` | Show moderation warning when present |
| `components/DashboardLayout.tsx` | Safety nav link |
| `middleware.ts` | Protect `/safety`, `/verification` |
| `prisma/seed.ts` | Verification fields for seed users |

---

## 5. Database Migration

Run:

```bash
npx prisma db push
```

Or create a migration:

```bash
npx prisma migrate dev --name add_safety_verification
```

---

## 6. How to Test

### Risky profile detection

1. Update profile with risky content (e.g. “wire transfer”, “click here”, long spam-like bio)
2. Profile update should still succeed, but safety score is stored
3. With AI, `safetyScore` / `safetyStatus` / `flaggedReasons` reflect risk

### Suspicious message detection

1. Send a message containing “wire transfer” or “whatsapp” or “click here”
2. High-risk → message rejected with error
3. Medium-risk → message saved, warning shown, SafetyFlag created
4. Normal → message saved without warning

### Fraud flag generation

1. **Reports**: Report a user several times; their `fraudStatus` may become `review_required`
2. **Rapid saves**: Save 40+ profiles → FraudEvent
3. **Messages**: Send 20+ messages in 1 hour → FraudEvent

### Verification badge display

1. Register → `emailVerified` set
2. Complete profile (name, bio, location, interests/travel style) + photo → verification level “verified”
3. Verification badge appears on profile, dashboard matches, match cards

### Safety center page

1. Go to `/safety`
2. See verification status, safety tips, report link, trust badge explanation
3. Navigate to verification center from there

### Normal safe user flow

1. Register and complete profile
2. Create trip with normal description
3. Send normal messages
4. No warnings or blocks

---

## 7. Environment

No new env vars required. Existing `OPENAI_API_KEY` improves safety checks. Without it, rule-based checks still run.
