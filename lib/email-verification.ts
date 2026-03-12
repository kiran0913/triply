/**
 * Email verification token logic.
 * Generate, hash, verify. Token is single-use.
 */

import { randomBytes, createHash } from "crypto";
import { prisma } from "./prisma";

const TOKEN_BYTES = 32;
const EXPIRY_HOURS = 24;

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString("hex");
}

export function getExpiry(): Date {
  const d = new Date();
  d.setHours(d.getHours() + EXPIRY_HOURS);
  return d;
}

export async function createVerificationToken(userId: string): Promise<string> {
  await prisma.emailVerificationToken.deleteMany({ where: { userId } });

  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = getExpiry();

  await prisma.emailVerificationToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return token;
}

export async function consumeVerificationToken(
  token: string
): Promise<{ userId: string } | { error: "invalid" | "expired" | "used" }> {
  const tokenHash = hashToken(token);

  const record = await prisma.emailVerificationToken.findFirst({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record) return { error: "invalid" };
  if (record.expiresAt < new Date()) return { error: "expired" };

  await prisma.emailVerificationToken.delete({ where: { id: record.id } });

  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: new Date() },
  });

  return { userId: record.userId };
}
