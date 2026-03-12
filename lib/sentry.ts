import * as Sentry from "@sentry/nextjs";

/**
 * Capture an error from API routes. Call this in catch blocks.
 * userId is attached automatically when getCurrentUserId was called earlier in the request.
 */
export function captureApiError(error: unknown): void {
  if (!process.env.SENTRY_DSN) return;
  Sentry.captureException(error);
}
