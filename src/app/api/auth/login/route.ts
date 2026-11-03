import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { loginSchema } from "@/lib/validation";
import { apiOk, apiFail, handleRouteError } from "@/lib/api";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { createSession } from "@/lib/session";

/**
 * POST /api/auth/login
 * Signs in with email OR username + password.
 * Generic error message — never reveals which part was wrong.
 */
export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const ipLimit = rateLimit({ scope: "login:ip", identifier: ip, limit: 10, windowMs: 60 * 1000 });
    if (!ipLimit.allowed) {
      return apiFail(429, "Too many sign-in attempts. Please wait a minute and try again.", { retryAfterSeconds: ipLimit.retryAfterSeconds });
    }

    const body = await request.json().catch(() => null);
    const { identifier, password } = loginSchema.parse(body ?? {});

    const normalized = identifier.trim().toLowerCase();
    const isEmail = normalized.includes("@");
    const query = isEmail ? { email: normalized } : { username: normalized };

    await connectDB();
    const user = await User.findOne(query).select("+password");

    // Constant-ish behaviour: run a compare even when user is missing
    const hashToCheck = user?.password ?? "$2b$12$J7nbvk8Fe9RqXrO5jpEdou9rySPgl1J9zdV69Mb2Wd2wxE3.5q5f2";
    const passwordMatches = await bcrypt.compare(password, hashToCheck);

    if (!user || !passwordMatches) {
      return apiFail(401, "Invalid credentials. Check your details and try again.");
    }

    await createSession(String(user._id));

    return apiOk({
      message: "Welcome back!",
      user: {
        id: String(user._id),
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        createdAt: new Date(user.createdAt).toISOString(),
      },
    });
  } catch (error) {
    return handleRouteError(error, "auth/login");
  }
}
