import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { displayNameUpdateSchema } from "@/lib/validation";
import { apiOk, apiFail, handleRouteError, getApiUser } from "@/lib/api";

/**
 * PATCH /api/user/display-name (authenticated)
 * Display name changes instantly — no OTP required.
 */
export async function PATCH(request: Request) {
  try {
    const apiUser = await getApiUser();
    if (!apiUser) return apiFail(401, "Please sign in.");

    const body = await request.json().catch(() => null);
    const { displayName } = displayNameUpdateSchema.parse(body ?? {});

    await connectDB();
    const user = await User.findByIdAndUpdate(
      apiUser.id,
      { displayName },
      { new: true, runValidators: true }
    ).select("displayName");

    if (!user) return apiFail(404, "Account not found.");

    return apiOk({ message: "Display name updated.", displayName: user.displayName });
  } catch (error) {
    return handleRouteError(error, "user/display-name");
  }
}
