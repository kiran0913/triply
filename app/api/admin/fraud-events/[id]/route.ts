import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/lib/admin-guard";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminUserId(request);
  if (!adminId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const metadata = typeof body.metadata === "object" && body.metadata !== null
      ? { ...(body.metadata as Record<string, unknown>), reviewedAt: new Date().toISOString() }
      : { reviewedAt: new Date().toISOString() };

    const event = await prisma.fraudEvent.update({
      where: { id },
      data: { metadata: metadata as object },
    });

    return NextResponse.json(event);
  } catch (e) {
    console.error("[Admin fraud event] error:", e);
    return NextResponse.json({ error: "Failed to update fraud event" }, { status: 500 });
  }
}
