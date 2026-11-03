import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { forgotSendOtpSchema } from "@/lib/validation";
import { issueOtp } from "@/lib/otp";
import { sendEmail, otpEmail } from "@/lib/email";
import { apiOk, handleRouteError } from "@/lib/api";
import { rateLimit, clientIp } from "@/lib/rateLimit";

/**
 * POST /api/auth/forgot-password/send-otp
 * Always responds the same way — never reveals whether the email exists.
 */
export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const ipLimit = rateLimit({ scope: "forgot-otp:ip", identifier: ip, limit: 10, windowMs: 10 * 60 * 1000 });
    if (!ipLimit.allowed) {
      return apiOk({ message: "If an account exists for that email, a reset code is on its way." }); // same generic response
    }

    const body = await request.json().catch(() => null);
    const { email } = forgotSendOtpSchema.parse(body ?? {});

    const emailLimit = rateLimit({ scope: "forgot-otp:email", identifier: email, limit: 5, windowMs: 10 * 60 * 1000 });
    if (emailLimit.allowed) {
      await connectDB();
      const user = await User.findOne({ email }).select("_id").lean();
      if (user) {
        const { code } = await issueOtp({ email, purpose: "forgot-password" });
        const { subject, html, text } = otpEmail({ code, purpose: "forgot-password" });
        await sendEmail({ to: email, subject, html, text });
      }
    }

    return apiOk({ message: "If an account exists for that email, a reset code is on its way." });
  } catch (error) {
    return handleRouteError(error, "auth/forgot-password/send-otp");
  }
}
