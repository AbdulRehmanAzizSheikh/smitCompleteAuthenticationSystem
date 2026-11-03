import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { usernameChangeStartSchema } from "@/lib/validation";
import { issueOtp } from "@/lib/otp";
import { sendEmail, otpEmail } from "@/lib/email";
import { apiOk, apiFail, handleRouteError, getApiUser } from "@/lib/api";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { maskEmail } from "@/lib/utils";

/**
 * POST /api/user/username/send-otp (authenticated)
 * Validates the requested username and sends an OTP to the CURRENT email.
 */
export async function POST(request: Request) {
  try {
    const apiUser = await getApiUser();
    if (!apiUser) return apiFail(401, "Please sign in.");

    const ip = clientIp(request);
    const ipLimit = rateLimit({ scope: "username-otp:ip", identifier: `${ip}:${apiUser.id}`, limit: 5, windowMs: 10 * 60 * 1000 });
    if (!ipLimit.allowed) {
      return apiFail(429, "Too many codes requested. Please wait a few minutes.", { retryAfterSeconds: ipLimit.retryAfterSeconds });
    }

    const body = await request.json().catch(() => null);
    const { newUsername } = usernameChangeStartSchema.parse(body ?? {});

    if (newUsername === apiUser.username) {
      return apiFail(400, "That is already your username.");
    }

    await connectDB();
    const taken = await User.exists({ username: newUsername });
    if (taken) return apiFail(409, "That username is taken. Pick another one.");

    const { code } = await issueOtp({
      email: apiUser.email,
      purpose: "username-change",
      userId: apiUser.id,
      meta: { newUsername },
    });

    const { subject, html, text } = otpEmail({ code, purpose: "username-change", meta: { newUsername } });
    await sendEmail({ to: apiUser.email, subject, html, text });

    return apiOk({
      message: `Verification code sent to ${maskEmail(apiUser.email)}.`,
      maskedEmail: maskEmail(apiUser.email),
    });
  } catch (error) {
    return handleRouteError(error, "user/username/send-otp");
  }
}
