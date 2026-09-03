import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin routes in production when SESSION_SECRET is configured
  if (pathname.startsWith("/admin") && process.env.NODE_ENV === "production" && process.env.SESSION_SECRET) {
    const adminCookie =
      request.cookies.get("admin_session")?.value || request.cookies.get("rewind_admin")?.value;
    const authHeader = request.headers.get("authorization");
    const secret = process.env.SESSION_SECRET;

    const isAuthorized =
      adminCookie === secret ||
      Boolean(
        authHeader &&
          authHeader.toLowerCase().startsWith("bearer ") &&
          authHeader.slice(7).trim() === secret
      );

    if (!isAuthorized) {
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
