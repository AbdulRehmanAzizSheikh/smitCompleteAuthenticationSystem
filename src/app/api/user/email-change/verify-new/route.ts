import { z } from "zod";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { emailSchema, otpCodeSchema } from "@/lib/validation";
import { verifyOtp, deleteOtps } from "@/lib/otp";
import { sendEmail, emailChangedEmail } from "@/lib/email";
import { apiOk, apiFail, handleRouteError, getApiUser, otpFailureMessage } from "@/lib/api";

const bodySchema = z.object({ otp: otpCodeSchema, newEmail: emailSchema });

/**
 * POST /api/user/email-change/verify-new (authenticated) — STEP 3 of 3
 * Confirms the code sent to the NEW email and applies the change.
 * Notifies both the old and the new inbox.
 */
export async function POST(request: Request) {
  try {
    const apiUser = await getApiUser();
    if (!apiUser) return apiFail(401, "Please sign in.");

    const body = await request.json().catch(() => null);
    const { otp, newEmail } = bodySchema.parse(body ?? {});

    // The OTP was issued to the NEW inbox for this user
    const verdict = await verifyOtp({
      email: newEmail,
      purpose: "email-change-new",
      code: otp,
      userId: apiUser.id,
      consume: true,
    });

    if (!verdict.ok) return apiFail(400, otpFailureMessage(verdict.reason));
    if (verdict.meta?.newEmail && verdict.meta.newEmail !== newEmail) {
      return apiFail(400, "Email mismatch for this code. Please restart the change.");
    }

    await connectDB();
    const taken = await User.exists({ email: newEmail, _id: { $ne: apiUser.id } });
    if (taken) return apiFail(409, "That email was just taken by another account.");

    const oldEmail = apiUser.email;
    const user = await User.findByIdAndUpdate(
      apiUser.id,
      { email: newEmail },
      { new: true, runValidators: true }
    ).select("email username");

    if (!user) return apiFail(404, "Account not found.");
    await deleteOtps(newEmail, "email-change-new");

    // Notify both inboxes (non-fatal)
    try {
      const notice = emailChangedEmail({ username: user.username, oldEmail, newEmail });
      await Promise.allSettled([
        sendEmail({ to: oldEmail, subject: notice.subject, html: notice.html, text: notice.text }),
        sendEmail({ to: newEmail, subject: notice.subject, html: notice.html, text: notice.text }),
      ]);
    } catch (mailError) {
      console.error("[email-change/verify-new] notification email failed:", mailError);
    }

    return apiOk({ message: "Email address updated successfully.", email: user.email });
  } catch (error) {
    return handleRouteError(error, "user/email-change/verify-new");
  }
}
