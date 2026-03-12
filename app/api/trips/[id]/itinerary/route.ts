import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { isTripMember } from "@/lib/trip-helpers";
import { itineraryItemSchema } from "@/lib/validations";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(_request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: tripId } = await params;

    const member = await isTripMember(tripId, userId);
    if (!member) {
      return NextResponse.json({ error: "Not a trip member" }, { status: 403 });
    }

    const items = await prisma.itineraryItem.findMany({
      where: { tripId },
      include: {
        addedBy: { select: { id: true, name: true, profilePhoto: true } },
        votes: { select: { userId: true } },
        _count: { select: { comments: true } },
      },
      orderBy: [{ dayNumber: "asc" }, { position: "asc" }, { createdAt: "asc" }],
    });

    const enriched = items.map((item) => ({
      ...item,
      voteCount: item.votes.length,
      userVoted: item.votes.some((v) => v.userId === userId),
      commentCount: item._count.comments,
      votes: undefined,
      _count: undefined,
    }));

    return NextResponse.json(enriched);
  } catch (e) {
    console.error("[Itinerary GET] error:", e);
    return NextResponse.json({ error: "Failed to load itinerary" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: tripId } = await params;

    const member = await isTripMember(tripId, userId);
    if (!member) {
      return NextResponse.json({ error: "Not a trip member" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = itineraryItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const maxPos = await prisma.itineraryItem.findFirst({
      where: { tripId, dayNumber: parsed.data.dayNumber },
      orderBy: { position: "desc" },
      select: { position: true },
    });
    const position = (maxPos?.position ?? -1) + 1;

    const item = await prisma.itineraryItem.create({
      data: {
        tripId,
        addedById: userId,
        dayNumber: parsed.data.dayNumber,
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        costEstimate: parsed.data.costEstimate ?? null,
        startTime: parsed.data.startTime ?? null,
        endTime: parsed.data.endTime ?? null,
        position,
      },
      include: {
        addedBy: { select: { id: true, name: true, profilePhoto: true } },
        _count: { select: { comments: true } },
      },
    });

    return NextResponse.json({
      ...item,
      voteCount: 0,
      userVoted: false,
      commentCount: item._count.comments,
    });
  } catch (e) {
    console.error("[Itinerary POST] error:", e);
    return NextResponse.json({ error: "Failed to add itinerary item" }, { status: 500 });
  }
}
