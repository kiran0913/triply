# Vercel Deployment Guide – Travel Buddy Finder

## 1. Prepare Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. **Settings → Database**:
   - Copy **Connection string** (URI) for **Session mode** (pooler, port 6543) → use as `DATABASE_URL`.
   - Copy **Connection string** for **Direct connection** (port 5432) → use as `DIRECT_URL`.
3. Add `?pgbouncer=true` to the pooler URL (Session mode) for Prisma:
   ```
   postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
4. Ensure you have run migrations. Locally:
   ```bash
   npm run db:migrate
   # or, if you already have migrations:
   npm run db:migrate:deploy
   ```

---

## 2. Configure Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard).
2. **Add New Project** → Import your Git repo (GitHub/GitLab/Bitbucket).
3. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (or your app root)
   - **Build Command:** `npm run build` (uses `prisma generate && next build`)
   - **Output Directory:** (leave default)
   - **Install Command:** `npm install`

---

## 3. Environment Variables (Vercel)

Add these in **Project Settings → Environment Variables**:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | Supabase pooler URL (port 6543) with `?pgbouncer=true` | Yes |
| `DIRECT_URL` | Supabase direct URL (port 5432) | Yes |
| `JWT_SECRET` | Strong random string (e.g. `openssl rand -base64 32`) | Yes |
| `APP_BASE_URL` | Your live URL, e.g. `https://your-app.vercel.app` | Yes (for email) |
| `OPENAI_API_KEY` | OpenAI API key | No (AI falls back to rules) |
| `RESEND_API_KEY` | Resend API key | No (email verification disabled if missing) |
| `ADMIN_EMAILS` | Comma-separated admin emails | No |
| `EMAIL_FROM` | Sender email, e.g. `Travel Buddy <noreply@yourdomain.com>` | No (default: Resend onboarding) |

Scope: Production (and Preview if you want staging envs).

---

## 4. Prisma Migrations

**Use migrations in production, not `db push`.**

- **Before first deploy:** Run migrations locally against your production DB:
  ```bash
  # Set DATABASE_URL and DIRECT_URL to your production Supabase
  npm run db:migrate:deploy
  ```
- **Ongoing:** Run `npm run db:migrate:deploy` locally or in CI after creating new migrations with `npm run db:migrate`.

Do **not** run `prisma migrate` in the Vercel build; migrations should run separately before deploy.

---

## 5. Deploy First Production Version

1. Push your code to the connected Git branch (e.g. `main`).
2. Vercel will auto-deploy on push.
3. Or trigger **Redeploy** from the dashboard.

---

## 6. Verify Live Deployment

- Homepage loads.
- Sign up → user created, no DB errors.
- Login → redirects to dashboard, session persists.
- Protected routes (e.g. `/dashboard`, `/matches`) work.
- API calls (e.g. `/api/auth/me`) return expected data.
- If email is configured: verification link uses `APP_BASE_URL`.
- Check Vercel **Functions** logs for runtime errors.

---

## 7. Rollback

1. **Vercel Dashboard** → Deployments → select previous deployment.
2. **⋮** → **Promote to Production**.

Or via CLI:

```bash
vercel rollback
```

---

## Build Note

The production build requires `JWT_SECRET` in the environment (Next.js runs in production mode during build). Ensure `.env` has `JWT_SECRET` for local `npm run build`, or Vercel will inject it at build time from Project Settings.

---

## Post-Deploy Checklist

- [ ] All env vars set (especially `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `APP_BASE_URL`).
- [ ] Migrations applied to production DB.
- [ ] Auth (login/logout) works.
- [ ] Admin dashboard accessible if `ADMIN_EMAILS` is set.
- [ ] Email verification links point to correct domain (check `APP_BASE_URL`).
