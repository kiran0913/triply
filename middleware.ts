import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PATHS = [
  "/dashboard",
  "/matches",
  "/profile",
  "/chat",
  "/create",
  "/explore",
  "/assistant",
  "/safety",
  "/verification",
  "/admin",
];

function isProtected(pathname: string): boolean {
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token =
    request.cookies.get("auth-token")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (isProtected(pathname) && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/matches/:path*",
    "/profile/:path*",
    "/chat/:path*",
    "/create/:path*",
    "/explore/:path*",
    "/assistant/:path*",
    "/safety/:path*",
    "/verification/:path*",
    "/admin/:path*",
  ],
};
