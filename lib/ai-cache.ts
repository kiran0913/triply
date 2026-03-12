/**
 * AI response caching to reduce OpenAI API costs.
 * Stores identical requests in DB, returns cached result if valid.
 */

import { createHash } from "crypto";
import { prisma } from "./prisma";

function hashRequest(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export async function getAICache<T>(
  requestHash: string,
  endpoint: string
): Promise<T | null> {
  const row = await prisma.aICache.findFirst({
    where: {
      requestHash,
      endpoint,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!row) return null;
  try {
    return JSON.parse(row.responseJSON) as T;
  } catch {
    return null;
  }
}

export async function setAICache(
  requestHash: string,
  cacheKey: string,
  endpoint: string,
  response: unknown,
  expiresAt: Date
): Promise<void> {
  await prisma.aICache.create({
    data: {
      requestHash,
      cacheKey,
      endpoint,
      responseJSON: JSON.stringify(response),
      expiresAt,
    },
  });
}

export function buildRequestHash(parts: Record<string, unknown>): string {
  const normalized = JSON.stringify(parts, Object.keys(parts).sort());
  return hashRequest(normalized);
}
