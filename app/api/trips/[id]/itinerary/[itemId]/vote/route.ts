import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { isTripMember } from "@/lib/trip-helpers";

export async function POST(
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

    const existing = await prisma.itineraryItemVote.findUnique({
      where: { itemId_userId: { itemId, userId } },
    });

    if (existing) {
      await prisma.itineraryItemVote.delete({
        where: { itemId_userId: { itemId, userId } },
      });
      return NextResponse.json({ voted: false });
    }

    await prisma.itineraryItemVote.create({
      data: { itemId, userId },
    });
    return NextResponse.json({ voted: true });
  } catch (e) {
    console.error("[Itinerary vote] error:", e);
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 });
  }
}
