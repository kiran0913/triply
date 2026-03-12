import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Public trip by slug. No auth required.
 * Returns trip data for public landing page when isPublic and status OPEN.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Slug required" }, { status: 400 });
    }

    const trip = await prisma.trip.findUnique({
      where: {
        slug,
        isPublic: true,
        status: "OPEN",
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            location: true,
            bio: true,
          },
        },
        _count: { select: { members: true } },
        itineraryItems: {
          orderBy: [{ dayNumber: "asc" }, { position: "asc" }],
          take: 20,
          select: {
            dayNumber: true,
            title: true,
            description: true,
            startTime: true,
            costEstimate: true,
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const response = {
      id: trip.id,
      slug: trip.slug,
      title: trip.title,
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      budget: trip.budget,
      travelStyle: trip.travelStyle,
      description: trip.description,
      shareImage: trip.shareImage,
      host: trip.host,
      memberCount: trip._count.members,
      itineraryItems: trip.itineraryItems,
    };

    return NextResponse.json(response);
  } catch (e) {
    console.error("[Public trip by slug] error:", e);
    return NextResponse.json({ error: "Failed to load trip" }, { status: 500 });
  }
}
