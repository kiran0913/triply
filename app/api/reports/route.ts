import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { reportSchema } from "@/lib/validations";
import { recordFraudEvent, evaluateFraudRisk, FRAUD_EVENT_TYPES } from "@/lib/fraud";

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = reportSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { reportedUserId, reason } = parsed.data;

    if (reportedUserId === userId) {
      return NextResponse.json(
        { error: "Cannot report yourself" },
        { status: 400 }
      );
    }

    const report = await prisma.report.create({
      data: {
        reporterId: userId,
        reportedUserId,
        reason: reason ?? null,
      },
    });

    await recordFraudEvent(reportedUserId, FRAUD_EVENT_TYPES.RECEIVED_REPORT, "User was reported", {
      reporterId: userId,
      reason: reason ?? undefined,
    }).catch(() => {});

    const { status: fraudStatus, reasons } = await evaluateFraudRisk(reportedUserId);
    if (fraudStatus !== "normal") {
      await prisma.user.update({
        where: { id: reportedUserId },
        data: { fraudStatus, flaggedReasons: reasons },
      }).catch(() => {});
    }

    return NextResponse.json(report, { status: 201 });
  } catch (e) {
    console.error("Report error:", e);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}
