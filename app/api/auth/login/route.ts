import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rateLimitRes = checkRateLimit(request, "login", 5, 60);
  if (rateLimitRes) return rateLimitRes;

  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json(
        { error: { email: ["Invalid email or password"] } },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { error: { email: ["Invalid email or password"] } },
        { status: 401 }
      );
    }

    const token = createToken({ userId: user.id, email: user.email });
    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        profilePhoto: user.profilePhoto,
        bio: user.bio,
        location: user.location,
        verified: user.verified,
      },
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
