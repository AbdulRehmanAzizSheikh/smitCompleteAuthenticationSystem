import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { registerSchema } from "@/lib/validation";
import { verifyOtp, deleteOtps } from "@/lib/otp";
import { sendEmail, welcomeEmail } from "@/lib/email";
import { apiOk, apiFail, handleRouteError, otpFailureMessage } from "@/lib/api";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { createSession } from "@/lib/session";

/**
 * POST /api/auth/register
 * Creates the account after the email OTP has been verified.
 * Signs the user in automatically on success.
 */
export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const ipLimit = rateLimit({ scope: "register:ip", identifier: ip, limit: 10, windowMs: 10 * 60 * 1000 });
    if (!ipLimit.allowed) {
      return apiFail(429, "Too many attempts. Please try again in a few minutes.", { retryAfterSeconds: ipLimit.retryAfterSeconds });
    }

    const body = await request.json().catch(() => null);
    const { username, email, password, otp } = registerSchema.parse(body ?? {});

    // 1) Verify the OTP (kept, not consumed yet — the user document must be created first)
    const verdict = await verifyOtp({ email, purpose: "register", code: otp, consume: false });
    if (!verdict.ok) {
      return apiFail(400, otpFailureMessage(verdict.reason));
    }

    await connectDB();

    // 2) Final uniqueness check (closes the race between send-otp and submit)
    const taken = await User.findOne({ $or: [{ email }, { username }] }).select("email username").lean();
    if (taken) {
      const field = taken.email === email ? "email" : "username";
      return apiFail(409, field === "email"
        ? "An account with this email already exists."
        : "That username is taken. Pick another one.");
    }

    // 3) Create the account (bcrypt, cost factor 12)
    const passwordHash = await bcrypt.hash(password, 12);
    let user;
    try {
      user = await User.create({ username, email, password: passwordHash, displayName: username });
    } catch (error: unknown) {
      // Duplicate key race (unique index)
      if (typeof error === "object" && error !== null && "code" in error && (error as { code: number }).code === 11000) {
        return apiFail(409, "An account with this email or username already exists.");
      }
      throw error;
    }

    // 4) Consume the OTP — the pending-verification purpose is now obsolete
    await deleteOtps(email, "register");

    // 5) Welcome email (non-fatal if SMTP hiccups)
    try {
      const { subject, html, text } = welcomeEmail({ username: user.username, email: user.email });
      await sendEmail({ to: user.email, subject, html, text });
    } catch (mailError) {
      console.error("[register] welcome email failed:", mailError);
    }

    // 6) Auto sign-in
    await createSession(String(user._id));

    return apiOk({
      message: "Account created successfully. Welcome aboard!",
      user: {
        id: String(user._id),
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        createdAt: new Date(user.createdAt).toISOString(),
      },
    }, 201);
  } catch (error) {
    return handleRouteError(error, "auth/register");
  }
}
