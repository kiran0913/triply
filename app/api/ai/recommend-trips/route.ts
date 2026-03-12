import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { isLocalAIEnabled } from "@/lib/ai-local";
import { checkRateLimit, checkAiRateLimit } from "@/lib/rate-limit";
import { generateRecommendations } from "@/lib/ai-service";
import { buildRequestHash } from "@/lib/ai-cache";

type TripWithHost = {
  id: string;
  title: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  budget: string | null;
  travelStyle: string | null;
  description: string | null;
  host: { id: string; name: string | null };
  _count: { members: number };
};

export interface RecommendedTrip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string | null;
  travelStyle: string | null;
  matchPercent: number;
  hostName: string | null;
  membersCount: number;
}

export async function GET(request: NextRequest) {
  const rateLimitRes = checkRateLimit(request, "ai", 10, 60);
  if (rateLimitRes) return rateLimitRes;

  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const aiLimitRes = checkAiRateLimit(userId);
    if (aiLimitRes) return aiLimitRes;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        interests: true,
        travelStyle: true,
        budgetRange: true,
        languages: true,
      },
    });

    const trips = await prisma.trip.findMany({
      where: { status: "OPEN" },
      include: {
        host: { select: { id: true, name: true } },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }) as TripWithHost[];

    if (trips.length === 0) {
      return NextResponse.json([]);
    }

    if (!isLocalAIEnabled()) {
      return NextResponse.json(
        trips.slice(0, 10).map((t) => ({
          id: t.id,
          title: t.title,
          destination: t.destination,
          startDate: t.startDate.toISOString(),
          endDate: t.endDate.toISOString(),
          budget: t.budget,
          travelStyle: t.travelStyle,
          matchPercent: 75,
          hostName: t.host.name,
          membersCount: t._count.members,
        }))
      );
    }

    const requestPayload = {
      user: {
        interests: user?.interests ?? [],
        travelStyle: user?.travelStyle ?? [],
        budgetRange: user?.budgetRange ?? "",
        languages: user?.languages ?? [],
      },
      tripIds: trips.map((t) => t.id).sort(),
    };
    const requestHash = buildRequestHash(requestPayload);
    const cacheKey = `recommend-trips:${userId}:${trips.map((t) => t.id).join(",")}`;

    const userProfile = user
      ? `Interests: ${JSON.stringify(user.interests)}, Style: ${JSON.stringify(user.travelStyle)}, Budget: ${user.budgetRange ?? "flex"}`
      : "No profile";

    const tripsSummary = trips
      .slice(0, 15)
      .map(
        (t) =>
          `{"id":"${t.id}","dest":"${t.destination}","title":"${t.title}","style":"${t.travelStyle ?? ""}","budget":"${t.budget ?? ""}"}`
      )
      .join("\n");

    const { content, cachedOutput, source } = await generateRecommendations(
      { userProfile, tripsSummary },
      cacheKey,
      requestHash
    );

    if (cachedOutput && Array.isArray(cachedOutput)) {
      return NextResponse.json(cachedOutput);
    }

    const idToScore = new Map<string, number>();
    if (content) {
      try {
        const parsed = JSON.parse(content) as {
          trips?: Array<{ id?: string; matchPercent?: number }>;
        };
        const arr = Array.isArray(parsed?.trips) ? parsed.trips : [];
        for (const item of arr) {
          if (item?.id && typeof item.matchPercent === "number") {
            idToScore.set(
              item.id,
              Math.min(100, Math.max(0, Math.round(item.matchPercent)))
            );
          }
        }
      } catch {
        /* fallback */
      }
    }

    const recommended: RecommendedTrip[] = trips.map((t) => ({
      id: t.id,
      title: t.title,
      destination: t.destination,
      startDate: t.startDate.toISOString(),
      endDate: t.endDate.toISOString(),
      budget: t.budget,
      travelStyle: t.travelStyle,
      matchPercent: idToScore.get(t.id) ?? 75,
      hostName: t.host.name,
      membersCount: t._count.members,
    }));

    recommended.sort((a, b) => b.matchPercent - a.matchPercent);
    return NextResponse.json(recommended.slice(0, 10));
  } catch (e) {
    console.error("[AI Recommend Trips] error:", e);
    return NextResponse.json(
      { error: "Failed to get recommendations" },
      { status: 500 }
    );
  }
}
