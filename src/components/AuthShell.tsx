import Link from "next/link";
import { cookies } from "next/headers";
import { MailCheck, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import Logo from "./Logo";
import { getCurrentUser } from "@/lib/dal";
import { parseAppearanceCookie, APPEARANCE_COOKIE, type LayoutId } from "@/lib/appearance";

/**
 * Auth page shell — renders one of three layouts, chosen by the
 * user's saved appearance (account) or their local cookie:
 *   layout-1 → Split panel (brand showcase + form)
 *   layout-2 → Centered card (logo header above the form)
 *   layout-3 → Slim rail (vertical brand rail + form)
 */
export default async function AuthShell({ children }: { children: React.ReactNode }) {
  const [user, store] = await Promise.all([getCurrentUser(), cookies()]);
  const cookieLayout = parseAppearanceCookie(store.get(APPEARANCE_COOKIE)?.value).layout;
  const layout: LayoutId = user?.layout ?? cookieLayout ?? "layout-1";

  if (layout === "layout-2") return <CenteredShell>{children}</CenteredShell>;
  if (layout === "layout-3") return <RailShell>{children}</RailShell>;
  return <SplitShell>{children}</SplitShell>;
}

/* ── layout-1 · Split panel ─────────────────────────────────── */
function SplitShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-4.5rem-1rem)] max-w-6xl grid-cols-1 content-center gap-6 px-4 pb-12 pt-2 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:pt-4">
      {/* Brand panel */}
      <aside className="auth-aside relative hidden overflow-hidden rounded-[2rem] p-10 lg:block" aria-hidden="true">
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

          <div className="pointer-events-none mt-auto select-none pt-12" aria-hidden="true">
            <div className="glass-soft relative w-max animate-float px-6 py-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-mist-faint">Your code</p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-[0.35em] text-white">4 8 2 9 1 7</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="w-full">{children}</div>
    </div>
  );
}

/* ── layout-2 · Centered card ───────────────────────────────── */
function CenteredShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4.5rem-1rem)] max-w-lg flex-col items-center justify-center px-4 pb-16 pt-4 text-center">
      <Link href="/" className="group flex items-center gap-3" aria-label="Aegis Auth home">
        <Logo size={52} />
        <span className="text-left">
          <span className="block text-2xl font-extrabold tracking-tight text-white">Aegis<span className="gradient-text"> Auth</span></span>
          <span className="block text-[0.62rem] font-bold uppercase tracking-[0.28em] text-mist-faint">Secure by design</span>
        </span>
      </Link>

      <div className="mt-6 w-full">{children}</div>
    </div>
  );
}

/* ── layout-3 · Slim rail ───────────────────────────────────── */
function RailShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid min-h-[calc(100vh-4.5rem-1rem)] max-w-7xl grid-cols-1 lg:grid-cols-[11rem_1fr]">
      {/* Vertical brand rail */}
      <aside className="relative hidden items-center justify-center border-r border-white/10 py-10 lg:flex" aria-hidden="true">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative flex h-full flex-col items-center justify-between">
          <Link href="/" className="flex flex-col items-center gap-3" aria-label="Aegis Auth home">
            <Logo size={40} />
          </Link>
          <p className="font-mono text-[1.05rem] font-bold uppercase leading-none tracking-[0.45em] text-white/55" style={{ writingMode: "vertical-rl" }}>
            AEGIS AUTH
          </p>
          <p className="text-[0.55rem] font-bold uppercase tracking-[0.3em] text-mist-faint">v1.0</p>
        </div>
      </aside>

      {/* Form area */}
      <div className="flex w-full items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
