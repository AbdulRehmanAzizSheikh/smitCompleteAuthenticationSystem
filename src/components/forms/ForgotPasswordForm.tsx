"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Mail,
  Loader2,
  ArrowRight,
  AlertCircle,
  MailCheck,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import PasswordInput from "@/components/PasswordInput";
import OtpInput from "@/components/OtpInput";
import { cn, maskEmail } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<"email" | "reset" | "done">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [banner, setBanner] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [otpInvalid, setOtpInvalid] = useState(false);

  const cooldownTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => {
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
  }, []);

  function startCooldown(seconds = 60) {
    setCooldown(seconds);
    if (cooldownTimer.current) clearInterval(cooldownTimer.current);
    cooldownTimer.current = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1 && cooldownTimer.current) {
          clearInterval(cooldownTimer.current);
          cooldownTimer.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  async function sendCode(e?: FormEvent) {
    e?.preventDefault();
    setBanner(null);
    setFieldErrors({});
    const normalized = email.trim().toLowerCase();
    if (!EMAIL_RE.test(normalized)) {
      setFieldErrors({ email: "Enter a valid email address" });
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
      });
      // Response is intentionally generic — no account enumeration
      if (!res.ok && res.status !== 200) {
        const data = await res.json().catch(() => null);
        setBanner(data?.message ?? "Couldn't send the code. Try again.");
        return;
      }
      setStep("reset");
      setOtp("");
      startCooldown(60);
      toast.success("If that inbox exists, a code is on its way.");
    } catch {
      setBanner("Network error — check your connection and try again.");
    } finally {
      setSending(false);
    }
  }

  async function onReset(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBanner(null);
    setFieldErrors({});
    setOtpInvalid(false);

    const errors: Record<string, string> = {};
    if (!/^\d{6}$/.test(otp)) errors.otp = "Enter the 6-digit code";
    if (password.length < 8) errors.password = "At least 8 characters";
    if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp, password, confirmPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data?.fieldErrors) setFieldErrors(data.fieldErrors);
        const message: string = data?.message ?? "Couldn't reset your password.";
        if (/code/i.test(message)) setOtpInvalid(true);
        setBanner(message);
        return;
      }

      setStep("done");
      toast.success("Password updated successfully.");
    } catch {
      setBanner("Network error — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  /* ── Success state ─────────────────────────────────────── */
  if (step === "done") {
    return (
      <div className="mt-8 flex flex-col items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-8 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/15">
          <CheckCircle2 className="h-9 w-9 text-emerald-300" />
        </span>
        <h2 className="mt-5 text-xl font-extrabold text-white">Password updated</h2>
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-mist-dim">
          Your new password is live. Sign in to pick up right where you left off.
        </p>
        <Link href="/login" className="btn-primary mt-6 !px-7">
          <ShieldCheck className="h-5 w-5" /> Sign in now <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-7">
      {/* Progress pills */}
      <div className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.18em]">
        <span className={cn("rounded-full border px-3 py-1.5", step === "email" ? "border-violet-400/40 bg-violet-400/10 text-violet-200" : "border-emerald-400/30 bg-emerald-400/10 text-emerald-300")}>
          {step === "email" ? "1 · Your email" : "✓ Email"}
        </span>
        <span className="h-px w-6 bg-white/10" />
        <span className={cn("rounded-full border px-3 py-1.5", step === "reset" ? "border-violet-400/40 bg-violet-400/10 text-violet-200" : "border-white/10 bg-white/5 text-mist-faint")}>
          2 · New password
        </span>
      </div>

      {banner && (
        <div role="alert" className="mt-4 flex items-start gap-2.5 rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {banner}
        </div>
      )}

      {/* ── Step 1: email ─────────────────────────────────── */}
      {step === "email" && (
        <form onSubmit={sendCode} className="mt-5 space-y-5" noValidate>
          <div>
            <label htmlFor="reset-email" className="label">Account email</label>
            <div className="relative">
              <Mail className="input-icon" aria-hidden="true" />
              <input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                className={cn("input", fieldErrors.email && "input-error")}
              />
            </div>
            {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
          </div>

          <button type="submit" disabled={sending} className="btn-primary w-full !py-3.5">
            {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <><MailCheck className="h-5 w-5" /> Send reset code <ArrowRight className="h-5 w-5" /></>}
          </button>
        </form>
      )}

      {/* ── Step 2: OTP + new password ────────────────────── */}
      {step === "reset" && (
        <form onSubmit={onReset} className="mt-5 space-y-5" noValidate>
          <div className="rounded-2xl border border-violet-400/20 bg-violet-400/5 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-200/90">Enter the 6-digit code</p>
              <button
                type="button"
                onClick={() => sendCode()}
                disabled={cooldown > 0 || sending}
                className="text-[0.72rem] font-bold text-violet-300 transition hover:text-violet-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
              </button>
            </div>
            <div className="mt-3">
              <OtpInput value={otp} onChange={(v) => { setOtp(v); setOtpInvalid(false); }} hasError={otpInvalid} autoFocus />
            </div>
            {fieldErrors.otp && <p className="field-error">{fieldErrors.otp}</p>}
            <p className="mt-2.5 text-[0.72rem] text-mist-faint">
              If an account exists for <span className="font-semibold text-mist-dim">{maskEmail(email.trim().toLowerCase())}</span>, the code is in its inbox. Valid for 10 minutes.
            </p>
          </div>

          <div>
            <label htmlFor="new-password" className="label">New password</label>
            <PasswordInput id="new-password" value={password} onChange={setPassword} error={fieldErrors.password} showStrength autoComplete="new-password" />
          </div>

          <div>
            <label htmlFor="confirm-new-password" className="label">Confirm new password</label>
            <PasswordInput id="confirm-new-password" value={confirmPassword} onChange={setConfirmPassword} error={fieldErrors.confirmPassword} autoComplete="new-password" placeholder="Repeat your new password" />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <><ShieldCheck className="h-5 w-5" /> Reset password <ArrowRight className="h-5 w-5" /></>}
          </button>
        </form>
      )}
    </div>
  );
}
