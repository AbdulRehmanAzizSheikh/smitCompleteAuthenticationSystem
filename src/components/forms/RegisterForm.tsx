"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Loader2,
  ArrowRight,
  AlertCircle,
  MailCheck,
  CheckCircle2,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";
import PasswordInput from "@/components/PasswordInput";
import OtpInput from "@/components/OtpInput";
import { cn, maskEmail } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

export default function RegisterForm() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [codeSent, setCodeSent] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
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

  async function sendCode() {
    setBanner(null);
    setFieldErrors((prev) => ({ ...prev, email: "" }));
    const normalized = email.trim().toLowerCase();

    if (!EMAIL_RE.test(normalized)) {
      setFieldErrors((prev) => ({ ...prev, email: "Enter a valid email address" }));
      return;
    }

    setSendingCode(true);
    try {
      const res = await fetch("/api/auth/register/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFieldErrors((prev) => ({ ...prev, email: data?.message ?? "Couldn't send the code." }));
        return;
      }

      setCodeSent(true);
      setOtp("");
      setOtpInvalid(false);
      startCooldown(60);
      toast.success(`Code sent to ${maskEmail(normalized)}`);
    } catch {
      setBanner("Network error — check your connection and try again.");
    } finally {
      setSendingCode(false);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBanner(null);
    setFieldErrors({});
    setOtpInvalid(false);

    // ── Client-side pre-flight (server re-validates everything) ──
    const errors: Record<string, string> = {};
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedUsername = username.trim().toLowerCase();

    if (!USERNAME_RE.test(normalizedUsername))
      errors.username = "3–20 chars: lowercase letters, numbers, underscores";
    if (!EMAIL_RE.test(normalizedEmail)) errors.email = "Enter a valid email address";
    if (password.length < 8) errors.password = "At least 8 characters";
    if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match";
    if (!codeSent) errors.email = "Click “Verify email” first — we’ll send you a code";
    else if (!/^\d{6}$/.test(otp)) errors.otp = "Enter the 6-digit code";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: normalizedUsername,
          email: normalizedEmail,
          password,
          confirmPassword,
          otp,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data?.fieldErrors) setFieldErrors(data.fieldErrors);
        const message: string = data?.message ?? "Couldn't create your account.";
        if (/code|otp/i.test(message)) setOtpInvalid(true);
        setBanner(message);
        return;
      }

      toast.success("Account created — welcome aboard!");
      router.push("/dashboard");
      router.refresh();
    } catch {
      setBanner("Network error — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-7 space-y-5" noValidate>
      {banner && (
        <div role="alert" className="flex items-start gap-2.5 rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {banner}
        </div>
      )}

      {/* Username */}
      <div>
        <label htmlFor="username" className="label">Username</label>
        <div className="relative">
          <User className="input-icon" aria-hidden="true" />
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="cool_user_27"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className={cn("input", fieldErrors.username && "input-error")}
          />
        </div>
        {fieldErrors.username && <p className="field-error">{fieldErrors.username}</p>}
      </div>

      {/* Email + verify button */}
      <div>
        <label htmlFor="email" className="label">Email</label>
        <div className="relative">
          <Mail className="input-icon" aria-hidden="true" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (codeSent) setCodeSent(false);
            }}
            placeholder="you@example.com"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            className={cn("input", fieldErrors.email && "input-error")}
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          {fieldErrors.email
            ? <p className="field-error !mt-0 flex-1">{fieldErrors.email}</p>
            : <span className="text-xs text-mist-faint">We’ll never share it.</span>}
          <button
            type="button"
            onClick={sendCode}
            disabled={sendingCode || cooldown > 0}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition",
              codeSent
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-violet-400/35 bg-violet-400/10 text-violet-200 hover:bg-violet-400/20",
              "disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            {sendingCode
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : codeSent
                ? <CheckCircle2 className="h-3.5 w-3.5" />
                : <MailCheck className="h-3.5 w-3.5" />}
            {cooldown > 0 ? `Resend in ${cooldown}s` : codeSent ? "Code sent" : "Verify email"}
          </button>
        </div>

        {/* OTP section — slides in after a code is sent */}
        {codeSent && (
          <div className="animate-fade-up mt-4 rounded-2xl border border-violet-400/20 bg-violet-400/5 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-200/90">Enter the 6-digit code</p>
              <span className="font-mono text-[0.7rem] text-mist-faint">expires in 10:00</span>
            </div>
            <div className="mt-3">
              <OtpInput value={otp} onChange={(v) => { setOtp(v); setOtpInvalid(false); }} hasError={otpInvalid} autoFocus />
            </div>
            {fieldErrors.otp && <p className="field-error">{fieldErrors.otp}</p>}
            <p className="mt-2.5 text-[0.72rem] leading-relaxed text-mist-faint">
              Sent to <span className="font-semibold text-mist-dim">{maskEmail(email.trim().toLowerCase())}</span>.
              Wrong inbox? Edit the email above and resend.
            </p>
          </div>
        )}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="label">Password</label>
        <PasswordInput id="password" value={password} onChange={setPassword} error={fieldErrors.password} showStrength autoComplete="new-password" />
      </div>

      {/* Confirm password */}
      <div>
        <label htmlFor="confirmPassword" className="label">Confirm password</label>
        <PasswordInput id="confirmPassword" value={confirmPassword} onChange={setConfirmPassword} error={fieldErrors.confirmPassword} autoComplete="new-password" placeholder="Repeat your password" />
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5">
        {loading
          ? <Loader2 className="h-5 w-5 animate-spin" />
          : <><BadgeCheck className="h-5 w-5" /> Create account <ArrowRight className="h-5 w-5" /></>}
      </button>

      <p className="text-center text-[0.72rem] leading-relaxed text-mist-faint">
        By creating an account you agree to keep your credentials safe. We never store plain passwords or codes.
      </p>
    </form>
  );
}
