/**
 * Lightweight AI usage tracking for cost monitoring.
 */

import { prisma } from "./prisma";

export async function recordAIUsage(
  userId: string,
  endpoint: string,
  tokensUsed: number
): Promise<void> {
  try {
    await prisma.aIUsage.create({
      data: { userId, endpoint, tokensUsed },
    });
  } catch (e) {
    console.error("[AI Usage] Failed to record:", e);
  }
}
