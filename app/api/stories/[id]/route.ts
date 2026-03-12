import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = await getCurrentUserId(_request);

    const story = await prisma.travelStory.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, profilePhoto: true },
        },
        trip: {
          select: { id: true, title: true, destination: true, slug: true },
        },
        _count: { select: { likes: true, comments: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          take: 50,
          include: {
            user: {
              select: { id: true, name: true, profilePhoto: true },
            },
          },
        },
      },
    });

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    let userLiked = false;
    if (userId) {
      const like = await prisma.storyLike.findUnique({
        where: { storyId_userId: { storyId: id, userId } },
      });
      userLiked = !!like;
    }

    return NextResponse.json({
      ...story,
      likesCount: story._count.likes,
      commentsCount: story._count.comments,
      userLiked,
    });
  } catch (e) {
    console.error("[Story GET] error:", e);
    return NextResponse.json({ error: "Failed to load story" }, { status: 500 });
  }
}
