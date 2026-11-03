import Link from "next/link";
import { MailCheck, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import Logo from "./Logo";

/**
 * Split-screen shell for auth pages:
 * left = brand/security showcase (desktop only), right = the form.
 */
export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-6 px-4 pb-12 pt-20 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:pt-16">
      {/* ── Brand panel ─────────────────────────────────────────── */}
      <aside className="relative hidden overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#101736] via-[#131a3d] to-[#1b1030] p-10 lg:block" aria-hidden="true">
        {/* inner glows */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="relative flex h-full flex-col">
          <Link href="/" className="flex w-max items-center gap-2.5">
            <Logo size={40} />
            <span className="text-xl font-extrabold tracking-tight text-white">Aegis Auth</span>
          </Link>

          <div className="mt-12">
            <span className="glass-pill inline-flex items-center gap-2 px-3 py-1.5 text-[0.7rem] font-bold uppercase tracking-[0.18em] text-violet-200/90">
              <Sparkles className="h-3.5 w-3.5" /> Secure by design
            </span>
            <h2 className="mt-6 text-4xl font-extrabold leading-[1.12] tracking-tight text-white">
              Fort Knox security,
              <br />
              <span className="gradient-text">featherweight feel.</span>
            </h2>
            <p className="mt-4 max-w-md text-[0.95rem] leading-relaxed text-mist-dim">
              Every account is protected by hashed one-time codes, sliding sessions, and rate limits — while signing in stays a two-second affair.
            </p>
          </div>

          <ul className="mt-10 space-y-5">
            <li className="flex items-start gap-4">
              <div className="icon-tile"><MailCheck className="h-5 w-5" /></div>
              <div>
                <p className="font-bold text-white">Email OTP verification</p>
                <p className="mt-0.5 text-sm text-mist-dim">6-digit codes, 10-minute expiry, auto-deleted from the database.</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="icon-tile"><RefreshCw className="h-5 w-5" /></div>
              <div>
                <p className="font-bold text-white">Sliding 7-day sessions</p>
                <p className="mt-0.5 text-sm text-mist-dim">JWT re-issued on every visit. A week away? You simply sign in again.</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="icon-tile"><ShieldCheck className="h-5 w-5" /></div>
              <div>
                <p className="font-bold text-white">Defence in depth</p>
                <p className="mt-0.5 text-sm text-mist-dim">bcrypt cost-12 hashing, rate limits, attempt locks, httpOnly cookies.</p>
              </div>
            </li>
          </ul>

          {/* Decorative OTP card */}
          <div className="pointer-events-none mt-auto select-none pt-12" aria-hidden="true">
            <div className="glass-soft relative w-max animate-float px-6 py-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-mist-faint">Your code</p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-[0.35em] text-white">4 8 2 9 1 7</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Form column ─────────────────────────────────────────── */}
      <div className="w-full">{children}</div>
    </div>
  );
}
