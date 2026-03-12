# Public Trip Pages – Feature Overview

## Viral Growth Loop

1. **Host creates/open trip** → Slug generated (e.g. `bali-adventure-2025`)
2. **Host shares link** → `https://yourapp.com/t/bali-adventure-2025`
3. **Visitor opens link** → Sees public landing page (no login required)
4. **Visitor clicks "Join Trip"** → If not logged in: signup → onboarding → auto-join → redirect to trip
5. **New member shares** → Cycle repeats; each member can share the same trip

The loop turns every trip member into a distribution channel. Shareable links drive signups and trip joins.

---

## Files Created / Modified

### Created
- `lib/slug.ts` – slug generation and uniqueness
- `app/api/trips/slug/[slug]/route.ts` – GET public trip by slug (no auth)
- `app/api/trips/[id]/share/route.ts` – POST track share
- `app/api/trips/public/route.ts` – GET public trips index
- `app/t/layout.tsx` – AuthProvider for /t routes
- `app/t/[slug]/page.tsx` – Public trip page (server component, metadata)
- `app/t/[slug]/PublicTripPage.tsx` – Public trip client UI
- `app/trips/public/page.tsx` – Public trips discovery page
- `components/trip/ShareButton.tsx`
- `PUBLIC_TRIP_PAGES.md` – this file

### Modified
- `prisma/schema.prisma` – Trip: slug, isPublic, shareImage; TripShare model
- `app/api/trips/route.ts` – generate slug on create
- `app/api/trips/[id]/route.ts` – set slug + isPublic when status → OPEN
- `app/(dashboard)/trips/[id]/page.tsx` – ShareButton
- `app/(auth)/signup/page.tsx` – redirect + joinTrip params
- `app/(auth)/login/page.tsx` – redirect param
- `app/(auth)/onboarding/page.tsx` – redirect + joinTrip, auto-join after onboarding

---

## Database

**Trip:**
- `slug` – unique, e.g. `bali-adventure-2025`
- `isPublic` – default false; true when status is OPEN
- `shareImage` – optional OG image URL

**TripShare:**
- tripId, userId?, shareSource, createdAt

---

## URLs

| URL | Purpose |
|-----|---------|
| `/t/[slug]` | Public trip landing (no auth) |
| `/trips/public` | Public trips index |
| `/trips/[id]` | Dashboard trip (auth required) |

---

## Signup Conversion Flow

1. Visitor opens `/t/bali-adventure-2025`
2. Clicks "Join Trip" → not logged in
3. Redirect to `/signup?redirect=/t/bali-adventure-2025&joinTrip=<tripId>`
4. After signup → `/onboarding?redirect=...&joinTrip=...`
5. After onboarding → POST `/api/trips/[id]/join` → redirect to `/trips/[id]`

---

## Testing

1. **Public page**
   - Create a trip with status OPEN (or change existing to OPEN)
   - Ensure it has a slug (new trips get one; PATCH to OPEN adds slug if missing)
   - Visit `/t/<slug>` (no login) → should see landing page

2. **Share link**
   - On trip page, click Share → copy link
   - Open in incognito → same public page

3. **Join (logged in)**
   - Log in, open `/t/<slug>`, click Join → should join and redirect to trip

4. **Join (not logged in)**
   - Log out, open `/t/<slug>`, click Join
   - Should go to signup with redirect + joinTrip
   - Complete signup → onboarding → auto-join → redirect to trip

5. **Metadata**
   - Share link on social → check OG title, description, image

6. **Public index**
   - Visit `/trips/public` → list of public OPEN trips
