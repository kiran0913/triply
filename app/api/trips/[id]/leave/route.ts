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

    const { id: tripId } = await params;

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (trip.hostUserId === userId) {
      return NextResponse.json(
        { error: "Host cannot leave. Delete the trip instead." },
        { status: 400 }
      );
    }

    await prisma.tripMember.delete({
      where: {
        tripId_userId: { tripId, userId },
      },
    });

    return NextResponse.json({ left: true }, { status: 200 });
  } catch (e) {
    console.error("Leave trip error:", e);
    return NextResponse.json(
      { error: "Failed to leave trip" },
      { status: 500 }
    );
  }
}
