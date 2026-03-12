import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    const reviews = await prisma.review.findMany({
      where: { reviewedUserId: userId },
      include: {
        reviewer: {
          select: { id: true, name: true, profilePhoto: true },
        },
        trip: {
          select: { id: true, destination: true, startDate: true, endDate: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(reviews);
  } catch (e) {
    console.error("Get reviews error:", e);
    return NextResponse.json(
      { error: "Failed to load reviews" },
      { status: 500 }
    );
  }
}
