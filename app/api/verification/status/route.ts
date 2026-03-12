import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import {
  getVerificationStatus,
  computeProfileCompleted,
} from "@/lib/verification";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        emailVerified: true,
        profileCompleted: true,
        photoVerified: true,
        verificationLevel: true,
        name: true,
        bio: true,
        location: true,
        interests: true,
        travelStyle: true,
        profilePhoto: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profileCompleted = computeProfileCompleted(user);
    const photoVerified = !!(user.photoVerified || user.profilePhoto?.trim());

    const status = getVerificationStatus({
      ...user,
      profileCompleted,
      photoVerified,
    });

    return NextResponse.json({
      ...status,
      profileCompleted,
      photoVerified,
    });
  } catch (e) {
    console.error("Verification status error:", e);
    return NextResponse.json(
      { error: "Failed to get verification status" },
      { status: 500 }
    );
  }
}
