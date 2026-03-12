import { NextRequest, NextResponse } from "next/server";
import { consumeVerificationToken } from "@/lib/email-verification";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token")?.trim();

    if (!token) {
      return NextResponse.json({ success: false, error: "missing_token" }, { status: 400 });
    }

    const result = await consumeVerificationToken(token);

    if ("error" in result) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, userId: result.userId });
  } catch (e) {
    console.error("[Verification confirm] error:", e);
    return NextResponse.json(
      { success: false, error: "invalid" },
      { status: 500 }
    );
  }
}
