# Vercel Deployment Checklist – Triply

Use this checklist to deploy the Next.js + Prisma + Supabase app to Vercel.

---

## 1. Secrets & environment files

### No hardcoded secrets
- **Verified:** No API keys, passwords, or JWT secrets are hardcoded in the codebase.
- All sensitive values are read from `process.env.*`.

### .env and .gitignore
- **Verified:** `.gitignore` includes:
  - `.env`
  - `.env.local`
  - `.env.sentry-build-plugin`
- Never commit `.env`. Vercel uses **Project Settings → Environment Variables**.

### .env.example safety
- **Verified:** `.env.example` contains only placeholders:
  - `[PASSWORD]`, `[PROJECT-REF]`, `[REGION]` for DB URLs
  - `your-secret-min-32-chars` for JWT/NEXTAUTH/CRON
  - Empty strings for optional keys (Google, Resend, etc.)
- Safe to commit. Do not put real values in `.env.example`.

---

## 2. Required environment variables (Vercel)

Set these in **Vercel → Project → Settings → Environment Variables** (Production and Preview if you use staging).

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | Supabase pooler URL (port 6543), with `?pgbouncer=true`. From Supabase → Settings → Database → Connection string (Session mode). |
| `DIRECT_URL` | **Yes** | Supabase direct URL (port 5432). From Supabase → Settings → Database → Direct connection. |
| `JWT_SECRET` | **Yes** | Strong secret for JWT signing (min 32 chars). Generate: `openssl rand -base64 32`. Production build will fail without it. |
| `APP_BASE_URL` | **Yes** (for email/OG) | Production URL, e.g. `https://your-app.vercel.app`. Used for verification emails and public trip page metadata. |

### Optional but recommended

| Variable | Purpose |
|----------|---------|
| `NEXTAUTH_URL` | Same as `APP_BASE_URL` if you use NextAuth; used as fallback for `BASE_URL` in `app/t/[slug]/page.tsx`. |
| `NEXTAUTH_SECRET` | If using NextAuth. |
| `RESEND_API_KEY` | Email verification (Resend). Without it, signup works but verification emails are skipped. |
| `EMAIL_FROM` | Sender for Resend (e.g. `Triply <noreply@yourdomain.com>`). Default: `Triply <onboarding@resend.dev>`. |
| `ADMIN_EMAILS` | Comma-separated emails for admin dashboard access. |
| `CRON_SECRET` | Secret for protecting cron endpoints. Set if you use Vercel Cron (see below). |

### Optional – monitoring (Sentry)

| Variable | Purpose |
|----------|---------|
| `SENTRY_DSN` | Server/edge Sentry DSN. |
| `NEXT_PUBLIC_SENTRY_DSN` | Client Sentry DSN (public). |
| `SENTRY_ORG` | Sentry org slug (for build upload). |
| `SENTRY_PROJECT` | Sentry project slug. |
| `SENTRY_AUTH_TOKEN` | Sentry auth token (for source maps). |

### Local-only / do not set on Vercel

| Variable | Note |
|----------|------|
| `ENABLE_LOCAL_AI` | Set to `false` or leave unset on Vercel (no Ollama in serverless). |
| `OLLAMA_URL` | Ignored on Vercel. |
| `LOCAL_AI_MODEL` | Ignored on Vercel. |

---

## 3. Prisma configuration (production-safe)

- **Verified:** `prisma/schema.prisma` uses:
  - `url = env("DATABASE_URL")` for the pooled connection (Supabase Session mode).
  - `directUrl = env("DIRECT_URL")` for migrations and direct connections (required for Supabase serverless).
- **Build:** `package.json` has `"build": "prisma generate && next build"` and `"postinstall": "prisma generate"`, so the client is generated at build time.
- **Migrations:** Run migrations **before** deploy (not during Vercel build):
  ```bash
  DATABASE_URL="..." DIRECT_URL="..." npx prisma migrate deploy
  ```
  Use your production Supabase URLs. Run from your machine or from CI.

---

## 4. JWT and cookie settings (production)

- **Verified:** Auth cookies are production-safe:
  - `httpOnly: true`
  - `secure: process.env.NODE_ENV === "production"` (HTTPS-only on Vercel)
  - `sameSite: "lax"`
  - `path: "/"`
  - 7-day `maxAge`
