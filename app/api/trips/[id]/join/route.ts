import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { createNotification } from "@/lib/notifications";

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
      include: { members: true },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (trip.status !== "OPEN") {
      return NextResponse.json(
        { error: "Trip is not open for new members" },
        { status: 400 }
      );
    }

    if (trip.hostUserId === userId) {
      return NextResponse.json(
        { error: "You are already the host" },
        { status: 400 }
      );
    }

    const existing = trip.members.find((m) => m.userId === userId);
    if (existing) {
      return NextResponse.json(
        { error: "You are already a member" },
        { status: 400 }
      );
    }

    const joiner = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    const joinerName = joiner?.name ?? "Someone";

    await prisma.tripMember.create({
      data: { tripId, userId, role: "MEMBER" },
    });

    await createNotification({
      userId: trip.hostUserId,
      type: "trip_join",
      title: `${joinerName} joined your trip`,
      body: trip.destination,
      link: `/trips/${tripId}`,
    });

    const updated = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        host: {
          select: { id: true, name: true, profilePhoto: true, location: true },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profilePhoto: true,
                location: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (e) {
    console.error("Join trip error:", e);
    return NextResponse.json(
      { error: "Failed to join trip" },
      { status: 500 }
    );
  }
}
