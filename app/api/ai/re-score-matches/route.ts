import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { aiMatchScore } from "@/lib/ai-match";
import { checkRateLimit, checkAiRateLimit } from "@/lib/rate-limit";

/**
 * Re-score all matches for the current user.
 * Call periodically or when profile changes to refresh matchScore in DB.
 */
export async function POST(request: NextRequest) {
  const rateLimitRes = checkRateLimit(request, "ai", 10, 60);
  if (rateLimitRes) return rateLimitRes;

  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const aiLimitRes = checkAiRateLimit(userId);
    if (aiLimitRes) return aiLimitRes;

    const matches = await prisma.match.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
      include: {
        user1: {
          select: {
            travelStyle: true,
            interests: true,
            budgetRange: true,
            languages: true,
            bio: true,
            name: true,
          },
        },
        user2: {
          select: {
            travelStyle: true,
            interests: true,
            budgetRange: true,
            languages: true,
            bio: true,
            name: true,
          },
        },
      },
    });

    let updated = 0;
    for (const m of matches) {
      const me = m.user1Id === userId ? m.user1 : m.user2;
      const other = m.user1Id === userId ? m.user2 : m.user1;
      const { score } = await aiMatchScore(me, other);
      await prisma.match.update({
        where: { id: m.id },
        data: { matchScore: score },
      });
      updated++;
    }

    return NextResponse.json({ updated });
  } catch (e) {
    console.error("[AI Re-score] error:", e);
    return NextResponse.json(
      { error: "Failed to re-score matches" },
      { status: 500 }
    );
  }
}
