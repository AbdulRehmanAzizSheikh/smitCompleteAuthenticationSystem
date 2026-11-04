import { z } from "zod";

/**
 * Centralised zod schemas + shared field rules.
 */

export const PASSWORD_MIN = 8;

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
  .max(72, "Password must be at most 72 characters") // bcrypt truncation limit
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[0-9]/, "Must contain at least one number");

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address")
  .max(254, "Email is too long");

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers and underscores");

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Display name cannot be empty")
  .max(50, "Display name must be at most 50 characters")
  .regex(/^[^<>]*$/, "Display name contains invalid characters");

export const otpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter the 6-digit code");

export const registerSchema = z
  .object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    otp: otpCodeSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const loginSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or username").max(254),
  password: z.string().min(1, "Enter your password").max(72),
});

export const sendRegisterOtpSchema = z.object({ email: emailSchema });

export const forgotSendOtpSchema = z.object({ email: emailSchema });

export const forgotResetSchema = z
  .object({
    email: emailSchema,
    otp: otpCodeSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password").max(72),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const displayNameUpdateSchema = z.object({ displayName: displayNameSchema });

export const usernameChangeStartSchema = z.object({ newUsername: usernameSchema });
export const usernameChangeVerifySchema = z.object({ otp: otpCodeSchema });

export const emailChangeStartSchema = z.object({ newEmail: emailSchema });
export const emailChangeVerifyOldSchema = z.object({ otp: otpCodeSchema });
export const emailChangeVerifyNewSchema = z.object({ otp: otpCodeSchema });
export const accountDeleteVerifySchema = z.object({ otp: otpCodeSchema });
export const appearanceUpdateSchema = z
  .object({
    theme: z.enum(["theme-1", "theme-2", "theme-3", "theme-4", "theme-5"]).optional(),
    mode: z.enum(["auto", "rotate", "fixed"]).optional(),
    layout: z.enum(["layout-1", "layout-2", "layout-3"]).optional(),
    buttons: z.enum(["buttons-1", "buttons-2", "buttons-3", "buttons-4", "buttons-5"]).optional(),
    icons: z.enum(["icons-1", "icons-2", "icons-3", "icons-4", "icons-5"]).optional(),
  })
  .refine((obj) => Object.values(obj).some((v) => v !== undefined), { message: "At least one part is required" });

/** Flattens zod errors into { field: message } for API responses. */
export function flattenIssues(error: z.ZodError) {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return fieldErrors;
}
