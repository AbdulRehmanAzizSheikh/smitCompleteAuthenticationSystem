import type { Metadata } from "next";
import Link from "next/link";
import {
  AtSign,
  BadgeCheck,
  ChevronRight,
  Fingerprint,
  KeyRound,
  Mail,
  MailCheck,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Timer,
  UserRoundPen,
  ListFilter,
  CalendarDays,
  LogOut,
} from "lucide-react";
import { requireUser } from "@/lib/dal";
import { getInitials } from "@/lib/utils";
import CopyButton from "@/components/CopyButton";
import LogoutButton from "@/components/LogoutButton";

export const metadata: Metadata = {
  title: "Overview",
  description: "Your Aegis Auth account at a glance — profile, security posture and quick actions.",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const memberSince = new Date(user.createdAt);
  const memberSinceLabel = memberSince.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const accountAgeDays = Math.max(1, Math.floor((Date.now() - memberSince.getTime()) / 86_400_000));

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:pt-8">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="glass flex flex-col gap-6 !rounded-[2rem] p-6 sm:flex-row sm:items-center sm:p-8">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-sky-400 via-violet-400 to-pink-400 text-2xl font-black text-[#0b1020] shadow-[0_10px_35px_rgba(167,139,250,0.4)]"
          aria-hidden="true"
        >
          {getInitials(user.displayName || user.username)}
        </div>
        <div className="min-w-0 flex-1">
          <span className="glass-pill inline-flex items-center gap-2 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-emerald-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-dot" /> Verified account
          </span>
          <h1 className="mt-2.5 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Welcome back, <span className="gradient-text">{user.displayName}</span>
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-mist-dim">
            <span className="inline-flex items-center gap-1.5"><AtSign className="h-4 w-4" />{user.username}</span>
            <span className="hidden text-mist-faint sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" />Member since {memberSinceLabel}</span>
          </p>
        </div>
        <Link href="/settings" className="btn-glass shrink-0 !text-sm">
          <UserRoundPen className="h-4 w-4" /> Edit profile
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* ── LEFT: overview + security ─────────────────────── */}
        <div className="space-y-6 lg:col-span-2">
          <section className="glass p-6 sm:p-7" aria-labelledby="overview-heading">
            <div className="flex items-center justify-between gap-4">
              <h2 id="overview-heading" className="flex items-center gap-2.5 text-lg font-extrabold text-white">
                <Sparkles className="h-5 w-5 text-violet-300" /> Account overview
              </h2>
              <span className="text-xs font-semibold text-mist-faint">{accountAgeDays} day{accountAgeDays === 1 ? "" : "s"} old</span>
            </div>

            <dl className="mt-5 divide-y divide-white/5">
              <Row label="Display name" value={user.displayName} />
              <Row label="Username" value={`@${user.username}`} copy={user.username} />
              <Row label="Email" value={user.email} copy={user.email} />
              <Row label="Account ID" value={user.id.slice(0, 8) + "…" + user.id.slice(-6)} copy={user.id} mono />
            </dl>
          </section>

          <section className="glass p-6 sm:p-7" aria-labelledby="security-heading">
            <h2 id="security-heading" className="flex items-center gap-2.5 text-lg font-extrabold text-white">
              <ShieldCheck className="h-5 w-5 text-emerald-300" /> Security posture
            </h2>
            <ul className="mt-5 space-y-3">
              <SecurityRow icon={Fingerprint} tint="text-violet-300" title="Password hashing" detail="bcrypt · cost factor 12 · never stored in plain text" />
              <SecurityRow icon={RefreshCw} tint="text-sky-300" title="Session handling" detail="httpOnly JWT · SameSite=Lax · sliding 7-day expiry, refreshed on every visit" />
              <SecurityRow icon={Timer} tint="text-pink-300" title="OTP policy" detail="6 digits · 10-minute TTL · bcrypt-hashed · auto-deleted by MongoDB TTL index" />
              <SecurityRow icon={ListFilter} tint="text-amber-300" title="Brute-force control" detail="5 wrong OTP attempts lock the code · per-IP & per-email rate limiting" />
            </ul>
          </section>
        </div>

        {/* ── RIGHT: quick actions + session ────────────────── */}
        <div className="space-y-6">
          <section className="glass p-6" aria-labelledby="actions-heading">
            <h2 id="actions-heading" className="text-lg font-extrabold text-white">Quick actions</h2>
            <ul className="mt-4 space-y-2">
              <QuickAction href="/settings#display-name" icon={UserRoundPen} label="Change display name" hint="Instant — no code needed" />
              <QuickAction href="/settings#username" icon={AtSign} label="Change username" hint="Email OTP required" />
              <QuickAction href="/settings#email" icon={Mail} label="Change email" hint="2 codes — old + new inbox" />
              <QuickAction href="/settings#password" icon={KeyRound} label="Change password" hint="Current password required" />
            </ul>
          </section>

          <section className="glass p-6" aria-labelledby="session-heading">
            <h2 id="session-heading" className="flex items-center gap-2 text-lg font-extrabold text-white">
              <BadgeCheck className="h-5 w-5 text-sky-300" /> Your session
            </h2>
            <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
              <p className="flex items-center gap-2 text-sm font-bold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse-dot" /> Active now
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-mist-dim">
                This session auto-renews on every visit and expires after 7 days without you. Signing out revokes it instantly.
              </p>
            </div>
            <div className="mt-4">
              <LogoutButton variant="full" />
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-[0.7rem] text-mist-faint">
              <MailCheck className="h-3.5 w-3.5" /> Signed in as {user.email}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

/* ───────────── bits ───────────── */

function Row({ label, value, copy, mono = false }: { label: string; value: string; copy?: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3.5">
      <dt className="text-[0.72rem] font-bold uppercase tracking-[0.16em] text-mist-faint">{label}</dt>
      <dd className={`flex min-w-0 items-center gap-1.5 text-sm font-semibold text-mist ${mono ? "font-mono text-[0.82rem]" : ""}`}>
        <span className="truncate">{value}</span>
        {copy && <CopyButton text={copy} label={`Copy ${label.toLowerCase()}`} />}
      </dd>
    </div>
  );
}

function SecurityRow({ icon: Icon, tint, title, detail }: { icon: typeof Fingerprint; tint: string; title: string; detail: string }) {
  return (
    <li className="flex items-start gap-3.5 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${tint}`} aria-hidden="true" />
      <span>
        <span className="block text-sm font-bold text-white">{title}</span>
        <span className="mt-0.5 block text-[0.78rem] leading-relaxed text-mist-dim">{detail}</span>
      </span>
    </li>
  );
}

function QuickAction({ href, icon: Icon, label, hint }: { href: string; icon: typeof Mail; label: string; hint: string }) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3 transition hover:border-violet-400/25 hover:bg-violet-400/5"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/5 text-mist-dim transition group-hover:text-violet-200">
          <Icon className="h-[1.1rem] w-[1.1rem]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold text-white">{label}</span>
          <span className="block text-[0.7rem] text-mist-faint">{hint}</span>
        </span>
        <ChevronRight className="h-4 w-4 shrink-0 text-mist-faint transition group-hover:translate-x-0.5 group-hover:text-white" />
      </Link>
    </li>
  );
}
