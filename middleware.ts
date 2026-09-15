import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function timingSafeCompare(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const aBuf = enc.encode(a);
  const bBuf = enc.encode(b);

  // Compare across maximum length in constant time to prevent length timing leaks
  const maxLen = Math.max(aBuf.byteLength, bBuf.byteLength);
  let diff = aBuf.byteLength ^ bBuf.byteLength;

  for (let i = 0; i < maxLen; i++) {
    const aByte = i < aBuf.byteLength ? aBuf[i] : 0;
    const bByte = i < bBuf.byteLength ? bBuf[i] : 0;
    diff |= aByte ^ bByte;
  }

  return diff === 0;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes in production when SESSION_SECRET is configured
  if (pathname.startsWith("/admin") && process.env.NODE_ENV === "production" && process.env.SESSION_SECRET) {
    const adminCookie = request.cookies.get("admin_session")?.value || "";
    const authHeader = request.headers.get("authorization") || "";
    const secret = process.env.SESSION_SECRET;

    const tokenFromHeader = authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : "";

    const isCookieValid = adminCookie ? timingSafeCompare(adminCookie, secret) : false;
    const isHeaderValid = tokenFromHeader ? timingSafeCompare(tokenFromHeader, secret) : false;

    if (!isCookieValid && !isHeaderValid) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.searchParams.set("auth_notice", "admin_required");
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

