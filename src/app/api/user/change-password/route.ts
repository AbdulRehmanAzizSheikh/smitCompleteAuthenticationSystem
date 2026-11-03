import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { changePasswordSchema } from "@/lib/validation";
import { sendEmail, passwordChangedEmail } from "@/lib/email";
import { apiOk, apiFail, handleRouteError, getApiUser } from "@/lib/api";
import { rateLimit, clientIp } from "@/lib/rateLimit";

/**
 * POST /api/user/change-password (authenticated)
 * Requires the current password — full stop. No OTP needed, and if the
 * current password check fails the request is rejected before any write.
 */
export async function POST(request: Request) {
  try {
    const apiUser = await getApiUser();
    if (!apiUser) return apiFail(401, "Please sign in to change your password.");

    const ip = clientIp(request);
    const ipLimit = rateLimit({ scope: "change-password:ip", identifier: `${ip}:${apiUser.id}`, limit: 10, windowMs: 10 * 60 * 1000 });
    if (!ipLimit.allowed) {
      return apiFail(429, "Too many attempts. Please wait a few minutes.", { retryAfterSeconds: ipLimit.retryAfterSeconds });
    }

    const body = await request.json().catch(() => null);
    const { currentPassword, newPassword } = changePasswordSchema.parse(body ?? {});

    await connectDB();
    const user = await User.findById(apiUser.id).select("+password");
    if (!user) return apiFail(404, "Account not found.");

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) return apiFail(400, "Your current password is incorrect.");

    const reusesCurrent = await bcrypt.compare(newPassword, user.password);
    if (reusesCurrent) return apiFail(400, "New password must be different from your current one.");

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    try {
      const { subject, html, text } = passwordChangedEmail({ username: user.username });
      await sendEmail({ to: user.email, subject, html, text });
    } catch (mailError) {
      console.error("[change-password] notification email failed:", mailError);
    }

    return apiOk({ message: "Password updated successfully." });
  } catch (error) {
    return handleRouteError(error, "user/change-password");
  }
}
