import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { evaluateFraudRisk } from "@/lib/fraud";
import { verifyCronSecret } from "@/lib/cron-guard";

function fraudStatusToSafetyScore(status: string): number {
  switch (status) {
    case "normal":
      return 100;
    case "suspicious":
      return 60;
    case "review_required":
      return 40;
    case "restricted":
      return 0;
    default:
      return 50;
  }
}

function fraudStatusToSafetyStatus(status: string): string {
  switch (status) {
    case "normal":
      return "low_risk";
    case "suspicious":
      return "medium_risk";
    case "review_required":
      return "medium_risk";
    case "restricted":
      return "high_risk";
    default:
      return "medium_risk";
  }
}

export async function POST(request: NextRequest) {
  const authError = verifyCronSecret(request);
  if (authError) return authError;

  try {
    const users = await prisma.user.findMany({
      select: { id: true },
    });

    let updated = 0;
    for (const user of users) {
      const { status, reasons } = await evaluateFraudRisk(user.id);
      await prisma.user.update({
        where: { id: user.id },
        data: {
          fraudStatus: status,
          safetyScore: fraudStatusToSafetyScore(status),
          safetyStatus: fraudStatusToSafetyStatus(status),
          flaggedReasons: reasons,
        },
      });
      updated++;
    }

    return NextResponse.json({ ok: true, updated });
  } catch (e) {
    console.error("[Cron recompute-fraud-risk] error:", e);
    return NextResponse.json(
      { error: "Failed to recompute fraud risk" },
      { status: 500 }
    );
  }
}
