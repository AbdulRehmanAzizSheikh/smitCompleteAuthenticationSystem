import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { forgotResetSchema } from "@/lib/validation";
import { verifyOtp, deleteOtps } from "@/lib/otp";
import { sendEmail, passwordChangedEmail } from "@/lib/email";
import { apiOk, apiFail, handleRouteError, otpFailureMessage } from "@/lib/api";
import { rateLimit, clientIp } from "@/lib/rateLimit";

/**
 * POST /api/auth/forgot-password/reset
 * Verifies the OTP and sets a new password. Does NOT sign the user in —
 * they return to the login page and sign in with the new password.
 */
export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const ipLimit = rateLimit({ scope: "forgot-reset:ip", identifier: ip, limit: 10, windowMs: 10 * 60 * 1000 });
    if (!ipLimit.allowed) {
      return apiFail(429, "Too many attempts. Please try again in a few minutes.", { retryAfterSeconds: ipLimit.retryAfterSeconds });
    }

    const body = await request.json().catch(() => null);
    const { email, otp, password } = forgotResetSchema.parse(body ?? {});

    const verdict = await verifyOtp({ email, purpose: "forgot-password", code: otp, consume: true });
    if (!verdict.ok) {
      return apiFail(400, otpFailureMessage(verdict.reason));
    }

    await connectDB();
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return apiFail(404, "Account not found.");
    }

    user.password = await bcrypt.hash(password, 12);
    await user.save();
    await deleteOtps(email, "forgot-password");

    try {
      const { subject, html, text } = passwordChangedEmail({ username: user.username });
      await sendEmail({ to: user.email, subject, html, text });
    } catch (mailError) {
      console.error("[forgot-password/reset] notification email failed:", mailError);
    }

    return apiOk({ message: "Password updated. Sign in with your new password." });
  } catch (error) {
    return handleRouteError(error, "auth/forgot-password/reset");
  }
}
