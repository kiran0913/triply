import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { isTripMember } from "@/lib/trip-helpers";
import { itineraryCommentSchema } from "@/lib/validations";

export async function GET(
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

    const comments = await prisma.itineraryItemComment.findMany({
      where: { itemId },
      include: {
        user: { select: { id: true, name: true, profilePhoto: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(comments);
  } catch (e) {
    console.error("[Itinerary comments GET] error:", e);
    return NextResponse.json({ error: "Failed to load comments" }, { status: 500 });
  }
}

export async function POST(
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
    const parsed = itineraryCommentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const comment = await prisma.itineraryItemComment.create({
      data: { itemId, userId, content: parsed.data.content },
      include: {
        user: { select: { id: true, name: true, profilePhoto: true } },
      },
    });
    return NextResponse.json(comment);
  } catch (e) {
    console.error("[Itinerary comments POST] error:", e);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}
