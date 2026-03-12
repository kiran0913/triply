import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { messageSchema } from "@/lib/validations";
import { createNotification } from "@/lib/notifications";
import { aiMessageSafetyCheck } from "@/lib/safety";
import { maybeRecordMessageSpam } from "@/lib/fraud";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitRes = checkRateLimit(request, "messages", 30, 60);
  if (rateLimitRes) return rateLimitRes;

  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: conversationId } = await params;

    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conv) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }
    if (conv.user1Id !== userId && conv.user2Id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, name: true, profilePhoto: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(messages);
  } catch (e) {
    console.error("Messages error:", e);
    return NextResponse.json({ error: "Failed to get messages" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitRes = checkRateLimit(request, "messages", 30, 60);
  if (rateLimitRes) return rateLimitRes;

  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id: conversationId } = await params;

    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conv) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }
    if (conv.user1Id !== userId && conv.user2Id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = messageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const content = parsed.data.content;
    const safetyResult = await aiMessageSafetyCheck(content);
    if (safetyResult.status === "high_risk") {
      return NextResponse.json(
        { error: "This message could not be sent. Please keep conversations respectful and avoid sharing external links or suspicious content." },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content,
      },
      include: {
        sender: { select: { id: true, name: true, profilePhoto: true } },
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    await maybeRecordMessageSpam(userId).catch(() => {});

    const recipientId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
    const senderName = message.sender.name ?? "Someone";
    await createNotification({
      userId: recipientId,
      type: "message",
      title: `New message from ${senderName}`,
      body: content.slice(0, 80) + (content.length > 80 ? "…" : ""),
      link: `/chat?conversationId=${conversationId}`,
    });

    if (safetyResult.status === "medium_risk") {
      await prisma.safetyFlag.create({
        data: {
          userId: userId,
          targetType: "message",
          targetId: message.id,
          reason: safetyResult.reasons.join("; ") || "Moderation flag",
          severity: "medium",
        },
      }).catch(() => {});
    }

    const response: Record<string, unknown> = { ...message };
    if (safetyResult.status === "medium_risk") {
      response.warning = "Please keep conversations respectful.";
    }
    return NextResponse.json(response, { status: 201 });
  } catch (e) {
    console.error("Send message error:", e);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
