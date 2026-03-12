# Sentry Error Monitoring

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SENTRY_DSN` | Yes (for monitoring) | Server/edge DSN from Sentry project settings |
| `NEXT_PUBLIC_SENTRY_DSN` | Yes (for client) | Same DSN – must be public for browser errors |
| `SENTRY_ORG` | Optional | For source map uploads |
| `SENTRY_PROJECT` | Optional | For source map uploads |
| `SENTRY_AUTH_TOKEN` | Optional | Auth token for source map uploads |

Without `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN`, Sentry is disabled and no events are sent.

## Files Touched

- `sentry.client.config.ts` – client-side init
- `sentry.server.config.ts` – server-side init
- `sentry.edge.config.ts` – edge init
- `instrumentation.ts` – registers configs, `onRequestError` for request errors
- `app/global-error.tsx` – captures React render errors
- `next.config.js` – wrapped with `withSentryConfig`
- `lib/auth-helpers.ts` – sets `Sentry.setUser({ id: userId })` when auth succeeds
- `lib/sentry.ts` – `captureApiError()` helper for API catch blocks

## Capturing API Errors

`onRequestError` captures unhandled request errors. For handled errors in catch blocks, use:

```ts
import { captureApiError } from "@/lib/sentry";

try {
  // ...
} catch (e) {
  console.error("...", e);
  captureApiError(e);
  return NextResponse.json({ error: "..." }, { status: 500 });
}
```

## How to Test Error Capture

1. Set `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN` in `.env`.
2. Run `npm run dev`.
3. **Client error:** Visit any page, open DevTools Console, throw: `throw new Error("Test client error")` – event should appear in Sentry.
4. **React error:** Temporarily add `throw new Error("Test React error")` in a component render – should show in Sentry.
5. **API error:** Hit a route that throws (or add a test route that throws) – event should appear with `userId` if the request was authenticated.

## Security

- `sendDefaultPii: false` – no automatic PII
- `beforeSend` filters errors mentioning JWT_SECRET, password, token
- Only `userId` (opaque ID) is attached, no tokens or secrets