- Used in: `app/api/auth/login/route.ts`, `app/api/auth/register/route.ts`, `app/api/auth/logout/route.ts`.
- **JWT:** `lib/auth.ts` throws in production if `JWT_SECRET` is missing; no fallback secret is used in production.

---

## 5. Local-only dependencies and what breaks on Vercel

### Ollama / local AI

The app uses **Ollama** (local LLM) for:

- Trip Copilot (`/api/ai/copilot`)
- AI Assistant (`/api/ai/assistant`)
- Trip plan (`/api/ai/trip-plan`)
- Recommend trips (`/api/ai/recommend-trips`)
- Match scoring and safety (e.g. `lib/ai-match.ts`, `lib/safety.ts`, `lib/ai-service.ts`)
- Cron: `refresh-trip-recommendations`, and any other cron that calls `callOllama` / `callOllamaJson`

**On Vercel:**

- There is no Ollama server. `OLLAMA_URL` (default `http://localhost:11434`) is unreachable.
- **Behavior:** These features return friendly “AI not available” messages or fallbacks (e.g. rule-based behavior) instead of crashing.
- **Recommendation:** Set `ENABLE_LOCAL_AI=false` (or leave unset) on Vercel so the app does not try to call Ollama. Optional: add a cloud AI (e.g. OpenAI) later and gate it with an env var.

### Cron jobs

- Routes under `app/api/cron/*` are protected by `CRON_SECRET` (Bearer token). A `vercel.json` is included with three crons; set `CRON_SECRET` in Vercel so Vercel sends it in the `Authorization` header.
- **Ollama-dependent (will 503 or use fallbacks on Vercel):**
  - `refresh-trip-recommendations` – uses Ollama; returns 503 if local AI is not available.
  - `re-score-matches` – uses `lib/ai-match` (Ollama); may use fallback behavior.
- **Runs on Vercel without Ollama:** `recompute-fraud-risk` – uses `lib/fraud` only (no Ollama).

---

## 6. Final deployment checklist

- [ ] **Supabase**
  - [ ] Create production project (or use existing).
  - [ ] Copy **Session mode** (pooler, 6543) URL → `DATABASE_URL` (add `?pgbouncer=true`).
  - [ ] Copy **Direct** (5432) URL → `DIRECT_URL`.
  - [ ] Run migrations: `DATABASE_URL=... DIRECT_URL=... npx prisma migrate deploy`.

- [ ] **Vercel**
  - [ ] Import Git repo; Framework: Next.js.
  - [ ] Set env vars (see section 2). At minimum: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `APP_BASE_URL`.
  - [ ] Do **not** set `ENABLE_LOCAL_AI=true` on Vercel (or set to `false`).
  - [ ] (Optional) Add `vercel.json` with `crons` if you use Vercel Cron; set `CRON_SECRET` and use it in the Authorization header.

- [ ] **Build**
  - [ ] Build command: `npm run build` (already includes `prisma generate`).
  - [ ] No need to run `prisma migrate` in the build step.

- [ ] **Post-deploy**
  - [ ] Open production URL; confirm homepage and auth (login/signup) work.
  - [ ] Confirm protected routes redirect to login when not authenticated.
  - [ ] If using Resend: trigger a signup and check verification email link uses `APP_BASE_URL`.
  - [ ] Confirm public trip page `/t/[slug]` works and uses correct `APP_BASE_URL` for metadata.

- [ ] **Optional**
  - [ ] Configure Sentry (set DSN and auth token for source maps).
  - [ ] Configure Vercel Cron for `/api/cron/*` and set `CRON_SECRET`.
  - [ ] Add custom domain and set `APP_BASE_URL` (and `NEXTAUTH_URL` if used) to that domain.

---

## 7. Quick reference – env vars summary

**Required:** `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `APP_BASE_URL`  
**Recommended:** `RESEND_API_KEY`, `APP_BASE_URL` (or `NEXTAUTH_URL`) for emails and OG  
**Optional:** `ADMIN_EMAILS`, `CRON_SECRET`, Sentry vars, `EMAIL_FROM`  
**Do not use on Vercel:** `ENABLE_LOCAL_AI=true`, `OLLAMA_URL`, `LOCAL_AI_MODEL`
