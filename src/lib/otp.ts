import "server-only";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { connectDB } from "./db";
import { Otp, OTP_TTL_MS, MAX_OTP_ATTEMPTS, type OtpPurpose } from "./models/Otp";

/**
 * OTP lifecycle: generate → hash (bcrypt) → store in `otps` (TTL 10 min)
 * → verify with attempt limiting → consume.
 * Raw OTPs are never stored or logged.
 */

export function generateOtpCode(): string {
  // 6 digits, cryptographically random, zero-padded
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1_000_000).padStart(6, "0");
}

export async function issueOtp(params: {
  email: string;
  purpose: OtpPurpose;
  userId?: string;
  meta?: Record<string, unknown>;
}): Promise<{ code: string; expiresAt: Date }> {
  const { email, purpose, userId, meta = {} } = params;
  const normalizedEmail = email.trim().toLowerCase();

  const code = generateOtpCode();
  const otpHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await connectDB();
  // Replace any previous OTP for the same email+purpose (resend = fresh code)
  await Otp.deleteMany({ email: normalizedEmail, purpose });
  await Otp.create({
    email: normalizedEmail,
    purpose,
    otpHash,
    meta,
    attempts: 0,
    expiresAt,
    ...(userId ? { userId: new Types.ObjectId(userId) } : {}),
  });

  return { code, expiresAt };
}

export type OtpVerifyResult =
  | { ok: true; meta: Record<string, unknown> }
  | { ok: false; reason: "not_found" | "expired" | "too_many_attempts" | "invalid" };

export async function verifyOtp(params: {
  email: string;
  purpose: OtpPurpose;
  code: string;
  userId?: string;
  consume?: boolean; // delete the OTP after a successful verification (default true)
}): Promise<OtpVerifyResult> {
  const { email, purpose, code, userId, consume = true } = params;
  const normalizedEmail = email.trim().toLowerCase();

  await connectDB();
  const query: Record<string, unknown> = { email: normalizedEmail, purpose };
  if (userId) query.userId = new Types.ObjectId(userId);

  const record = await Otp.findOne(query);
  if (!record) return { ok: false, reason: "not_found" };

  // TTL index deletes expired docs eventually, but check explicitly too
  if (record.expiresAt.getTime() < Date.now()) {
    await Otp.deleteOne({ _id: record._id });
    return { ok: false, reason: "expired" };
  }

  if (record.attempts >= MAX_OTP_ATTEMPTS) {
    return { ok: false, reason: "too_many_attempts" };
  }

  const match = await bcrypt.compare(code, record.otpHash);
  if (!match) {
    record.attempts += 1;
    await record.save();
    return { ok: false, reason: "invalid" };
  }

  const meta = (record.meta ?? {}) as Record<string, unknown>;
  if (consume) await Otp.deleteOne({ _id: record._id });

  return { ok: true, meta };
}

export async function deleteOtps(email: string, purpose?: OtpPurpose) {
  await connectDB();
  const normalizedEmail = email.trim().toLowerCase();
  await Otp.deleteMany(purpose ? { email: normalizedEmail, purpose } : { email: normalizedEmail });
}
