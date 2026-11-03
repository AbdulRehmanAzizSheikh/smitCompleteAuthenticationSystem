"use client";

import { useState, type FormEvent } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import PasswordInput from "@/components/PasswordInput";

/** Change password — requires the CURRENT password. No OTP involved. */
export default function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!currentPassword) errors.currentPassword = "Enter your current password";
    if (newPassword.length < 8) errors.newPassword = "At least 8 characters";
    if (newPassword === currentPassword && newPassword.length > 0) errors.newPassword = "Must differ from current password";
    if (newPassword !== confirmPassword) errors.confirmPassword = "Passwords do not match";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.fieldErrors) setFieldErrors(data.fieldErrors);
        setError(data?.message ?? "Couldn't update your password.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated. A confirmation email is on its way.");
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error && (
        <p role="alert" className="rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="current-password" className="label">Current password</label>
        <PasswordInput id="current-password" value={currentPassword} onChange={setCurrentPassword} error={fieldErrors.currentPassword} autoComplete="current-password" />
      </div>

      <div>
        <label htmlFor="new-password" className="label">New password</label>
        <PasswordInput id="new-password" value={newPassword} onChange={setNewPassword} error={fieldErrors.newPassword} showStrength autoComplete="new-password" />
      </div>

      <div>
        <label htmlFor="confirm-password" className="label">Confirm new password</label>
        <PasswordInput id="confirm-password" value={confirmPassword} onChange={setConfirmPassword} error={fieldErrors.confirmPassword} autoComplete="new-password" placeholder="Repeat your new password" />
      </div>

      <button type="submit" disabled={busy} className="btn-primary">
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <><ShieldCheck className="h-5 w-5" /> Update password</>}
      </button>
    </form>
  );
}
