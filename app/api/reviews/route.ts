import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { reviewSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { reviewedUserId, rating, comment, tripId } = parsed.data;

    if (reviewedUserId === userId) {
      return NextResponse.json(
        { error: "Cannot review yourself" },
        { status: 400 }
      );
    }

    const reviewedUser = await prisma.user.findUnique({
      where: { id: reviewedUserId },
    });
    if (!reviewedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (tripId) {
      const trip = await prisma.trip.findUnique({
        where: { id: tripId },
        include: { members: true },
      });
      if (!trip) {
        return NextResponse.json({ error: "Trip not found" }, { status: 404 });
      }
      const isReviewerMember = trip.members.some((m) => m.userId === userId);
      const isReviewedMember = trip.members.some(
        (m) => m.userId === reviewedUserId
      );
      if (!isReviewerMember || !isReviewedMember) {
        return NextResponse.json(
          { error: "Both users must be trip members to link review to trip" },
          { status: 400 }
        );
      }
      const tripEnded = trip.status === "CLOSED" || new Date(trip.endDate) < new Date();
      if (!tripEnded) {
        return NextResponse.json(
          { error: "Reviews can only be left after a trip has ended or is closed" },
          { status: 400 }
        );
      }
    }

    const existing = await prisma.review.findFirst({
      where: {
        reviewerId: userId,
        reviewedUserId,
        tripId: tripId ?? null,
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You have already left a review for this user" + (tripId ? " for this trip" : "") },
        { status: 400 }
      );
    }

    const review = await prisma.review.create({
      data: {
        reviewerId: userId,
        reviewedUserId,
        rating,
        comment: comment ?? null,
        tripId: tripId ?? null,
      },
      include: {
        reviewer: {
          select: { id: true, name: true, profilePhoto: true },
        },
        trip: {
          select: { id: true, destination: true },
        },
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (e) {
    console.error("Create review error:", e);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
