import { apiFail, apiOk, getApiUser } from "@/lib/api";

/** GET /api/auth/me — current session user as a DTO (401 when signed out). */
export async function GET() {
  const user = await getApiUser();
  if (!user) return apiFail(401, "Not authenticated.");
  return apiOk({ user });
}
