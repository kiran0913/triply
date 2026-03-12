import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { signupSchema } from "@/lib/validations";
import { createVerificationToken } from "@/lib/email-verification";
import { sendVerificationEmail, isEmailConfigured } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { email, password, name } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: { email: ["Email already registered"] } },
        { status: 400 }
      );
    }

    const hashed = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        name: name ?? null,
      },
      select: { id: true, email: true, name: true, profilePhoto: true, verified: true, createdAt: true },
    });

    const { createToken } = await import("@/lib/auth");
    const token = createToken({ userId: user.id, email: user.email });
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePhoto: user.profilePhoto,
        verified: user.verified,
      },
    }, { status: 201 });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    if (isEmailConfigured()) {
      try {
        const verifyToken = await createVerificationToken(user.id);
        await sendVerificationEmail(user.email, verifyToken);
      } catch (e) {
        console.error("[Register] Failed to send verification email:", e);
      }
    }

    return response;
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
