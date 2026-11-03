import { connectDB } from "@/lib/db";
import { issueOtp } from "@/lib/otp";
import { sendEmail, otpEmail } from "@/lib/email";
import { apiOk, apiFail, handleRouteError, getApiUser } from "@/lib/api";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { maskEmail } from "@/lib/utils";

/**
 * POST /api/user/delete-account/send-otp (authenticated)
 * Sends an authorization code to the CURRENT email. Account is
 * permanently deleted only after this code is confirmed.
 */
export async function POST(request: Request) {
  try {
    const apiUser = await getApiUser();
    if (!apiUser) return apiFail(401, "Please sign in.");

    const ip = clientIp(request);
    const ipLimit = rateLimit({ scope: "delete-account:ip", identifier: `${ip}:${apiUser.id}`, limit: 3, windowMs: 10 * 60 * 1000 });
    if (!ipLimit.allowed) {
      return apiFail(429, "Too many attempts. Please wait a few minutes.", { retryAfterSeconds: ipLimit.retryAfterSeconds });
    }

    await connectDB();
    const { code } = await issueOtp({
      email: apiUser.email,
      purpose: "account-delete",
      userId: apiUser.id,
    });

    const { subject, html, text } = otpEmail({ code, purpose: "account-delete" });
    await sendEmail({ to: apiUser.email, subject, html, text });

    return apiOk({
      message: `Deletion code sent to ${maskEmail(apiUser.email)}. Valid for 10 minutes.`,
      maskedEmail: maskEmail(apiUser.email),
    });
  } catch (error) {
    return handleRouteError(error, "user/delete-account/send-otp");
  }
}
