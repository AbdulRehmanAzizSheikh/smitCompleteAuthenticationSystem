import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE, SESSION_TTL_DAYS, signSession, verifySessionToken } from "./jwt";

/**
 * Session helpers — server-only.
 */

export async function createSession(userId: string) {
  const token = await signSession(userId);
  const expires = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export const getSession = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
});

/**
 * Data Access Layer — the single source of truth for "who is calling".
 * Redirects to /login when the session is missing/invalid.
 */
export const requireSession = cache(async () => {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
});
