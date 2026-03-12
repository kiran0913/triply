import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminUserId } from "@/lib/admin-guard";

const FRAUD_STATUSES = ["normal", "suspicious", "review_required", "restricted"];
const SAFETY_STATUSES = ["low_risk", "medium_risk", "high_risk"];
const VERIFICATION_LEVELS = ["basic", "verified", "trusted"];

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
    const data: Record<string, unknown> = {};

    if (typeof body.fraudStatus === "string" && FRAUD_STATUSES.includes(body.fraudStatus)) {
      data.fraudStatus = body.fraudStatus;
    }
    if (typeof body.safetyStatus === "string" && SAFETY_STATUSES.includes(body.safetyStatus)) {
      data.safetyStatus = body.safetyStatus;
    }
    if (
      (typeof body.verificationLevel === "string" || body.verificationLevel === null) &&
      (body.verificationLevel === null || VERIFICATION_LEVELS.includes(body.verificationLevel))
    ) {
      data.verificationLevel = body.verificationLevel;
    }
    if (Array.isArray(body.flaggedReasons)) {
      data.flaggedReasons = body.flaggedReasons;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        fraudStatus: true,
        safetyStatus: true,
        verificationLevel: true,
        flaggedReasons: true,
      },
    });

    return NextResponse.json(user);
  } catch (e) {
    console.error("[Admin review] error:", e);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
