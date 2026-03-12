import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { createStorySchema } from "@/lib/validations";
import { isTripMember } from "@/lib/trip-helpers";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get("tripId");
    const authorId = searchParams.get("authorId");

    const where: { tripId?: string; authorId?: string } = {};
    if (tripId) where.tripId = tripId;
    if (authorId) where.authorId = authorId;

    const stories = await prisma.travelStory.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true, profilePhoto: true },
        },
        trip: {
          select: { id: true, title: true, destination: true, slug: true },
        },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const userId = await getCurrentUserId(request);
    let userLikedIds: Set<string> = new Set();
    if (userId) {
      const liked = await prisma.storyLike.findMany({
        where: { userId, storyId: { in: stories.map((s) => s.id) } },
        select: { storyId: true },
      });
      userLikedIds = new Set(liked.map((l) => l.storyId));
    }

    const result = stories.map((s) => ({
      ...s,
      likesCount: s._count.likes,
      commentsCount: s._count.comments,
      userLiked: userLikedIds.has(s.id),
      _count: undefined,
    }));

    return NextResponse.json(result);
  } catch (e) {
    console.error("[Stories GET] error:", e);
    return NextResponse.json({ error: "Failed to load stories" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const rateLimitRes = checkRateLimit(request, "stories-post", 5, 60);
  if (rateLimitRes) return rateLimitRes;

  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createStorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { tripId, title, content, photos, highlights } = parsed.data;

    const member = await isTripMember(tripId, userId);
    if (!member) {
      return NextResponse.json({ error: "Not a trip member" }, { status: 403 });
    }

    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { status: true, endDate: true },
    });
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const tripEnded = trip.status === "CLOSED" || new Date(trip.endDate) < new Date();
    if (!tripEnded) {
      return NextResponse.json(
        { error: "You can only create stories for completed trips" },
        { status: 400 }
      );
    }

    const story = await prisma.travelStory.create({
      data: {
        tripId,
        authorId: userId,
        title,
        content,
        photos: photos && photos.length > 0 ? (photos as Prisma.InputJsonValue) : Prisma.JsonNull,
        highlights: highlights && highlights.length > 0 ? (highlights as Prisma.InputJsonValue) : Prisma.JsonNull,
      },
      include: {
        author: {
          select: { id: true, name: true, profilePhoto: true },
        },
        trip: {
          select: { id: true, title: true, destination: true, slug: true },
        },
        _count: { select: { likes: true, comments: true } },
      },
    });

    const withCount = story as typeof story & { _count?: { likes: number; comments: number } };
    return NextResponse.json(
      {
        ...story,
        likesCount: withCount._count?.likes ?? 0,
        commentsCount: withCount._count?.comments ?? 0,
        userLiked: false,
      },
      { status: 201 }
    );
  } catch (e) {
    console.error("[Stories POST] error:", e);
    return NextResponse.json({ error: "Failed to create story" }, { status: 500 });
  }
}
