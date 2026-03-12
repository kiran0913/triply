import { NextRequest, NextResponse } from "next/server";
import { getAdminUserId } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const adminId = await getAdminUserId(request);
  return NextResponse.json({ admin: !!adminId });
}
