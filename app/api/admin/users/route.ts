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
    const q = searchParams.get("q")?.trim();
    const fraudStatus = searchParams.get("fraudStatus")?.trim();
    const safetyStatus = searchParams.get("safetyStatus")?.trim();
    const verificationLevel = searchParams.get("verificationLevel")?.trim();
    const flaggedOnly = searchParams.get("flagged") === "1";

    const conditions: Record<string, unknown>[] = [];
    if (q) {
      conditions.push({
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      });
    }
    if (fraudStatus) conditions.push({ fraudStatus });
    if (safetyStatus) conditions.push({ safetyStatus });
    if (verificationLevel) conditions.push({ verificationLevel });
    if (flaggedOnly) {
      conditions.push({
        OR: [
          { fraudStatus: { not: "normal" } },
          { safetyStatus: { not: "low_risk" } },
          { flaggedReasons: { not: null } },
        ],
      });
    }
    const where = conditions.length > 0 ? { AND: conditions } : {};

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        profilePhoto: true,
        fraudStatus: true,
        safetyStatus: true,
        safetyScore: true,
        verificationLevel: true,
        flaggedReasons: true,
        createdAt: true,
        _count: {
          select: {
            reportsReceived: true,
            fraudEvents: true,
            safetyFlags: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(users);
  } catch (e) {
    console.error("[Admin users] error:", e);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
