import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/lib/admin-guard";

export async function GET(request: NextRequest) {
  const adminId = await getAdminUserId(request);
  if (!adminId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // safety | fraud
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));

    const fetchSafety = type !== "fraud";
    const fetchFraud = type !== "safety";

    const [safetyFlags, fraudEvents] = await Promise.all([
      fetchSafety
        ? prisma.safetyFlag.findMany({
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          })
        : [],
      fetchFraud
        ? prisma.fraudEvent.findMany({
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          })
        : [],
    ]);

    return NextResponse.json({
      safetyFlags,
      fraudEvents,
    });
  } catch (e) {
    console.error("[Admin flags] error:", e);
    return NextResponse.json({ error: "Failed to fetch flags" }, { status: 500 });
  }
}
