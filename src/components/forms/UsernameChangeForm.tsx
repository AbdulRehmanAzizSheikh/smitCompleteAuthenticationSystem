"use client";

import { useState, type FormEvent } from "react";
import { AtSign, Loader2, MailCheck, ShieldCheck, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import OtpInput from "@/components/OtpInput";
import { cn } from "@/lib/utils";

const USERNAME_RE = /^[a-z0-9_]{3,20}$/;

/** Username change — requires an email OTP sent to the CURRENT inbox. */
export default function UsernameChangeForm({ currentUsername, maskedEmail }: { currentUsername: string; maskedEmail: string }) {
  const [username, setUsername] = useState(currentUsername);
  const [applied, setApplied] = useState(currentUsername);
  const [otp, setOtp] = useState("");
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpInvalid, setOtpInvalid] = useState(false);

  const candidate = username.trim().toLowerCase();
  const isValid = USERNAME_RE.test(candidate);
  const isChanged = candidate !== applied;

  async function sendCode(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValid) {
      setError("3–20 chars: lowercase letters, numbers, underscores.");
      return;
    }
    if (!isChanged) {
      setError("That is already your username.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/user/username/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newUsername: candidate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message ?? "Couldn't send the code.");
        return;
      }
      setAwaitingCode(true);
      setOtp("");
      setHint(data?.maskedEmail ?? maskedEmail);
      toast.success("Verification code sent.");
    } catch {
      setError("Network error — try again.");
    } finally {
      setSending(false);
    }
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOtpInvalid(false);
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code.");
      return;
    }

    setVerifying(true);
    try {
      const res = await fetch("/api/user/username/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        const message: string = data?.message ?? "Couldn't verify the code.";
        if (/code/i.test(message)) setOtpInvalid(true);
        setError(message);
        return;
      }
      setApplied(data.username);
      setUsername(data.username);
      setAwaitingCode(false);
      setOtp("");
      toast.success(`Username changed to @${data.username}`);
    } catch {
      setError("Network error — try again.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <form onSubmit={awaitingCode ? verify : sendCode} className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="new-username" className="label">New username</label>
          <div className="relative">
            <AtSign className="input-icon" aria-hidden="true" />
            <input
              id="new-username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.toLowerCase());
                setError(null);
              }}
              placeholder="cool_user_27"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className={cn("input font-mono", error && !awaitingCode && "input-error")}
            />
          </div>
          {error && !awaitingCode && <p className="field-error">{error}</p>}
        </div>
        <button type="submit" disabled={sending || verifying || (!awaitingCode && (!isValid || !isChanged))} className="btn-glass shrink-0">
          {sending || verifying
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : awaitingCode
              ? <ShieldCheck className="h-4 w-4" />
              : <MailCheck className="h-4 w-4" />}
          {awaitingCode ? "Verify & change" : "Send code"}
        </button>
      </div>

      {awaitingCode && (
        <div className="animate-fade-up rounded-2xl border border-violet-400/20 bg-violet-400/5 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-200/90">Confirm your inbox</p>
          <p className="mt-1 text-xs text-mist-dim">
            We sent a 6-digit code to <span className="font-semibold text-mist">{hint}</span> — valid for 10 minutes.
          </p>
          <div className="mt-3">
            <OtpInput value={otp} onChange={(v) => { setOtp(v); setOtpInvalid(false); setError(null); }} hasError={otpInvalid} />
          </div>
          {error && <p className="field-error">{error}</p>}
          <button type="button" onClick={() => { setAwaitingCode(false); setOtp(""); setError(null); }} className="mt-3 text-[0.72rem] font-bold text-mist-faint transition hover:text-mist">
            ← Use a different username
          </button>
        </div>
      )}

      {!awaitingCode && applied && (
        <p className="flex items-center gap-1.5 text-[0.72rem] font-semibold text-emerald-300/90">
          <BadgeCheck className="h-4 w-4" /> Current username: <span className="font-mono">@{applied}</span>
        </p>
      )}
    </form>
  );
}
