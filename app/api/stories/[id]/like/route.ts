import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(_request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: storyId } = await params;

    const story = await prisma.travelStory.findUnique({ where: { id: storyId } });
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const existing = await prisma.storyLike.findUnique({
      where: { storyId_userId: { storyId, userId } },
    });

    if (existing) {
      await prisma.storyLike.delete({
        where: { storyId_userId: { storyId, userId } },
      });
      const count = await prisma.storyLike.count({ where: { storyId } });
      return NextResponse.json({ liked: false, likesCount: count });
    }

    await prisma.storyLike.create({
      data: { storyId, userId },
    });
    const count = await prisma.storyLike.count({ where: { storyId } });
    return NextResponse.json({ liked: true, likesCount: count });
  } catch (e) {
    console.error("[Story like] error:", e);
    return NextResponse.json({ error: "Failed to update like" }, { status: 500 });
  }
}
