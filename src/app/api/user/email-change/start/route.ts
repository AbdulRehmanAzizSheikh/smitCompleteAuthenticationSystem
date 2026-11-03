import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { emailChangeStartSchema } from "@/lib/validation";
import { issueOtp } from "@/lib/otp";
import { sendEmail, otpEmail } from "@/lib/email";
import { apiOk, apiFail, handleRouteError, getApiUser } from "@/lib/api";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { maskEmail } from "@/lib/utils";

/**
 * POST /api/user/email-change/start (authenticated) — STEP 1 of 2
 * Sends an authorization code to the CURRENT email address.
 * Only after that code is confirmed do we send a verification code
 * to the NEW address.
 */
export async function POST(request: Request) {
  try {
    const apiUser = await getApiUser();
    if (!apiUser) return apiFail(401, "Please sign in.");

    const ip = clientIp(request);
    const ipLimit = rateLimit({ scope: "email-change:ip", identifier: `${ip}:${apiUser.id}`, limit: 5, windowMs: 10 * 60 * 1000 });
    if (!ipLimit.allowed) {
      return apiFail(429, "Too many attempts. Please wait a few minutes.", { retryAfterSeconds: ipLimit.retryAfterSeconds });
    }

    const body = await request.json().catch(() => null);
    const { newEmail } = emailChangeStartSchema.parse(body ?? {});

    if (newEmail === apiUser.email) {
      return apiFail(400, "That is already your email address.");
    }

    await connectDB();
    const taken = await User.exists({ email: newEmail });
    if (taken) return apiFail(409, "That email is already in use by another account.");

    const { code } = await issueOtp({
      email: apiUser.email,
      purpose: "email-change-old",
      userId: apiUser.id,
      meta: { newEmail },
    });

    const { subject, html, text } = otpEmail({ code, purpose: "email-change-old", meta: { newEmail } });
    await sendEmail({ to: apiUser.email, subject, html, text });

    return apiOk({
      message: `Authorization code sent to ${maskEmail(apiUser.email)} (your current email).`,
      maskedCurrentEmail: maskEmail(apiUser.email),
      step: 1,
    });
  } catch (error) {
    return handleRouteError(error, "user/email-change/start");
  }
}
