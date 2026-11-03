import "server-only";

/**
 * Fixed-window in-memory rate limiter.
 * Keyed by `scope:identifier` (usually IP + route bucket).
 *
 * Note: on serverless platforms each instance keeps its own map, so treat
 * this as a first line of defence. Sensitive endpoints ALSO enforce
 * per-record attempt limits in MongoDB (see `MAX_OTP_ATTEMPTS`).
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodically sweep expired buckets so the map doesn't grow unbounded
const SWEEP_INTERVAL_MS = 60_000;
let lastSweep = Date.now();
function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

export function rateLimit(params: {
  scope: string;
  identifier: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const { scope, identifier, limit, windowMs } = params;
  const now = Date.now();
  sweep(now);

  const key = `${scope}:${identifier}`;
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, limit, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  const remaining = Math.max(0, limit - existing.count);
  const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);

  return { allowed: existing.count <= limit, limit, remaining, retryAfterSeconds };
}

export function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
