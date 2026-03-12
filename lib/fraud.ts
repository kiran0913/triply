/**
 * Fraud detection - rule-based pattern analysis.
 * Tracks suspicious events, evaluates fraud risk.
 */

import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type FraudStatus = "normal" | "suspicious" | "review_required" | "restricted";

const FRAUD_EVENT_TYPES = {
  EXCESSIVE_MESSAGES: "excessive_messages",
  RAPID_SAVES: "rapid_saves",
  RECEIVED_REPORT: "received_report",
  JOIN_LEAVE_ABUSE: "join_leave_abuse",
  DUPLICATE_CONTENT: "duplicate_content",
} as const;

export async function recordFraudEvent(
  userId: string,
  eventType: string,
  reason?: string,
  metadata?: Record<string, unknown>
) {
  await prisma.fraudEvent.create({
    data: {
      userId,
      eventType,
      reason: reason ?? null,
      metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined,
    },
  });
}

export async function evaluateFraudRisk(userId: string): Promise<{
  status: FraudStatus;
  reasons: string[];
}> {
  const window = new Date(Date.now() - 24 * 60 * 60 * 1000); // last 24h
  const events = await prisma.fraudEvent.findMany({
    where: { userId, createdAt: { gte: window } },
  });
  const reportCount = await prisma.report.count({
    where: { reportedUserId: userId, createdAt: { gte: window } },
  });
  const messageCount = await prisma.message.count({
    where: { senderId: userId, createdAt: { gte: window } },
  });
  const savesCount = await prisma.savedProfile.count({
    where: { userId, savedUserId: { not: userId } },
  });

  const reasons: string[] = [];
  if (messageCount > 50) reasons.push("Excessive messages in 24h");
  if (savesCount > 30) reasons.push("Excessive profile saves");
  if (reportCount >= 3) reasons.push("Multiple reports received");
  events.forEach((e) => {
    if (e.eventType === FRAUD_EVENT_TYPES.EXCESSIVE_MESSAGES)
      reasons.push("Message rate flagged");
    if (e.eventType === FRAUD_EVENT_TYPES.RAPID_SAVES) reasons.push("Rapid profile saves");
    if (e.eventType === FRAUD_EVENT_TYPES.JOIN_LEAVE_ABUSE) reasons.push("Join/leave pattern");
  });

  const severity = reasons.length;
  let status: FraudStatus = "normal";
  if (severity >= 3 || reportCount >= 5) status = "restricted";
  else if (severity >= 1 || reportCount >= 2) status = "review_required";
  else if (events.length >= 2) status = "suspicious";

  return { status, reasons: Array.from(new Set(reasons)) };
}

export async function maybeRecordMessageSpam(senderId: string) {
  const window = new Date(Date.now() - 60 * 60 * 1000); // 1h
  const count = await prisma.message.count({
    where: { senderId, createdAt: { gte: window } },
  });
  if (count >= 20) {
    await recordFraudEvent(senderId, FRAUD_EVENT_TYPES.EXCESSIVE_MESSAGES, "20+ messages in 1h", {
      count,
      windowHours: 1,
    });
  }
}

export async function maybeRecordRapidSaves(userId: string) {
  const count = await prisma.savedProfile.count({ where: { userId } });
  if (count >= 40) {
    await recordFraudEvent(userId, FRAUD_EVENT_TYPES.RAPID_SAVES, "40+ profile saves", {
      count,
    });
  }
}

export { FRAUD_EVENT_TYPES };
