import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }],
      },
      include: {
        user1: { select: { id: true, name: true, profilePhoto: true } },
        user2: { select: { id: true, name: true, profilePhoto: true } },
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { content: true, createdAt: true, senderId: true },
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    const enriched = conversations.map((c) => {
      const other = c.user1Id === userId ? c.user2 : c.user1;
      const lastMsg = c.messages[0];
      return {
        id: c.id,
        other,
        lastMessage: lastMsg,
        lastMessageAt: c.lastMessageAt,
      };
    });

    return NextResponse.json(enriched);
  } catch (e) {
    console.error("Conversations error:", e);
    return NextResponse.json(
      { error: "Failed to get conversations" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { otherUserId } = body as { otherUserId?: string };
    if (!otherUserId || otherUserId === userId) {
      return NextResponse.json(
        { error: "Invalid other user" },
        { status: 400 }
      );
    }

    const existing = await prisma.conversation.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: otherUserId },
          { user1Id: otherUserId, user2Id: userId },
        ],
      },
    });
    if (existing) {
      return NextResponse.json(existing, { status: 200 });
    }

    const conv = await prisma.conversation.create({
      data: {
        user1Id: userId,
        user2Id: otherUserId,
      },
      include: {
        user1: { select: { id: true, name: true, profilePhoto: true } },
        user2: { select: { id: true, name: true, profilePhoto: true } },
      },
    });
    return NextResponse.json(conv, { status: 201 });
  } catch (e) {
    console.error("Create conversation error:", e);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
}
