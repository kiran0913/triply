import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { storyCommentSchema } from "@/lib/validations";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: storyId } = await params;

    const body = await request.json();
    const parsed = storyCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const story = await prisma.travelStory.findUnique({ where: { id: storyId } });
    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 });
    }

    const comment = await prisma.storyComment.create({
      data: {
        storyId,
        userId,
        content: parsed.data.content,
      },
      include: {
        user: {
          select: { id: true, name: true, profilePhoto: true },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (e) {
    console.error("[Story comment] error:", e);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}
