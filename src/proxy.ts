import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_TTL_DAYS, signSession, verifySessionToken } from "@/lib/jwt";

/**
 * Next.js 16 "Proxy" (formerly middleware).
 *
 * 1. Sliding sessions — every page visit re-issues the session JWT with a
 *    fresh 7-day expiry. No visit for SESSION_TTL_DAYS → token expires
 *    naturally, and the user must sign in again. (1 week inactivity ⇒ logout)
 * 2. Optimistic route protection — /dashboard and /settings redirect to
 *    /login when no valid session cookie is present. Server components and
 *    route handlers still re-verify via the DAL (defence in depth).
 */

const PROTECTED_PREFIXES = ["/dashboard", "/settings"];
const AUTH_PAGES = ["/login", "/register", "/forgot-password"];

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  };
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifySessionToken(token) : null;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isAuthPage = AUTH_PAGES.includes(pathname);

  // Not signed in → bounce to login (preserving the target)
  if (isProtected && !session) {
    const url = new URL("/login", req.nextUrl);
    if (pathname !== "/dashboard") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Signed in → fresh 7-day cookie on every response (sliding expiry)
  if (session) {
    const fresh = await signSession(session.userId);

    if (isAuthPage) {
      const url = new URL("/dashboard", req.nextUrl);
      const response = NextResponse.redirect(url);
      response.cookies.set(SESSION_COOKIE, fresh, sessionCookieOptions());
      return response;
    }

    const response = NextResponse.next();
    response.cookies.set(SESSION_COOKIE, fresh, sessionCookieOptions());
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Pages only — APIs, static assets and images are excluded
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
