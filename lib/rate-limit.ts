/**
 * In-memory rate limiter for Vercel serverless.
 * Uses fixed window per IP. Limits are per-instance (not shared across invocations).
 */

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

function prune() {
  const now = Date.now();
  for (const [k, v] of Array.from(store.entries())) {
    if (v.resetAt < now) store.delete(k);
  }
}

/** Returns 429 Response if rate limited, null if ok. */
export function checkRateLimit(
  request: Request,
  keyPrefix: string,
  limit: number,
  windowSec: number
): Response | null {
  if (store.size > 10000) prune();

  const ip = getClientIp(request);
  const key = `${keyPrefix}:${ip}`;
  return checkRateLimitByKey(key, limit, windowSec);
}

/** Per-user AI rate limit: 10 calls per hour. Call after getCurrentUserId. */
export function checkAiRateLimit(userId: string): Response | null {
  if (store.size > 10000) prune();
  const key = `ai-user:${userId}`;
  return checkRateLimitByKey(key, 10, 3600);
}

function checkRateLimitByKey(
  key: string,
  limit: number,
  windowSec: number
): Response | null {
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const entry = store.get(key);

  let count: number;
  let resetAt: number;

  if (!entry || entry.resetAt < now) {
    count = 1;
    resetAt = now + windowMs;
    store.set(key, { count, resetAt });
  } else {
    count = entry.count + 1;
    entry.count = count;
    resetAt = entry.resetAt;
  }

  if (count > limit) {
    const retryAfter = Math.ceil((resetAt - now) / 1000);
    return new Response(
      JSON.stringify({ error: "Too many requests. Please try again later." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.max(1, retryAfter)),
        },
      }
    );
  }
  return null;
}
