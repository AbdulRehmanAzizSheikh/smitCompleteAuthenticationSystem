import { destroySession } from "@/lib/session";
import { apiOk } from "@/lib/api";

/** POST /api/auth/logout — destroys the session cookie. */
export async function POST() {
  await destroySession();
  return apiOk({ message: "Signed out successfully." });
}
