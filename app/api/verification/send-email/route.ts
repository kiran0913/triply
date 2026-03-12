import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { createVerificationToken } from "@/lib/email-verification";
import { sendVerificationEmail, isEmailConfigured } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ sent: false, message: "Email already verified" });
    }

    if (!isEmailConfigured()) {
      return NextResponse.json(
        { error: "Email verification is not configured. Contact support." },
        { status: 503 }
      );
    }

    const token = await createVerificationToken(userId);
    const result = await sendVerificationEmail(user.email, token);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ sent: true });
  } catch (e) {
    console.error("[Verification send-email] error:", e);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
