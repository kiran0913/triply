import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { computeProfileCompleted } from "@/lib/verification";

/**
 * Recompute and persist verification fields from current profile data.
 * Called after profile updates. Also updates profileCompleted, photoVerified.
 */
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        bio: true,
        location: true,
        interests: true,
        travelStyle: true,
        profilePhoto: true,
        emailVerified: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profileCompleted = computeProfileCompleted(user);
    const photoVerified = !!(user.profilePhoto?.trim());

    let verificationLevel: string | null = "basic";
    if (user.emailVerified && profileCompleted && photoVerified) {
      verificationLevel = "verified";
    } else if (user.emailVerified) {
      verificationLevel = "basic";
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        profileCompleted,
        photoVerified,
        verificationLevel,
      },
    });

    return NextResponse.json({
      profileCompleted,
      photoVerified,
      verificationLevel,
    });
  } catch (e) {
    console.error("Verification update error:", e);
    return NextResponse.json(
      { error: "Failed to update verification" },
      { status: 500 }
    );
  }
}
