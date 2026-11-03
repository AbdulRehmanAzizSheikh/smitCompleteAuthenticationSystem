import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { emailChangeVerifyOldSchema, emailSchema } from "@/lib/validation";
import { verifyOtp, issueOtp, deleteOtps } from "@/lib/otp";
import { sendEmail, otpEmail } from "@/lib/email";
import { apiOk, apiFail, handleRouteError, getApiUser, otpFailureMessage } from "@/lib/api";
import { maskEmail } from "@/lib/utils";

/**
 * POST /api/user/email-change/verify-old (authenticated) — STEP 2 of 3
 * Confirms the code sent to the CURRENT email, then issues a second
 * code to the NEW email address for ownership verification.
 */
export async function POST(request: Request) {
  try {
    const apiUser = await getApiUser();
    if (!apiUser) return apiFail(401, "Please sign in.");

    const body = await request.json().catch(() => null);
    const parsed = emailChangeVerifyOldSchema.parse(body ?? {});

    const verdict = await verifyOtp({
      email: apiUser.email,
      purpose: "email-change-old",
      code: parsed.otp,
      userId: apiUser.id,
      consume: true,
    });

    if (!verdict.ok) return apiFail(400, otpFailureMessage(verdict.reason));

    const newEmailParsed = emailSchema.safeParse(verdict.meta?.newEmail);
    if (!newEmailParsed.success) {
      return apiFail(400, "Stored email payload was invalid. Start the change again.");
    }
    const newEmail = newEmailParsed.data;

    await connectDB();
    const taken = await User.exists({ email: newEmail, _id: { $ne: apiUser.id } });
    if (taken) return apiFail(409, "That email was just taken by another account. Start again with a different one.");

    // Fresh code goes to the NEW inbox
    await deleteOtps(newEmail, "email-change-new");
    const { code } = await issueOtp({
      email: newEmail,
      purpose: "email-change-new",
      userId: apiUser.id,
      meta: { newEmail },
    });

    const { subject, html, text } = otpEmail({ code, purpose: "email-change-new" });
    await sendEmail({ to: newEmail, subject, html, text });

    return apiOk({
      message: `Current email confirmed. We sent a verification code to ${maskEmail(newEmail)}.`,
      maskedNewEmail: maskEmail(newEmail),
      step: 2,
    });
  } catch (error) {
    return handleRouteError(error, "user/email-change/verify-old");
  }
}
