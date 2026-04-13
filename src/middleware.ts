import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

// SEC-01: Lightweight auth rate limiting (in-memory, resets on cold start)
const authHits = new Map<string, number[]>();
const AUTH_RATE_LIMIT = 10;
const AUTH_WINDOW_MS = 60_000;

function isAuthRateLimited(ip: string): boolean {
  const now = Date.now();
  const cutoff = now - AUTH_WINDOW_MS;
  const timestamps = (authHits.get(ip) ?? []).filter((t) => t > cutoff);

  if (timestamps.length >= AUTH_RATE_LIMIT) {
    authHits.set(ip, timestamps);
    return true;
  }

  timestamps.push(now);
  authHits.set(ip, timestamps);
  return false;
}

const publicRoutes = ["/login", "/api/auth"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  // SEC-01: Rate limit auth endpoints by IP
  if (pathname.startsWith("/api/auth")) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (isAuthRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }
  }

  // Check for next-auth session token cookie
  const hasSession =
    req.cookies.has("authjs.session-token") ||
    req.cookies.has("__Secure-authjs.session-token");

  // Authenticated user hitting /login or / -> redirect to /dashboard
  if (hasSession) {
    if (pathname === "/login" || pathname === "/") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  // Unauthenticated user hitting a protected route -> redirect to /login
  if (!isPublic && pathname !== "/") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Unauthenticated user hitting / -> redirect to /login
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|sw.js|manifest.json).*)",
  ],
};
