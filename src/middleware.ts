import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/login", "/api/auth"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

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
