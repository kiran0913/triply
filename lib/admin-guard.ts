/**
 * Admin access guard - MVP approach.
 * Uses ADMIN_EMAILS env var (comma-separated) to allow specific users.
 * No schema changes. Safe and minimal.
 */

import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";

function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Returns userId if the current request belongs to an admin, null otherwise.
 */
export async function getAdminUserId(request: NextRequest): Promise<string | null> {
  const userId = await getCurrentUserId(request);
  if (!userId) return null;

  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!user?.email) return null;

  return adminEmails.includes(user.email.toLowerCase()) ? userId : null;
}
