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
    const reportedUserId = searchParams.get("reportedUserId");
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)));

    const where = reportedUserId ? { reportedUserId } : {};

    const reports = await prisma.report.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        reportedUser: { select: { id: true, name: true, email: true, fraudStatus: true } },
      },
    });

    return NextResponse.json(reports);
  } catch (e) {
    console.error("[Admin reports] error:", e);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
