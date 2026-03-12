import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { captureApiError } from "@/lib/sentry";

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user, matches, trips, conversations] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, profilePhoto: true },
      }),
      prisma.match.findMany({
        where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
        include: {
          user1: {
            select: {
              id: true,
              name: true,
              profilePhoto: true,
              location: true,
              bio: true,
              travelStyle: true,
              interests: true,
              verified: true,
              verificationLevel: true,
              budgetRange: true,
            },
          },
          user2: {
            select: {
              id: true,
              name: true,
              profilePhoto: true,
              location: true,
              bio: true,
              travelStyle: true,
              interests: true,
              verified: true,
              verificationLevel: true,
              budgetRange: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      prisma.trip.findMany({
        where: { status: "OPEN" },
        include: {
          host: { select: { id: true, name: true, profilePhoto: true } },
          _count: { select: { members: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
      prisma.conversation.findMany({
        where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
        include: {
          user1: { select: { id: true, name: true, profilePhoto: true } },
          user2: { select: { id: true, name: true, profilePhoto: true } },
          messages: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: { content: true, createdAt: true, senderId: true, read: true },
          },
        },
        orderBy: { lastMessageAt: "desc" },
        take: 5,
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userTrips = await prisma.trip.findFirst({
      where: { hostUserId: userId, status: "OPEN" },
      orderBy: { startDate: "asc" },
    });

    const enrichedMatches = matches.map((m) => {
      const other = m.user1Id === userId ? m.user2 : m.user1;
      const level = other.verificationLevel ?? "basic";
      return {
        id: other.id,
        name: other.name,
        location: other.location,
        bio: other.bio,
        travelStyle: other.travelStyle as string[],
        interests: other.interests as string[],
        verified: other.verified,
        verificationStatus: { level, trustedBadge: level === "verified" || level === "trusted" },
        budgetRange: other.budgetRange,
        matchPercent: m.matchScore ?? 0,
        image: other.profilePhoto,
      };
    });

    const enrichedConversations = conversations.map((c) => {
      const other = c.user1Id === userId ? c.user2 : c.user1;
      const lastMsg = c.messages[0];
      const isFromThem = lastMsg?.senderId !== userId;
      return {
        id: c.id,
        from: other.name,
        preview: lastMsg?.content ?? "No messages yet",
        time: lastMsg?.createdAt
          ? formatTimeAgo(lastMsg.createdAt)
          : "—",
        unread: isFromThem && !lastMsg?.read,
      };
    });

    return NextResponse.json({
      user,
      upcomingTrip: userTrips
        ? {
            destination: userTrips.destination,
            startDate: userTrips.startDate,
            endDate: userTrips.endDate,
          }
        : null,
      matches: enrichedMatches,
      trips: trips.map((t) => ({
        id: t.id,
        destination: t.destination,
        startDate: t.startDate,
        endDate: t.endDate,
        budget: t.budget,
        style: t.travelStyle,
        travelers: t._count.members,
        image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&h=400&fit=crop",
      })),
      messages: enrichedConversations,
    });
  } catch (e) {
    console.error("Dashboard error:", e);
    captureApiError(e);
    return NextResponse.json(
      { error: "Failed to load dashboard" },
      { status: 500 }
    );
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}
