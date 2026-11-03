import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { Otp } from "@/lib/models/Otp";
import { accountDeleteVerifySchema } from "@/lib/validation";
import { verifyOtp, deleteOtps } from "@/lib/otp";
import { sendEmail, accountDeletedEmail } from "@/lib/email";
import { apiOk, apiFail, handleRouteError, getApiUser, otpFailureMessage } from "@/lib/api";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import { destroySession } from "@/lib/session";

/**
 * POST /api/user/delete-account/confirm (authenticated)
 * Verifies the OTP, then PERMANENTLY deletes the account and all its OTPs,
 * sends a confirmation email, and destroys the session cookie.
 */
export async function POST(request: Request) {
  try {
    const apiUser = await getApiUser();
    if (!apiUser) return apiFail(401, "Please sign in.");

    const ip = clientIp(request);
    const ipLimit = rateLimit({ scope: "delete-account:confirm:ip", identifier: `${ip}:${apiUser.id}`, limit: 5, windowMs: 10 * 60 * 1000 });
    if (!ipLimit.allowed) {
      return apiFail(429, "Too many attempts. Please wait a few minutes.", { retryAfterSeconds: ipLimit.retryAfterSeconds });
    }

    const body = await request.json().catch(() => null);
    const { otp } = accountDeleteVerifySchema.parse(body ?? {});

    const verdict = await verifyOtp({
      email: apiUser.email,
      purpose: "account-delete",
      code: otp,
      userId: apiUser.id,
      consume: true,
    });

    if (!verdict.ok) return apiFail(400, otpFailureMessage(verdict.reason));

    await connectDB();
    const deleted = await User.findByIdAndDelete(apiUser.id).select("username email").lean();
    if (!deleted) return apiFail(404, "Account not found.");

    // Wipe every outstanding OTP for this account/email
    await deleteOtps(apiUser.email);
    await Otp.deleteMany({ userId: deleted._id });

    // Confirmation email (non-fatal)
    try {
      const { subject, html, text } = accountDeletedEmail({ username: deleted.username, email: deleted.email });
      await sendEmail({ to: deleted.email, subject, html, text });
    } catch (mailError) {
      console.error("[delete-account] confirmation email failed:", mailError);
    }

    await destroySession();

    return apiOk({ message: "Your account has been permanently deleted." });
  } catch (error) {
    return handleRouteError(error, "user/delete-account/confirm");
  }
}
