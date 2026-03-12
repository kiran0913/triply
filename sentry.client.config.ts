import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  sendDefaultPii: false,
  beforeSend(event, hint) {
    const error = hint.originalException;
    if (error && typeof error === "object" && "message" in error) {
      const msg = String((error as Error).message);
      if (msg.includes("JWT_SECRET") || msg.includes("password") || msg.includes("token")) {
        return null;
      }
    }
    return event;
  },
});
