import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { isTripMember } from "@/lib/trip-helpers";
import { itineraryItemSchema } from "@/lib/validations";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: tripId, itemId } = await params;

    const member = await isTripMember(tripId, userId);
    if (!member) {
      return NextResponse.json({ error: "Not a trip member" }, { status: 403 });
    }

    const item = await prisma.itineraryItem.findFirst({
      where: { id: itemId, tripId },
    });
    if (!item) {
      return NextResponse.json({ error: "Itinerary item not found" }, { status: 404 });
    }

    const body = await request.json();

    if ("completed" in body && typeof body.completed === "boolean") {
      const updated = await prisma.itineraryItem.update({
        where: { id: itemId },
        data: { completedAt: body.completed ? new Date() : null },
        include: {
          addedBy: { select: { id: true, name: true, profilePhoto: true } },
          votes: { select: { userId: true } },
          _count: { select: { comments: true } },
        },
      });
      return NextResponse.json({
        ...updated,
        voteCount: updated.votes.length,
        userVoted: updated.votes.some((v) => v.userId === userId),
        commentCount: updated._count.comments,
      });
    }

    const parsed = itineraryItemSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await prisma.itineraryItem.update({
      where: { id: itemId },
      data: parsed.data,
      include: {
        addedBy: { select: { id: true, name: true, profilePhoto: true } },
        votes: { select: { userId: true } },
        _count: { select: { comments: true } },
      },
    });

    return NextResponse.json({
      ...updated,
      voteCount: updated.votes.length,
      userVoted: updated.votes.some((v) => v.userId === userId),
      commentCount: updated._count.comments,
    });
  } catch (e) {
    console.error("[Itinerary PATCH] error:", e);
    return NextResponse.json({ error: "Failed to update itinerary item" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const userId = await getCurrentUserId(_request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: tripId, itemId } = await params;

    const member = await isTripMember(tripId, userId);
    if (!member) {
      return NextResponse.json({ error: "Not a trip member" }, { status: 403 });
    }

    const item = await prisma.itineraryItem.findFirst({
      where: { id: itemId, tripId },
    });
    if (!item) {
      return NextResponse.json({ error: "Itinerary item not found" }, { status: 404 });
    }

    await prisma.itineraryItem.delete({ where: { id: itemId } });
    return NextResponse.json({ deleted: true });
  } catch (e) {
    console.error("[Itinerary DELETE] error:", e);
    return NextResponse.json({ error: "Failed to delete itinerary item" }, { status: 500 });
  }
}
