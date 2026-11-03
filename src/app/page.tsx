import Link from "next/link";
import {
  MailCheck,
  KeyRound,
  RefreshCw,
  ShieldCheck,
  AtSign,
  UserRoundPen,
  ArrowRight,
  Check,
  Fingerprint,
  Sparkles,
  Lock,
  Timer,
  ListFilter,
  BadgeCheck,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* ───────── HERO ───────── */}
      <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-32 text-center sm:pt-36">
        <div className="animate-fade-up">
          <span className="glass-pill mx-auto inline-flex items-center gap-2 px-4 py-2 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-violet-200">
            <Sparkles className="h-3.5 w-3.5 text-pink-300" />
            SIT Bootcamp — Complete Auth System
          </span>
        </div>

        <h1 className="animate-fade-up delay-1 mx-auto mt-7 max-w-4xl text-[2.6rem] font-extrabold leading-[1.06] tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl">
          Authentication that feels <span className="gradient-text">effortless.</span>
        </h1>

        <p className="animate-fade-up delay-2 mx-auto mt-6 max-w-2xl text-base leading-relaxed text-mist-dim sm:text-lg">
          Register with email OTP verification, sign in with email <em>or</em> username, and manage
          your account with military-grade security — wrapped in a glass-smooth experience.
        </p>

        <div className="animate-fade-up delay-3 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/register" className="btn-primary !px-7 !py-3.5 !text-base">
            Create your account
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/login" className="btn-glass !px-7 !py-3.5 !text-base">
            Sign in instead
          </Link>
        </div>

        <p className="animate-fade-up delay-4 mt-5 text-xs font-medium uppercase tracking-[0.18em] text-mist-faint">
          10-min OTP · Sliding JWT · bcrypt-12 · Zero shortcuts
        </p>

        {/* Floating preview card */}
        <div className="pointer-events-none relative mx-auto mt-16 hidden max-w-3xl select-none sm:block" aria-hidden="true">
          <div className="glass animate-fade-up delay-4 mx-auto flex items-center gap-4 !rounded-3xl p-5 text-left">
            <div className="icon-tile !h-12 !w-12">
              <MailCheck className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.18em] text-mist-faint">Email verification</p>
              <p className="mt-0.5 font-semibold text-white">Your 6-digit code is on the way</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" /> Live
            </span>
          </div>
          <div className="glass-soft animate-float absolute -left-2 -top-8 hidden items-center gap-2 px-4 py-2.5 text-xs font-semibold text-sky-200 md:flex">
            <BadgeCheck className="h-4 w-4 text-sky-300" /> OTP verified
          </div>
          <div className="glass-soft animate-float-late absolute -right-2 -top-2 hidden items-center gap-2 px-4 py-2.5 text-xs font-semibold text-violet-200 md:flex">
            <RefreshCw className="h-4 w-4 text-violet-300" /> Session renewed · 7d
          </div>
        </div>
      </section>

      {/* ───────── FEATURES ───────── */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-violet-300">What's inside</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Everything an auth system <span className="gradient-text">should</span> do
          </h2>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass-soft group p-6 transition-transform duration-300 hover:-translate-y-1">
              <div className="icon-tile">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-mist-dim">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── HOW IT WORKS ───────── */}
      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-sky-300">The flow</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Register in four steps</h2>
        </div>

        <ol className="mt-12 grid gap-4 md:grid-cols-4">
          {STEPS.map((step, i) => (
            <li key={i} className="glass relative p-6">
              <span className="absolute right-5 top-4 font-mono text-4xl font-black text-white/10">0{i + 1}</span>
              <div className="icon-tile">
                <step.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-bold text-white">{step.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-mist-dim">{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ───────── SECURITY ───────── */}
      <section id="security" className="mx-auto max-w-6xl scroll-mt-28 px-4 py-16">
        <div className="glass overflow-hidden !rounded-[2rem]">
          <div className="grid lg:grid-cols-2">
            <div className="p-8 sm:p-12">
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-pink-300">Under the hood</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white">Security isn't a feature.<br />It's the foundation.</h2>
              <p className="mt-3 max-w-md text-mist-dim">
                Every layer was built assuming someone will try to break it — so nothing was left to chance.
              </p>
              <ul className="mt-8 space-y-4">
                {SECURITY_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-sm text-mist">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-400/15">
                      <Check className="h-3.5 w-3.5 text-emerald-300" strokeWidth={3} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative flex items-center justify-center border-t border-white/5 bg-gradient-to-br from-violet-600/15 via-transparent to-sky-500/15 p-10 lg:border-l lg:border-t-0">
              <div className="w-full max-w-sm">
                <div className="glass-soft flex items-center gap-4 p-4">
                  <Fingerprint className="h-8 w-8 text-violet-300" />
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.18em] text-mist-faint">Credential check</p>
                    <p className="font-bold text-white">bcrypt · cost factor 12</p>
                  </div>
                </div>
                <div className="glass-soft mt-4 flex items-center gap-4 p-4">
                  <Timer className="h-8 w-8 text-sky-300" />
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.18em] text-mist-faint">OTP lifetime</p>
                    <p className="font-bold text-white">10 minutes · auto-deleted (TTL)</p>
                  </div>
                </div>
                <div className="glass-soft mt-4 flex items-center gap-4 p-4">
                  <ListFilter className="h-8 w-8 text-pink-300" />
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.18em] text-mist-faint">Abuse control</p>
                    <p className="font-bold text-white">Rate limits + 5-attempt OTP lock</p>
                  </div>
                </div>
                <div className="glass-soft mt-4 flex items-center gap-4 p-4">
                  <Lock className="h-8 w-8 text-emerald-300" />
                  <div>
                    <p className="text-[0.68rem] uppercase tracking-[0.18em] text-mist-faint">Session</p>
                    <p className="font-bold text-white">httpOnly JWT · sliding 7 days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── CTA ───────── */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          Ready to <span className="gradient-text">experience it?</span>
        </h2>
        <p className="mx-auto mt-3 max-w-md text-mist-dim">Create your account in under a minute — your inbox will do the rest.</p>
        <Link href="/register" className="btn-primary mx-auto mt-7 !px-8 !py-4 !text-base">
          Get started — it's free
          <ArrowRight className="h-5 w-5" />
        </Link>
      </section>
    </div>
  );
}

