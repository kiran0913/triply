# Admin Dashboard – Trust & Safety Review

## 1. What Exists Already

- **Auth**: JWT in cookies, `getCurrentUserId(request)`
- **Models**: User (fraudStatus, safetyStatus, verificationLevel, flaggedReasons), FraudEvent, SafetyFlag, Report
- **Safety/Fraud**: Profile/trip/message checks, FraudEvent recording, SafetyFlag creation

## 2. Admin Architecture

### Access control (MVP)

- **ADMIN_EMAILS** env var: comma-separated list of allowed emails
- `getAdminUserId(request)`: returns `userId` if the current user’s email is in that list, else `null`
- All admin API routes call `getAdminUserId` first; if null → 403 Forbidden
- Admin layout fetches `/api/admin/check`; if not admin → redirect to `/dashboard`

No schema changes, no RBAC. Admin status is based only on email allowlist.

## 3. Files Created or Modified

### Created

| File | Purpose |
|------|---------|
| `lib/admin-guard.ts` | Admin access check via ADMIN_EMAILS |
| `app/api/admin/check/route.ts` | GET – returns `{ admin: boolean }` |
| `app/api/admin/users/route.ts` | GET – list users with filters |
| `app/api/admin/users/[id]/route.ts` | GET – user detail with reports, flags, events |
| `app/api/admin/users/[id]/review/route.ts` | PATCH – update fraudStatus, safetyStatus, verificationLevel |
| `app/api/admin/flags/route.ts` | GET – safety flags + fraud events |
| `app/api/admin/fraud-events/[id]/route.ts` | PATCH – mark event reviewed (metadata) |
| `app/api/admin/reports/route.ts` | GET – list reports |
| `app/admin/layout.tsx` | Admin layout with nav, access check |
| `app/admin/page.tsx` | Overview – flagged users |
| `app/admin/users/page.tsx` | Users list with search/filters |
| `app/admin/users/[id]/page.tsx` | User detail + review actions |
| `app/admin/flags/page.tsx` | Safety flags + fraud events |
| `app/admin/reports/page.tsx` | Reports list |

### Modified

| File | Change |
|------|--------|
| `middleware.ts` | Protect `/admin` (auth required) |
| `.env.example` | Added `ADMIN_EMAILS` |

## 4. Environment Variable

```env
ADMIN_EMAILS="admin@example.com,other@example.com"
```

## 5. How to Test

### Admin access protection

1. Log in as a non-admin user.
2. Open `/admin` → should redirect to `/dashboard`.
3. Call `GET /api/admin/users` → 403 Forbidden.
4. Add that user’s email to `ADMIN_EMAILS` and restart.
5. Open `/admin` again → should see the admin dashboard.

### Flagged user list

1. Log in as admin.
2. Open `/admin`.
3. If there are users with `fraudStatus !== "normal"` or `safetyStatus !== "low_risk"` or `flaggedReasons`, they should appear in the table.
4. Use “Review” to open `/admin/users/[id]`.

### User detail review

1. Go to `/admin/users` and click “Review” on a user.
2. Or go directly to `/admin/users/[id]`.
3. Verify reports, fraud events, safety flags, recent messages/trips.
4. Change fraud status, safety status, verification level.
5. Click “Save” → user record should update.

### Status update actions

1. In user detail, change “Fraud status” to `restricted`.
2. Click “Save”.
3. Reload the page and confirm the value persisted.
4. In the users list, filter by `fraudStatus=restricted` and confirm the user appears.

### Empty / error states

1. **No flagged users**: Open `/admin` with no flagged users → “No flagged users” message.
2. **No search results**: Search for a non-existent user → “No users found”.
3. **403**: Call admin APIs without being admin → 403 with “Forbidden”.
