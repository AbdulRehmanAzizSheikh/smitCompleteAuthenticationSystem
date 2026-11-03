"use client";

import { useState, type FormEvent } from "react";
import {
  Mail,
  Loader2,
  MailCheck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";
import OtpInput from "@/components/OtpInput";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Step = "enter" | "authorize" | "verify-new" | "done";

/**
 * Email change — three steps, two inboxes:
 *   1. Enter the new email → authorize code goes to the CURRENT inbox
 *   2. Confirm that code → verification code is sent to the NEW inbox
 *   3. Confirm the second code → email is updated, both inboxes notified
 */
export default function EmailChangeForm({ currentEmail, maskedCurrentEmail }: { currentEmail: string; maskedCurrentEmail: string }) {
  const [appliedEmail, setAppliedEmail] = useState(currentEmail);
  const [currentMasked, setCurrentMasked] = useState(maskedCurrentEmail);
  const [step, setStep] = useState<Step>("enter");

  const [newEmail, setNewEmail] = useState("");
  const [oldOtp, setOldOtp] = useState("");
  const [newOtp, setNewOtp] = useState("");
  const [maskedNew, setMaskedNew] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oldInvalid, setOldInvalid] = useState(false);
  const [newInvalid, setNewInvalid] = useState(false);

  const normalizedNew = newEmail.trim().toLowerCase();
  const isValidNew = EMAIL_RE.test(normalizedNew) && normalizedNew !== appliedEmail.toLowerCase();

  function fail(data: { message?: string; fieldErrors?: Record<string, string> } | null, fallback: string, markInvalid?: "old" | "new") {
    const message = data?.message ?? data?.fieldErrors?.newEmail ?? data?.fieldErrors?.email ?? fallback;
    setError(message);
    if (markInvalid === "old" && /code/i.test(message)) setOldInvalid(true);
    if (markInvalid === "new" && /code/i.test(message)) setNewInvalid(true);
  }

  async function post(url: string, body: unknown) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => null);
    return { ok: res.ok, data };
  }

  async function start(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!isValidNew) {
      setError("Enter a different, valid email address.");
      return;
    }
    setBusy(true);
    const { ok, data } = await post("/api/user/email-change/start", { newEmail: normalizedNew });
    setBusy(false);
    if (!ok) return fail(data, "Couldn't send the authorization code.");
    setCurrentMasked(data?.maskedCurrentEmail ?? currentMasked);
    setMaskedNew(null);
    setStep("authorize");
    setOldOtp("");
    toast.success("Authorization code sent to your current email.");
  }

  async function authorize(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOldInvalid(false);
    if (!/^\d{6}$/.test(oldOtp)) {
      setError("Enter the 6-digit code.");
      return;
    }
    setBusy(true);
    const { ok, data } = await post("/api/user/email-change/verify-old", { otp: oldOtp });
    setBusy(false);
    if (!ok) return fail(data, "Couldn't verify the code.", "old");
    setMaskedNew(data?.maskedNewEmail ?? null);
    setStep("verify-new");
    setNewOtp("");
    toast.success("Current email confirmed — code sent to the new inbox.");
  }

  async function confirmNew(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNewInvalid(false);
    if (!/^\d{6}$/.test(newOtp)) {
      setError("Enter the 6-digit code.");
      return;
    }
    setBusy(true);
    const { ok, data } = await post("/api/user/email-change/verify-new", { otp: newOtp, newEmail: normalizedNew });
    setBusy(false);
    if (!ok) return fail(data, "Couldn't verify the new email.", "new");
    setAppliedEmail(data.email);
    setStep("done");
    toast.success("Email address updated.");
  }

  function reset() {
    setStep("enter");
    setNewEmail("");
    setOldOtp("");
    setNewOtp("");
    setError(null);
    setOldInvalid(false);
    setNewInvalid(false);
  }

  /* ── Done state ───────────────────────────────────── */
  if (step === "done") {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-300" />
        <p className="mt-3 font-extrabold text-white">Email updated</p>
        <p className="mt-1 text-sm text-mist-dim">
          Your account now uses <span className="font-semibold text-mist">{appliedEmail}</span>. Both inboxes were notified.
        </p>
        <button type="button" onClick={reset} className="btn-glass mt-4 !text-xs">
          Change again
        </button>
      </div>
    );
  }

  const stepIndex = step === "enter" ? 0 : step === "authorize" ? 1 : 2;

  return (
    <div className="space-y-4">
      {/* Step tracker */}
      <ol className="flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.16em]">
        {["New email", "Authorize", "Verify"].map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full border text-[0.65rem]",
              i < stepIndex ? "border-emerald-400/40 bg-emerald-400/15 text-emerald-300"
                : i === stepIndex ? "border-violet-400/50 bg-violet-400/15 text-violet-200"
                : "border-white/10 bg-white/5 text-mist-faint"
            )}>
              {i < stepIndex ? "✓" : i + 1}
            </span>
            <span className={i <= stepIndex ? "text-mist" : "text-mist-faint"}>{label}</span>
            {i < 2 && <ArrowRight className="h-3 w-3 text-mist-faint" />}
          </li>
        ))}
      </ol>

      {error && <p className="field-error !mt-0">{error}</p>}

      {/* ── Step 1: enter the new email ─────────────────── */}
      {step === "enter" && (
        <form onSubmit={start} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label htmlFor="new-email" className="label">New email address</label>
            <div className="relative">
              <Mail className="input-icon" aria-hidden="true" />
              <input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => { setNewEmail(e.target.value); setError(null); }}
                placeholder="you@newdomain.com"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                className={cn("input", error && "input-error")}
              />
            </div>
            <p className="mt-1.5 text-[0.7rem] text-mist-faint">
              Current: <span className="font-semibold text-mist-dim">{appliedEmail}</span>
            </p>
          </div>
          <button type="submit" disabled={busy || !isValidNew} className="btn-glass shrink-0">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <MailCheck className="h-4 w-4" />}
            Send code
          </button>
        </form>
      )}

      {/* ── Step 2: authorize from the CURRENT inbox ─────── */}
      {step === "authorize" && (
        <form onSubmit={authorize} className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-200">Step 1 — Confirm it's you</p>
          <p className="mt-1 text-xs leading-relaxed text-mist-dim">
            Someone asked to change this account's email to <span className="font-semibold text-mist">{normalizedNew}</span>.
            We sent a code to <span className="font-semibold text-mist">{currentMasked}</span> — enter it if this was you.
          </p>
          <div className="mt-3">
            <OtpInput value={oldOtp} onChange={(v) => { setOldOtp(v); setOldInvalid(false); setError(null); }} hasError={oldInvalid} />
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <button type="button" onClick={reset} className="text-[0.72rem] font-bold text-mist-faint transition hover:text-mist">
              ← Cancel change
            </button>
            <button type="submit" disabled={busy} className="btn-glass !text-xs">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              Confirm current email
            </button>
          </div>
        </form>
      )}

      {/* ── Step 3: verify the NEW inbox ─────────────────── */}
      {step === "verify-new" && (
        <form onSubmit={confirmNew} className="rounded-2xl border border-violet-400/20 bg-violet-400/5 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-200">Step 2 — Prove ownership of the new email</p>
          <p className="mt-1 text-xs leading-relaxed text-mist-dim">
            Enter the code we sent to <span className="font-semibold text-mist">{maskedNew ?? normalizedNew}</span>.
            Only after this will your account email change.
          </p>
          <div className="mt-3">
            <OtpInput value={newOtp} onChange={(v) => { setNewOtp(v); setNewInvalid(false); setError(null); }} hasError={newInvalid} />
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <button type="button" onClick={reset} className="text-[0.72rem] font-bold text-mist-faint transition hover:text-mist">
              ← Cancel change
            </button>
            <button type="submit" disabled={busy} className="btn-primary !px-5 !py-2 !text-xs">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
              Verify new email
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
