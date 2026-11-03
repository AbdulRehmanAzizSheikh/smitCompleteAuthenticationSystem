import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { flattenIssues } from "./validation";
import { getCurrentUser, type CurrentUserDTO } from "./dal";

/** Consistent API envelope: { success, ... } */

export function apiOk(data: Record<string, unknown> = {}, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function apiFail(status: number, message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, message, ...extra }, { status });
}

export function handleRouteError(error: unknown, context: string) {
  if (error instanceof ZodError) {
    return apiFail(422, "Please fix the highlighted fields.", { fieldErrors: flattenIssues(error) });
  }
  console.error(`[${context}]`, error);
  return apiFail(500, "Something went wrong on our side. Please try again.");
}

/**
 * Returns the authenticated user DTO, or null.
 * Route handlers use this to answer 401 instead of redirecting.
 */
export async function getApiUser(): Promise<CurrentUserDTO | null> {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

/** Map issueOtp/verifyOtp failure reasons to human messages. */
export function otpFailureMessage(reason: "not_found" | "expired" | "too_many_attempts" | "invalid"): string {
  switch (reason) {
    case "not_found":
      return "No pending code found for this email. Request a new one.";
    case "expired":
      return "That code expired (codes last 10 minutes). Request a new one.";
    case "too_many_attempts":
      return "Too many wrong attempts. Request a new code.";
    case "invalid":
      return "Incorrect code. Please try again.";
  }
}
