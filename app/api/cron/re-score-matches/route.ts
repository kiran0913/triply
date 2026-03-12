import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aiMatchScore } from "@/lib/ai-match";
import { verifyCronSecret } from "@/lib/cron-guard";

export async function POST(request: NextRequest) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  try {
    const matches = await prisma.match.findMany({
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
      const { score } = await aiMatchScore(m.user1, m.user2);
      await prisma.match.update({
        where: { id: m.id },
        data: { matchScore: score },
      });
      updated++;
    }

    return NextResponse.json({ ok: true, updated });
  } catch (e) {
    console.error("[Cron re-score-matches] error:", e);
    return NextResponse.json(
      { error: "Failed to re-score matches" },
      { status: 500 }
    );
  }
}
