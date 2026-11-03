import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { themeUpdateSchema } from "@/lib/validation";
import { apiOk, apiFail, handleRouteError, getApiUser } from "@/lib/api";

/**
 * PATCH /api/user/theme (authenticated)
 * Persists the user's UI theme choice to their account.
 * Anonymous users persist it in localStorage only.
 */
export async function PATCH(request: Request) {
  try {
    const apiUser = await getApiUser();
    if (!apiUser) return apiFail(401, "Please sign in.");

    const body = await request.json().catch(() => null);
    const { theme } = themeUpdateSchema.parse(body ?? {});

    await connectDB();
    const user = await User.findByIdAndUpdate(apiUser.id, { theme }, { new: true, runValidators: true }).select("theme");
    if (!user) return apiFail(404, "Account not found.");

    return apiOk({ message: "Theme saved to your account.", theme: user.theme });
  } catch (error) {
    return handleRouteError(error, "user/theme");
  }
}
