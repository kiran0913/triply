import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { aiMatchScore, ruleBasedMatchScore } from "@/lib/ai-match";

const MAX_AI_SCORE_BATCH = 15; // Use AI for at most N users to avoid rate limits

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const discover = searchParams.get("discover") === "1";
    const destination = searchParams.get("destination")?.trim();
    const travelStyle = searchParams.get("travelStyle")?.trim();
    const interests = searchParams.get("interests")?.trim();
    const budgetRange = searchParams.get("budgetRange")?.trim();
    const verifiedOnly = searchParams.get("verified") === "1";

    if (discover) {
      const [currentUser, existingMatches, allUsers] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { travelStyle: true, interests: true, budgetRange: true },
        }),
        prisma.match.findMany({
          where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
          select: { user1Id: true, user2Id: true },
        }),
        prisma.user.findMany({
          where: { id: { not: userId } },
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            location: true,
            bio: true,
            travelStyle: true,
            interests: true,
            verified: true,
            verificationLevel: true,
            budgetRange: true,
          },
        }),
      ]);

      if (!currentUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const matchedIds = new Set(
        existingMatches.flatMap((m) =>
          m.user1Id === userId ? [m.user2Id] : [m.user1Id]
        )
      );
      let potential = allUsers.filter((u) => !matchedIds.has(u.id));

      if (destination) {
        const dest = destination.toLowerCase();
        potential = potential.filter(
          (u) =>
            (u.location?.toLowerCase().includes(dest)) ||
            (typeof u.bio === "string" && u.bio.toLowerCase().includes(dest))
        );
      }
      if (travelStyle) {
        const style = travelStyle.toLowerCase();
        potential = potential.filter((u) => {
          const styles = Array.isArray(u.travelStyle) ? u.travelStyle : [];
          return styles.some((s: unknown) =>
            String(s).toLowerCase().includes(style)
          );
        });
      }
      if (interests) {
        const interest = interests.toLowerCase();
        potential = potential.filter((u) => {
          const ints = Array.isArray(u.interests) ? u.interests : [];
          return ints.some((i: unknown) =>
            String(i).toLowerCase().includes(interest)
          );
        });
      }
      if (budgetRange) {
        const budget = budgetRange.toLowerCase();
        potential = potential.filter(
          (u) => u.budgetRange?.toLowerCase().includes(budget)
        );
      }
      if (verifiedOnly) {
        potential = potential.filter((u) => u.verified);
      }

      type ScoredUser = (typeof potential)[0] & {
        matchScore: number;
        matchReasons?: string[];
      };

      const useAI = potential.length <= MAX_AI_SCORE_BATCH;
      const withScores: ScoredUser[] = [];

      if (useAI) {
        const results = await Promise.all(
          potential.map(async (u) => {
            const result = await aiMatchScore(
              { ...currentUser, name: "Current user" },
              { ...u, name: u.name }
            );
            return { ...u, matchScore: result.score, matchReasons: result.reasons };
          })
        );
        withScores.push(...results);
      } else {
        for (const u of potential) {
          const result = ruleBasedMatchScore(currentUser, u);
          withScores.push({ ...u, matchScore: result.score, matchReasons: result.reasons });
        }
      }

      withScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

      return NextResponse.json(
        withScores.map((u) => {
          const level = (u as { verificationLevel?: string | null }).verificationLevel ?? "basic";
          return {
            ...u,
            matchPercent: u.matchScore,
            image: u.profilePhoto,
            verificationStatus: { level, trustedBadge: level === "verified" || level === "trusted" },
            ...(u.matchReasons && u.matchReasons.length > 0 && { matchReasons: u.matchReasons }),
          };
        })
      );
    }

    const matches = await prisma.match.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            location: true,
            bio: true,
            travelStyle: true,
            interests: true,
            verified: true,
          },
        },
        user2: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            location: true,
            bio: true,
            travelStyle: true,
            interests: true,
            verified: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enriched = matches.map((m) => {
      const other = m.user1Id === userId ? m.user2 : m.user1;
      return {
        id: m.id,
        matchScore: m.matchScore,
        createdAt: m.createdAt,
        user: other,
      };
    });

    return NextResponse.json(enriched);
  } catch (e) {
    console.error("Matches error:", e);
    return NextResponse.json({ error: "Failed to get matches" }, { status: 500 });
  }
}
