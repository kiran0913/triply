import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { createNotification } from "@/lib/notifications";
import { aiMatchScore } from "@/lib/ai-match";
import { maybeRecordRapidSaves } from "@/lib/fraud";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: savedUserId } = await params;
    if (userId === savedUserId) {
      return NextResponse.json(
        { error: "Cannot save your own profile" },
        { status: 400 }
      );
    }

    await maybeRecordRapidSaves(userId).catch(() => {});

    await prisma.savedProfile.upsert({
      where: {
        userId_savedUserId: { userId, savedUserId },
      },
      create: { userId, savedUserId },
      update: {},
    });

    const [me, other] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { travelStyle: true, interests: true, budgetRange: true, languages: true, bio: true, name: true },
      }),
      prisma.user.findUnique({
        where: { id: savedUserId },
        select: { travelStyle: true, interests: true, budgetRange: true, languages: true, bio: true, name: true },
      }),
    ]);
    if (me && other) {
      const { score } = await aiMatchScore(me, other);
      const existing = await prisma.match.findFirst({
        where: {
          OR: [
            { user1Id: userId, user2Id: savedUserId },
            { user1Id: savedUserId, user2Id: userId },
          ],
        },
      });
      if (existing) {
        await prisma.match.update({ where: { id: existing.id }, data: { matchScore: score } });
      } else {
        await prisma.match.create({
          data: { user1Id: userId, user2Id: savedUserId, matchScore: score },
        });
      }
    }

    const saver = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    const saverName = saver?.name ?? "Someone";
    await createNotification({
      userId: savedUserId,
      type: "profile_saved",
      title: `${saverName} saved your profile`,
      link: `/profile/${userId}`,
    });

    return NextResponse.json({ saved: true });
  } catch (e) {
    console.error("Save profile error:", e);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
