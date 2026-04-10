import { NextRequest, NextResponse } from "next/server";
import { validateSessionToken, COOKIE_NAME } from "@/lib/auth";

/**
 * Auth middleware for Aegis Node.
 *
 * Protected routes: /console, /api/* (except /api/auth/* and /api/heartbeat
 * when the request is from localhost — the browser pulse doesn't carry a
 * preflight cookie on every fetch in some environments).
 *
 * Unauthenticated requests are redirected to /login (for pages)
 * or receive a 401 JSON response (for API routes).
 */

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/logout"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow heartbeat from localhost without a session cookie
  // (the browser's 5s interval poll may not carry cookies in all contexts)
  if (pathname === "/api/heartbeat") {
    const host = req.headers.get("host") ?? "";
    const ip   = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "";
    const isLocal =
      host.startsWith("localhost") ||
      host.startsWith("127.0.0.1") ||
      ip.startsWith("127.") ||
      ip.startsWith("::1");
    if (isLocal) return NextResponse.next();
  }

  // All other protected routes need a valid session
  const token = req.cookies.get(COOKIE_NAME)?.value ?? "";
  const valid  = token ? await validateSessionToken(token) : false;

  if (!valid) {
    // API routes → 401
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Pages → redirect to login
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/console/:path*", "/api/:path*"],
};
