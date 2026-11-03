import { connectDB } from "@/lib/db";
import { apiOk } from "@/lib/api";

/**
 * GET /api/health — deployment diagnostics.
 * Reports ONLY whether env vars are present (booleans, never values)
 * and whether MongoDB is reachable from this deployment.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const env = {
    MONGODB_URI: Boolean(process.env.MONGODB_URI),
    JWT_SECRET: Boolean(process.env.JWT_SECRET),
    SESSION_TTL_DAYS: Boolean(process.env.SESSION_TTL_DAYS),
    SMTP_HOST: Boolean(process.env.SMTP_HOST),
    SMTP_PORT: Boolean(process.env.SMTP_PORT),
    SMTP_USER: Boolean(process.env.SMTP_USER),
    SMTP_PASS: Boolean(process.env.SMTP_PASS),
    EMAIL_FROM: Boolean(process.env.EMAIL_FROM),
    NEXT_PUBLIC_APP_URL: Boolean(process.env.NEXT_PUBLIC_APP_URL),
  };

  let db: "connected" | "failed" | "not-configured" = "not-configured";
  if (env.MONGODB_URI) {
    try {
      await connectDB();
      db = "connected";
    } catch (error) {
      console.error("[health] MongoDB connection failed:", error);
      db = "failed";
    }
  }

  return apiOk({ env, db, timestamp: new Date().toISOString() });
}
