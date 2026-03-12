# Deployment Readiness Audit – Travel Buddy Finder

## 1. Environment Variables

| Variable | Required | Used In | Notes |
|----------|----------|---------|-------|
| DATABASE_URL | Yes | Prisma | Use Supabase pooler (port 6543) for Vercel |
| DIRECT_URL | Yes | Prisma | Use direct connection (port 5432) for migrations |
| JWT_SECRET | Yes | lib/auth | Fails in prod if missing |
| OPENAI_API_KEY | No | lib/ai | AI falls back to rules if missing |
| RESEND_API_KEY | No | lib/email | Email verification disabled if missing |
| APP_BASE_URL | Yes (for email) | lib/email | Verification links; fallback NEXT_PUBLIC_APP_URL |
| ADMIN_EMAILS | No | lib/admin-guard | Admin dashboard disabled if empty |
| EMAIL_FROM | No | lib/email | Default: onboarding@resend.dev |
| NEXTAUTH_* | No | next-auth (unused) | Not used by current JWT auth |

## 2. Prisma / Database

**Current state:**
- `prisma generate` in build script ✓
- `directUrl` in schema ✓
- Prisma singleton: **BUG** – only caches in development; production creates new client per cold start → connection exhaustion

**Supabase + Vercel:**
- DATABASE_URL: `postgresql://...@...pooler.supabase.com:6543/postgres?pgbouncer=true`
- DIRECT_URL: `postgresql://...@...supabase.com:5432/postgres`
- Run migrations locally or in CI before deploy; use `prisma migrate deploy` for production

**Recommendation:** Use `prisma migrate deploy` in Vercel build or run migrations separately. Avoid `db push` in production.

## 3. Auth / Cookies

**Current state:**
- `secure: process.env.NODE_ENV === "production"` ✓
- `sameSite: "lax"` ✓
- `httpOnly: true` ✓
- `path: "/"` ✓

**Risks:**
- No explicit `domain` – correct for single-domain deployment
- Cookie works with `credentials: "include"` on same-origin fetch ✓

## 4. API Routes

**Findings:**
- All use `getCurrentUserId` or admin guard
- Error handling: try/catch with 4xx/5xx ✓
- No obvious localhost or filesystem assumptions
- `apiFetch` uses relative URLs → same-origin ✓

## 5. File / Image Handling

**Profile photos:** Stored as URLs; components use `unoptimized` for user URLs.
- `next.config.js` has `remotePatterns` for images.unsplash.com
- User photos from other domains (imgur, etc.) use `unoptimized` → may need additional remotePatterns
- **Recommendation:** Add common image hosts or use placeholder if needed

## 6. AI and Email

- OpenAI: server-side only ✓
- Resend: server-side only ✓
- Missing keys: graceful fallbacks ✓
- No explicit timeout handling; consider for long AI calls

## 7. Admin Dashboard

- `getAdminUserId` checks ADMIN_EMAILS ✓
- /admin protected by middleware (auth required) ✓
- Admin APIs return 403 if not admin ✓

## 8. Logging

- `console.error` in catch blocks
- Prisma logs `error` in production
- No structured logging or monitoring

---

## Blockers

1. **Prisma singleton in production** – Can cause connection pool exhaustion on Vercel serverless.

---

## Warnings

1. **APP_BASE_URL** – Must be set for email verification links.
2. **Profile photo domains** – User URLs from arbitrary domains may need remotePatterns.
3. **No env validation at startup** – Missing DATABASE_URL fails at runtime, not at build.

---

## Recommended Fixes (Priority)

1. **High:** Fix Prisma singleton for production. → **DONE** (lib/prisma.ts)
2. **High:** Add env validation for required vars (fail fast). → Documented (JWT_SECRET already fails in prod)
3. **Medium:** Add vercel.json or ensure build output is correct. → Not needed for standard Next.js
4. **Medium:** Add common image domains for profile photos. → **DONE** (next.config.js)
5. **Low:** Add sameSite/secure cookie docs for production. → Covered in VERCEL_DEPLOYMENT_GUIDE.md

---

## Files Changed (Phase 2)

- `lib/prisma.ts` – Prisma singleton now caches in production to avoid connection exhaustion
- `next.config.js` – Added remotePatterns for imgur, Google, GitHub avatars
- `package.json` – Added `db:migrate:deploy` script for production migrations
- `components/VerificationBadge.tsx` – Fixed nullish coalescing + logical op syntax; relaxed status type for dashboard
- `lib/fraud.ts` – Fixed Prisma metadata type; fixed Set iteration for older targets
- `lib/safety.ts` – Fixed Set iteration for older targets
