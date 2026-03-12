# Email Verification Flow

## 1. What Exists

- **User model**: `emailVerified DateTime?` – set when user clicks verification link
- **Auth**: JWT cookies, register no longer auto-sets `emailVerified`
- **Verification Center**: UI for verification status; now shows "Send verification email" when not verified

## 2. Architecture

- **EmailVerificationToken**: Stores hashed token + expiry per user
- **Token flow**: Generate random 64-char hex → hash with SHA-256 → store hash + expiry (24h)
- **Single-use**: Token is deleted after successful verification
- **Resend**: Sends HTML emails; falls back to `onboarding@resend.dev` if no custom domain

## 3. Files Created or Modified

### Created

| File | Purpose |
|------|---------|
| `lib/email-verification.ts` | Token generation, hashing, consume |
| `lib/email.ts` | Resend client, `sendVerificationEmail` |
| `app/api/verification/send-email/route.ts` | POST – create token, send email |
| `app/api/verification/confirm/route.ts` | GET – validate token, set emailVerified |
| `app/verify-email/page.tsx` | Result page: success / expired / invalid |

### Modified

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Added `EmailVerificationToken` model |
| `app/api/auth/register/route.ts` | Removed auto-verify; send verification email on signup (if configured) |
| `app/(dashboard)/verification/page.tsx` | Resend button, loading/success/error states |
| `.env.example` | Added RESEND_API_KEY, APP_BASE_URL |

## 4. Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `RESEND_API_KEY` | Yes (for emails) | Resend API key from dashboard |
| `APP_BASE_URL` | Yes | Base URL for verification links (e.g. https://your-app.com) |
| `EMAIL_FROM` | No | From address (default: onboarding@resend.dev) |
| `NEXT_PUBLIC_APP_URL` | No | Fallback if APP_BASE_URL not set |

Without `RESEND_API_KEY`, signup still works; no verification email is sent. Users can request one from Verification Center, which returns 503 if email is not configured.

## 5. Database Migration

```bash
npx prisma db push
# or
npx prisma migrate dev --name add_email_verification_token
```

## 6. How to Test

### Signup flow

1. Set `RESEND_API_KEY` and `APP_BASE_URL`.
2. Sign up with a real email.
3. Confirm an email arrives with a verification link.
4. Click the link → success page; `emailVerified` set.

### Resend verification email

1. Log in as an unverified user.
2. Open Verification Center.
3. Click "Send verification email" → new email sent.
4. Old tokens are invalidated; only the latest link works.

### Valid token

1. Click a fresh verification link.
2. `/verify-email?token=...` → loading → success.
3. Verification Center shows "Email verified ✓".

### Expired token

1. Wait 24 hours or manually expire the token in the DB.
2. Click the old link → "Link expired" page.
3. Request a new link from Verification Center.

### Invalid token

1. Open `/verify-email?token=invalid123` → "Invalid link".
2. Or click a link twice (second time) → "Invalid link" (already used).

### Already verified user

1. Log in as a verified user.
2. POST `/api/verification/send-email` → `{ sent: false, message: "Email already verified" }`.
3. Verification Center shows "Done" with no resend button.
