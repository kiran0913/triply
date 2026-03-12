import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Public trips index. No auth required.
 * Returns OPEN, isPublic trips ordered by member count (popularity).
 */
export async function GET(_request: NextRequest) {
  try {
    const trips = await prisma.trip.findMany({
      where: { isPublic: true, status: "OPEN", slug: { not: null } },
      include: {
        host: {
          select: { id: true, name: true, profilePhoto: true },
        },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 24,
    });

    const result = trips.map((t) => ({
      id: t.id,
      slug: t.slug,
      title: t.title,
      destination: t.destination,
      startDate: t.startDate,
      endDate: t.endDate,
      budget: t.budget,
      memberCount: t._count.members,
      host: t.host,
    }));

    return NextResponse.json(result);
  } catch (e) {
    console.error("[Public trips] error:", e);
    return NextResponse.json({ error: "Failed to load trips" }, { status: 500 });
  }
}
