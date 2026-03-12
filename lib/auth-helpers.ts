import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import * as Sentry from "@sentry/nextjs";
import { verifyToken, getTokenFromRequest } from "./auth";

export async function getCurrentUserId(request: NextRequest): Promise<string | null> {
  const token =
    getTokenFromRequest(request.headers) ||
    (await cookies()).get("auth-token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  const userId = payload?.userId ?? null;
  if (userId) {
    try {
      Sentry.setUser({ id: userId });
    } catch {
      /* Sentry may not be initialized */
    }
  }
  return userId;
}
