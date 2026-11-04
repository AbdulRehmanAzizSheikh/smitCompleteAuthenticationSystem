import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { appearanceUpdateSchema } from "@/lib/validation";
import { apiOk, apiFail, handleRouteError, getApiUser } from "@/lib/api";

/**
 * PATCH /api/user/appearance (authenticated)
 * Partial update of the user's appearance (theme / mode / layout / buttons / icons).
 */
export async function PATCH(request: Request) {
  try {
    const apiUser = await getApiUser();
    if (!apiUser) return apiFail(401, "Please sign in.");

    const body = await request.json().catch(() => null);
    const patch = appearanceUpdateSchema.parse(body ?? {});

    await connectDB();
    const user = await User.findByIdAndUpdate(apiUser.id, patch, { new: true, runValidators: true })
      .select("theme mode layout buttons icons")
      .lean();
    if (!user) return apiFail(404, "Account not found.");

    return apiOk({ message: "Appearance saved to your account.", appearance: user });
  } catch (error) {
    return handleRouteError(error, "user/appearance");
  }
}
