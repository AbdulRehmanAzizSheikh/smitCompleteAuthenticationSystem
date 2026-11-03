import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { usernameChangeVerifySchema, usernameSchema } from "@/lib/validation";
import { verifyOtp } from "@/lib/otp";
import { apiOk, apiFail, handleRouteError, getApiUser, otpFailureMessage } from "@/lib/api";

/**
 * POST /api/user/username/verify (authenticated)
 * Verifies the OTP and applies the username stored in the OTP metadata.
 */
export async function POST(request: Request) {
  try {
    const apiUser = await getApiUser();
    if (!apiUser) return apiFail(401, "Please sign in.");

    const body = await request.json().catch(() => null);
    const { otp } = usernameChangeVerifySchema.parse(body ?? {});

    const verdict = await verifyOtp({
      email: apiUser.email,
      purpose: "username-change",
      code: otp,
      userId: apiUser.id,
      consume: true,
    });

    if (!verdict.ok) return apiFail(400, otpFailureMessage(verdict.reason));

    const parsed = usernameSchema.safeParse(verdict.meta?.newUsername);
    if (!parsed.success) {
      return apiFail(400, "Stored username payload was invalid. Request a new code.");
    }
    const newUsername = parsed.data;

    await connectDB();
    // Re-check availability at apply time (someone may have taken it since the code was sent)
    const taken = await User.exists({ username: newUsername, _id: { $ne: apiUser.id } });
    if (taken) return apiFail(409, "That username was just taken. Please pick another.");

    const user = await User.findByIdAndUpdate(
      apiUser.id,
      { username: newUsername },
      { new: true, runValidators: true }
    ).select("username displayName");

    if (!user) return apiFail(404, "Account not found.");

    return apiOk({ message: "Username updated.", username: user.username });
  } catch (error) {
    return handleRouteError(error, "user/username/verify");
  }
}
