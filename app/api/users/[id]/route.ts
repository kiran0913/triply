import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { updateUserSchema } from "@/lib/validations";
import { computeProfileCompleted, getVerificationStatus } from "@/lib/verification";
import { aiProfileSafetyCheck } from "@/lib/safety";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        profilePhoto: true,
        bio: true,
        location: true,
        languages: true,
        travelStyle: true,
        budgetRange: true,
        interests: true,
        verified: true,
        emailVerified: true,
        profileCompleted: true,
        photoVerified: true,
        verificationLevel: true,
        createdAt: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const profileCompleted = computeProfileCompleted(user);
    const photoVerified = !!(user.photoVerified || user.profilePhoto?.trim());
    const verificationStatus = getVerificationStatus({
      ...user,
      profileCompleted,
      photoVerified,
    });
    return NextResponse.json({ ...user, verificationStatus });
  } catch (e) {
    console.error("Get user error:", e);
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitRes = checkRateLimit(request, "users-patch", 10, 60);
  if (rateLimitRes) return rateLimitRes;

  try {
    const userId = await getCurrentUserId(request);
    const { id } = await params;
    if (!userId || userId !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    const merged = { ...existing, ...parsed.data } as {
      emailVerified: Date | null;
      profilePhoto: string | null;
      name: string | null;
      bio: string | null;
      location: string | null;
      interests: unknown;
      travelStyle: unknown;
    };
    const profileCompleted = computeProfileCompleted(merged);
    const photoVerified = !!(merged.profilePhoto?.trim());
    let verificationLevel: string | null = "basic";
    if (merged.emailVerified && profileCompleted && photoVerified) {
      verificationLevel = "verified";
    } else if (merged.emailVerified) {
      verificationLevel = "basic";
    }

    const safetyResult = await aiProfileSafetyCheck(merged.bio ?? null);

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...parsed.data,
        profileCompleted,
        photoVerified,
        verificationLevel,
        safetyScore: safetyResult.score,
        safetyStatus: safetyResult.status,
        flaggedReasons: safetyResult.flagged ? safetyResult.reasons : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        profilePhoto: true,
        bio: true,
        location: true,
        languages: true,
        travelStyle: true,
        budgetRange: true,
        interests: true,
        verified: true,
        emailVerified: true,
        profileCompleted: true,
        photoVerified: true,
        verificationLevel: true,
        updatedAt: true,
      },
    });
    const verificationStatus = getVerificationStatus(user);
    return NextResponse.json({ ...user, verificationStatus });
  } catch (e) {
    console.error("Update user error:", e);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
