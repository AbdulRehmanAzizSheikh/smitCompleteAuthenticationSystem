import { Schema, model, models, type Types } from "mongoose";

/**
 * Separate OTP collection (kept apart from `users`).
 * Documents self-destruct via a TTL index 10 minutes after creation/refresh.
 */

export const OTP_PURPOSES = [
  "register",
  "forgot-password",
  "username-change",
  "email-change-old",
  "email-change-new",
  "account-delete",
] as const;

export type OtpPurpose = (typeof OTP_PURPOSES)[number];

export interface IOtp {
  email: string; // the inbox the OTP was sent to (lowercase)
  userId?: Types.ObjectId; // set for logged-in flows (change username/email)
  purpose: OtpPurpose;
  otpHash: string; // bcrypt hash of the 6-digit code — raw OTP is never stored
  meta: Record<string, unknown>; // e.g. { newEmail, newUsername }
  attempts: number; // wrong guesses; lock after MAX_OTP_ATTEMPTS
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const MAX_OTP_ATTEMPTS = 5;

const otpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: undefined, index: true },
    purpose: { type: String, required: true, enum: OTP_PURPOSES, index: true },
    otpHash: { type: String, required: true },
    meta: { type: Schema.Types.Mixed, default: {} },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// MongoDB automatically deletes the document once `expiresAt` passes.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// One active OTP per email+purpose at a time — resending replaces the old one.
otpSchema.index({ email: 1, purpose: 1 });

export const Otp = models.Otp || model<IOtp>("Otp", otpSchema);
