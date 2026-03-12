# Travel Buddy App — Deployment Guide

Deploy to **Vercel** (frontend + API) with **Supabase Postgres** (database).

---

## Important: Local Development

The schema now requires `DIRECT_URL` for Supabase serverless support. **Add `DIRECT_URL` to your `.env`:**

- **Local Postgres:** Use the same value as `DATABASE_URL`
- **Supabase:** Use the session/direct connection (port 5432)

---

## 1. Deployment Checklist

Use this before and after deployment:

| Step | Task | Status |
|------|------|--------|
| 1 | Supabase project created, migrations applied | ☐ |
| 2 | Environment variables configured (see §3) | ☐ |
| 3 | Local build passes (`npm run build`) | ☐ |
| 4 | Vercel project linked, env vars added | ☐ |
| 5 | Deployed, production URL works | ☐ |
| 6 | Database connection verified | ☐ |
| 7 | API endpoints tested | ☐ |
| 8 | Login/signup tested | ☐ |
| 9 | Trips and chat features tested | ☐ |

---

## 2. Prepare Project for Vercel

### 2.1 Supabase Database Setup

1. Create a Supabase project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. In **Project Settings → Database**, copy the connection strings
3. You need two URLs:
   - **Transaction pooler** (port **6543**, for serverless): `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true`
   - **Session/direct** (port **5432**, for migrations): `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres`

4. Run migrations locally against Supabase:

   ```bash
   # Set env vars (or use .env)
   export DATABASE_URL="postgresql://...:6543/postgres?pgbouncer=true"
   export DIRECT_URL="postgresql://...:5432/postgres"

   npm run db:migrate
   # Or if DB already has schema: npx prisma db push
   ```

5. Optional: seed the database

   ```bash
   npm run seed
   ```

### 2.2 Local Build Test

```bash
# Install deps
npm install

# Ensure .env has DATABASE_URL and DIRECT_URL (can be same for local Postgres)
npm run build
```

If the build fails, fix any errors before deploying.

---

## 3. Environment Variables

### Required for Production

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Supabase **transaction pooler** (port 6543, `?pgbouncer=true`) | `postgresql://postgres.xxx:yyy@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Supabase **session/direct** (port 5432) | `postgresql://postgres.xxx:yyy@aws-0-us-east-1.pooler.supabase.com:5432/postgres` |
| `JWT_SECRET` | Secret for JWT signing (min 32 chars) | `your-super-secret-jwt-key-min-32-chars` |

### Optional

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXTAUTH_URL` | App URL (if using NextAuth) | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | NextAuth secret | `...` |
| `GOOGLE_CLIENT_ID` | Google OAuth | `...` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | `...` |

---

## 4. Vercel Dashboard Setup

### 4.1 Create / Import Project

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository (GitHub, GitLab, Bitbucket)
3. Select the repo and configure:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** leave default
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** leave default
   - **Install Command:** `npm install` (default)

### 4.2 Add Environment Variables

1. In the project → **Settings → Environment Variables**
2. Add each variable:
   - **Key:** e.g. `DATABASE_URL`
   - **Value:** paste the value (no quotes)
   - **Environment:** Production (and Preview if you want)
3. Add at minimum:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `JWT_SECRET`

### 4.3 Deploy

1. Click **Deploy**
2. Wait for the build; Vercel runs:
   - `npm install` → `postinstall` → `prisma generate`
   - `npm run build` → `prisma generate && next build`
3. Note the production URL (e.g. `https://your-app-xxx.vercel.app`)

---

## 5. Exact Commands to Run

### Local (before deploy)

```bash
# 1. Install dependencies
npm install

# 2. Set env vars (or use .env)
# DATABASE_URL, DIRECT_URL, JWT_SECRET

# 3. Run migrations against Supabase
npm run db:migrate
# or: npx prisma db push

# 4. (Optional) Seed
npm run seed

# 5. Verify build
npm run build
```

### Deploy via Vercel CLI (optional)

```bash
npm i -g vercel
vercel
# Follow prompts; link project or create new
# Ensure env vars are set in dashboard or via vercel env add
```

### Deploy via Git

1. Push to your main branch
2. Vercel deploys on push (if connected)
3. Or use **Redeploy** in the Vercel dashboard

---

## 6. Verify Deployment Success

### 6.1 Basic Checks

| Check | How |
|-------|-----|
| Site loads | Open `https://your-app.vercel.app` |
| No 500 on home | Homepage renders |
| API responds | `curl https://your-app.vercel.app/api/auth/me` (expect 401 without cookie) |

### 6.2 Database Connection

1. Go to **Register** (`/register`)
2. Create an account
3. If signup works, DB connection is OK

### 6.3 Authentication (Login / Signup)

1. **Register:** create a new user
2. **Login:** sign in with email/password
3. You should be redirected to dashboard and stay logged in after refresh

### 6.4 API Endpoints

```bash
# After logging in (use cookie or Authorization header)
curl -X GET "https://your-app.vercel.app/api/dashboard" \
  -H "Cookie: auth-token=YOUR_JWT"
```

### 6.5 Trips and Chat

1. Log in
2. Create a trip
3. Open chat, start a conversation
4. Verify data persists and UI works

---

## 7. Troubleshooting

### Build fails with "Environment variable not found: DIRECT_URL"

- Add `DIRECT_URL` in Vercel → Settings → Environment Variables
- Redeploy

### "JWT_SECRET must be set in production"

- Add `JWT_SECRET` in Vercel env vars
- Redeploy

### "Too many connections" / DB timeout

- Ensure `DATABASE_URL` uses the **transaction pooler** (port 6543, `?pgbouncer=true`)
- Ensure `DIRECT_URL` uses port 5432 (session/direct)

### Login works but session lost on refresh

- Check cookie: `secure: true` is used in production (HTTPS)
- Ensure `NEXTAUTH_URL` (if used) matches the Vercel URL
- Verify `sameSite: "lax"` and `path: "/"` are set

### API returns 500

- Check Vercel → **Deployments** → your deployment → **Functions** → logs
- Look for `console.error` output from API routes

---

## 8. Project Configuration Summary

- **Prisma:** Uses `DATABASE_URL` (pooled) at runtime, `DIRECT_URL` for migrations
- **Auth:** JWT in `auth-token` cookie; `secure` in production
- **Build:** `prisma generate` runs in postinstall and build
- **Logging:** `console.error` in API routes; visible in Vercel function logs
