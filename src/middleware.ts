import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicRoutes = ["/login", "/api/auth"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  // Authenticated user hitting /login or / -> redirect to /dashboard
  if (req.auth) {
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
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons|sw.js|manifest.json).*)"],
};
