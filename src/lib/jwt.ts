import { SignJWT, jwtVerify } from "jose";

/**
 * Stateless session JWT (HS256), stored in an httpOnly cookie.
 * Payload carries the minimum needed: userId only.
 */

const secret = () => {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error("JWT_SECRET is not set. Add it to .env.local");
  return new TextEncoder().encode(value);
};

export const SESSION_COOKIE = "aegis_session";
export const SESSION_TTL_DAYS = Number(process.env.SESSION_TTL_DAYS ?? 7);

export interface SessionPayload {
  userId: string;
}

export async function signSession(userId: string) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_DAYS}d`)
    .sign(secret());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (typeof payload.userId !== "string" || !payload.userId) return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}
