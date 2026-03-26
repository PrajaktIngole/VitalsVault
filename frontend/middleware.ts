import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  // 🚫 Block login page if already logged in
  // 🚫 Block public pages if logged in
  if (token && (pathname === "/" || pathname === "/login")) {
    return NextResponse.redirect(new URL("/patient/dashboard", request.url));
  }

  // 🔒 Protect patient routes
  if (!token && pathname.startsWith("/patient")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 🔒 Protect doctor routes
  if (!token && pathname.startsWith("/doctor")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/patient/:path*", "/doctor/:path*"],
};
