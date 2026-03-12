import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";

const VALID_SOURCES = ["copy_link", "facebook", "twitter", "whatsapp", "other"];

/**
 * Track trip share. Optional auth - anonymous shares allowed.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: tripId } = await params;
    const body = await request.json().catch(() => ({}));
    const shareSource = typeof body.shareSource === "string"
      ? body.shareSource.toLowerCase()
      : "copy_link";

    if (!VALID_SOURCES.includes(shareSource)) {
      return NextResponse.json(
        { error: "Invalid shareSource" },
        { status: 400 }
      );
    }

    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const userId = await getCurrentUserId(request);

    await prisma.tripShare.create({
      data: {
        tripId,
        userId: userId ?? null,
        shareSource,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[Trip share] error:", e);
    return NextResponse.json({ error: "Failed to record share" }, { status: 500 });
  }
}
