import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { sendRegisterOtpSchema } from "@/lib/validation";
import { issueOtp } from "@/lib/otp";
import { sendEmail, otpEmail } from "@/lib/email";
import { apiOk, apiFail, handleRouteError } from "@/lib/api";
import { rateLimit, clientIp } from "@/lib/rateLimit";

/**
 * POST /api/auth/register/send-otp
 * Sends a 6-digit OTP to the given email to verify it before account creation.
 * Email must NOT already belong to an account.
 */
export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const ipLimit = rateLimit({ scope: "register-otp:ip", identifier: ip, limit: 10, windowMs: 10 * 60 * 1000 });
    if (!ipLimit.allowed) {
      return apiFail(429, "Too many requests. Please try again in a few minutes.", { retryAfterSeconds: ipLimit.retryAfterSeconds });
    }

    const body = await request.json().catch(() => null);
    const { email } = sendRegisterOtpSchema.parse(body ?? {});

    const emailLimit = rateLimit({ scope: "register-otp:email", identifier: email, limit: 5, windowMs: 10 * 60 * 1000 });
    if (!emailLimit.allowed) {
      return apiFail(429, "Too many codes requested for this email. Please wait a few minutes.", { retryAfterSeconds: emailLimit.retryAfterSeconds });
    }

    await connectDB();
    const existing = await User.exists({ email });
    if (existing) {
      return apiFail(409, "An account with this email already exists. Try signing in instead.");
    }

    const { code } = await issueOtp({ email, purpose: "register" });
    const { subject, html, text } = otpEmail({ code, purpose: "register" });
    await sendEmail({ to: email, subject, html, text });

    return apiOk({ message: "Verification code sent. Check your inbox (and spam folder)." });
  } catch (error) {
    return handleRouteError(error, "auth/register/send-otp");
  }
}
