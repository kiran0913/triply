import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callOllama, isLocalAIEnabled } from "@/lib/ai-local";
import { verifyCronSecret } from "@/lib/cron-guard";

/**
 * Refreshes AI trip recommendations by warming the pipeline.
 * Uses local Ollama. Results can be cached by user requests.
 */
export async function POST(request: NextRequest) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  if (!isLocalAIEnabled()) {
    return NextResponse.json(
      { ok: false, message: "Local AI not available (set ENABLE_LOCAL_AI=true, run Ollama)" },
      { status: 503 }
    );
  }

  try {
    const users = await prisma.user.findMany({
      select: { id: true, interests: true, travelStyle: true, budgetRange: true, languages: true },
      take: 50,
    });

    const trips = await prisma.trip.findMany({
      where: { status: "OPEN" },
      include: {
        host: { select: { id: true, name: true } },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 15,
    });

    if (trips.length === 0) {
      return NextResponse.json({ ok: true, usersProcessed: 0 });
    }

    const tripsSummary = trips
      .map(
        (t) =>
          `{ "id": "${t.id}", "destination": "${t.destination}", "title": "${t.title}", "travelStyle": "${t.travelStyle ?? ""}", "budget": "${t.budget ?? ""}", "description": "${(t.description ?? "").slice(0, 80)}" }`
      )
      .join("\n");

    let processed = 0;
    for (const user of users) {
      const userProfile = `Interests: ${JSON.stringify(user.interests)}, Travel style: ${JSON.stringify(user.travelStyle)}, Budget: ${user.budgetRange ?? "flexible"}`;
      const prompt = `You are a travel recommendation system. Rank these trips by relevance for a user.
User profile: ${userProfile}
Trips:
${tripsSummary}
Return a JSON object: {"trips":[{"id":"trip-id","matchPercent":94},...]}
Only include IDs that exist in the list. Ordered by relevance (best first).`;

      await callOllama(prompt, { maxTokens: 500 });
      processed++;
    }

    return NextResponse.json({ ok: true, usersProcessed: processed });
  } catch (e) {
    console.error("[Cron refresh-trip-recommendations] error:", e);
    return NextResponse.json(
      { error: "Failed to refresh trip recommendations" },
      { status: 500 }
    );
  }
}
