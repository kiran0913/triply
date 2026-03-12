# Production Improvements Roadmap – Travel Buddy Finder

Ranked by impact and effort.

---

## 1. Sentry (Error monitoring)

**Importance:** High  
**Effort:** Low  

- Captures unhandled errors, API failures, and client-side crashes.
- Integrates with Next.js and Vercel.
- Provides stack traces and release tracking.

---

## 2. Rate limiting (API)

**Importance:** High  
**Effort:** Medium  

- Protect auth, chat, and AI endpoints from abuse.
- Use Vercel Edge middleware or Upstash Redis for serverless.

---

## 3. Database backup strategy

**Importance:** High  
**Effort:** Low  

- Supabase: enable Point-in-Time Recovery (PITR) and scheduled backups.
- Document restore steps for incident response.

---

## 4. Email delivery monitoring

**Importance:** Medium  
**Effort:** Low  

- Use Resend dashboard for delivery rates and bounces.
- Optionally add webhook for failed sends and alerting.

---

## 5. Audit logs (admin actions)

**Importance:** Medium  
**Effort:** Medium  

- Log admin actions (status changes, flags) to a separate table.
- Helps with compliance and incident review.

---

## 6. Cron / re-score jobs

**Importance:** Medium  
**Effort:** Medium  

- Vercel Cron or external scheduler for periodic tasks.
- Refresh AI match scores, update safety scores, or cleanup expired tokens.

---

## 7. Analytics

**Importance:** Low  
**Effort:** Low  

- Add privacy-friendly analytics (e.g. Vercel Analytics, Plausible).
- Track key flows (signup, matches, trip creation).
