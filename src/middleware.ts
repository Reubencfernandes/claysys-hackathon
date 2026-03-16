/**
 * Next.js Edge Middleware -- Authentication Gate
 *
 * This middleware runs on every request (except static assets) and enforces
 * authentication for protected routes. It checks for a HuggingFace access
 * token stored in a cookie. Unauthenticated users are redirected to /login.
 *
 * Routes are split into two categories:
 *   - Public: login page, OAuth callback, data API endpoints (weather, places,
 *     currency, flights), and Next.js internal assets. These are accessible
 *     without a token. The data APIs must be public because they are called
 *     server-side by the AI tool execution layer, not by the browser.
 *   - Protected: everything else (e.g., /chat, the main page). These require
 *     a valid HuggingFace access token cookie.
 */

import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/auth/callback", "/api/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths, data API routes used by AI tools, and static assets
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/api/weather") ||
    pathname.startsWith("/api/places") ||
    pathname.startsWith("/api/currency") ||
    pathname.startsWith("/api/flights") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Check for the HuggingFace OAuth access token stored during login
  const token = request.cookies.get("hf_access_token")?.value;

  // No token means the user hasn't authenticated -- send them to login.
  // Exception: HuggingFace Spaces health probes require "/" to return 200.
  // Instead of redirecting, rewrite "/" to the login page so the probe
  // succeeds and users immediately see a real page instead of a client-side
  // loading shell that depends on hydration before navigating.
  if (!token) {
    if (pathname === "/") {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.rewrite(loginUrl);
    }
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * Matcher config: run this middleware on all routes except static files
 * and images served by Next.js. This regex uses a negative lookahead to
 * skip _next/static, _next/image, and favicon.ico.
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