const FEATURES = [
  { icon: MailCheck, title: "Email OTP verification", desc: "6-digit codes delivered via Hostinger SMTP — verified before your account is ever created." },
  { icon: KeyRound, title: "Sign in with email or username", desc: "One identifier, your choice. Either works, always case-insensitive." },
  { icon: RefreshCw, title: "Sliding 7-day sessions", desc: "JWT re-issued on every visit; expires only after a full week away." },
  { icon: ShieldCheck, title: "Forgot & reset password", desc: "OTP-authorised reset flow — the old password never blocks you again." },
  { icon: AtSign, title: "Secure email change", desc: "Authorise on your current inbox, verify the new one. Two codes, zero hijacks." },
  { icon: UserRoundPen, title: "Username & display name", desc: "Display name changes instantly; usernames change with email OTP confirmation." },
];

const STEPS = [
  { icon: UserRoundPen, title: "Fill the form", desc: "Username, email, password — plus a live strength meter and show/hide toggle." },
  { icon: MailCheck, title: "Verify your email", desc: "We send a 6-digit code via Nodemailer and store it hashed in a separate collection." },
  { icon: Timer, title: "Code expires in 10 min", desc: "The OTP record self-destructs via a MongoDB TTL index — nothing lingers." },
  { icon: BadgeCheck, title: "Account created", desc: "We verify the code, create the account, email a welcome note, and sign you in." },
];

const SECURITY_POINTS = [
  "Passwords hashed with bcrypt at cost factor 12 — never stored in plain text.",
  "OTPs are bcrypt-hashed too, limited to 5 wrong attempts, and expire after 10 minutes.",
  "Sliding httpOnly JWT (SameSite=Lax) — invisible to JavaScript, immune to XSS theft.",
  "Per-IP and per-email rate limits on every sensitive endpoint.",
  "OTP stored in a dedicated collection with a MongoDB TTL index — auto-deleted on expiry.",
  "Security headers (X-Frame-Options, nosniff, Referrer-Policy) on every response.",
];
