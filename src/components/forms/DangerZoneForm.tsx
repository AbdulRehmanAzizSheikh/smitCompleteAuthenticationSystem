"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, ShieldAlert, CheckCircle2, MailCheck } from "lucide-react";
import { toast } from "sonner";
import OtpInput from "@/components/OtpInput";

/**
 * Danger zone — permanent account deletion.
 * Flow mirrors email/username change: code to the current inbox first,
 * then one irreversible click with the code entered.
 */
export default function DangerZoneForm({ maskedEmail }: { maskedEmail: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "sent" | "done">("idle");
  const [otp, setOtp] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/user/delete-account/send-otp", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message ?? "Couldn't send the code.");
        return;
      }
      setStep("sent");
      setOtp("");
      startCooldown(60);
      toast.success("Deletion code sent to your current inbox.");
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOtpInvalid(false);
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code.");
      return;
    }
    if (!acknowledged) {
      setError("Please confirm you understand this is permanent.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/user/delete-account/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        const message: string = data?.message ?? "Couldn't delete the account.";
        if (/code/i.test(message)) setOtpInvalid(true);
        setError(message);
        return;
      }
      setStep("done");
      toast.success("Account deleted permanently.");
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 2500);
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  if (step === "done") {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-rose-400/25 bg-rose-400/10 p-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-rose-300" />
        <p className="mt-3 font-extrabold text-white">Account deleted</p>
        <p className="mt-1 max-w-sm text-sm text-mist-dim">
          Your profile, credentials and data were permanently removed. A confirmation email is on its way. You'll be redirected home…
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-rose-400/20 bg-rose-400/5 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-400/15 text-rose-300">
          <ShieldAlert className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-extrabold text-rose-200">Delete my account</p>
          <p className="mt-1 text-xs leading-relaxed text-mist-dim">
            Permanently removes your profile, username, email, password and all account data from
            our servers. <strong className="text-rose-200">This cannot be undone</strong> — a fresh
            signup would start from zero.
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 flex items-start gap-2 rounded-xl border border-rose-400/25 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      )}

      {step === "idle" && (
        <button type="button" onClick={sendCode} disabled={busy} className="mt-4 inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-400/10 px-5 py-2.5 text-sm font-bold text-rose-200 transition hover:bg-rose-400/20 disabled:cursor-not-allowed disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}
          Send deletion code to {maskedEmail}
        </button>
      )}

      {step === "sent" && (
        <form onSubmit={confirmDelete} className="mt-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-rose-200/90">Enter the 6-digit code</p>
            <button
              type="button"
              onClick={sendCode}
              disabled={cooldown > 0 || busy}
              className="text-[0.72rem] font-bold text-rose-200/80 transition hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </div>
          <OtpInput value={otp} onChange={(v) => { setOtp(v); setOtpInvalid(false); setError(null); }} hasError={otpInvalid} />

          <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs leading-relaxed text-mist-dim transition hover:border-rose-400/25">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => { setAcknowledged(e.target.checked); setError(null); }}
              className="mt-0.5 h-4 w-4 accent-rose-500"
            />
            <span>I understand this action is <strong className="text-white">permanent</strong> and my account cannot be recovered.</span>
          </label>

          <button type="submit" disabled={busy || otp.length !== 6 || !acknowledged} className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-rose-400/40 bg-rose-500/80 px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_10px_35px_rgba(244,63,94,0.35)] transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-40">
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldAlert className="h-5 w-5" />}
            Permanently delete my account
          </button>
        </form>
      )}
    </div>
  );
}
