import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/lib/admin-guard";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminUserId(request);
  if (!adminId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        reportsReceived: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            reporter: { select: { id: true, name: true, email: true } },
          },
        },
        fraudEvents: {
          take: 20,
          orderBy: { createdAt: "desc" },
        },
        safetyFlags: {
          take: 20,
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            sentMessages: true,
            savedProfiles: true,
            hostedTrips: true,
            reportsReceived: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const recentMessages = await prisma.message.findMany({
      where: { senderId: id },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, content: true, createdAt: true },
    });

    const recentTrips = await prisma.trip.findMany({
      where: { hostUserId: id },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        destination: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      ...user,
      recentMessages,
      recentTrips,
    });
  } catch (e) {
    console.error("[Admin user detail] error:", e);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
