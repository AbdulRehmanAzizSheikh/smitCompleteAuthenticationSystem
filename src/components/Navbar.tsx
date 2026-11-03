import Link from "next/link";
import Logo from "./Logo";
import LogoutButton from "./LogoutButton";
import MobileMenu from "./MobileMenu";
import { getInitials } from "@/lib/utils";
import type { CurrentUserDTO } from "@/lib/dal";

/**
 * Session-aware glass navigation bar.
 * Receives the (possibly null) current user from the server layout/page.
 */
export default function Navbar({ user }: { user: CurrentUserDTO | null }) {
  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4">
        <div className="pointer-events-auto mt-4 flex h-14 items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0b1128]/70 px-3 shadow-[0_18px_60px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl sm:px-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5" aria-label="Aegis Auth home">
            <Logo size={30} />
            <span className="text-[1.05rem] font-extrabold tracking-tight text-white">
              Aegis
              <span className="ml-1.5 align-[1px] text-[0.6rem] font-bold uppercase tracking-[0.22em] text-mist-faint">
                Auth
              </span>
            </span>
          </Link>

          {/* Desktop actions */}
          <nav className="hidden items-center gap-2 md:flex" aria-label="Primary">
            {user ? (
              <>
                <Link href="/dashboard" className="rounded-full px-4 py-2 text-sm font-semibold text-mist-dim transition hover:bg-white/5 hover:text-white">
                  Overview
                </Link>
                <Link href="/settings" className="rounded-full px-4 py-2 text-sm font-semibold text-mist-dim transition hover:bg-white/5 hover:text-white">
                  Settings
                </Link>
                <div className="mx-1 h-5 w-px bg-white/10" />
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 via-violet-400 to-pink-400 text-[0.72rem] font-extrabold text-[#0b1020]" title={user.email}>
                  {getInitials(user.displayName || user.username)}
                </div>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-mist-dim transition hover:bg-white/5 hover:text-white">
                  Sign in
                </Link>
                <Link href="/register" className="btn-primary !px-5 !py-2 text-sm">
                  Get started
                </Link>
              </>
            )}
          </nav>

          {/* Mobile toggle */}
          <MobileMenu user={user ? { displayName: user.displayName, email: user.email } : null} />
        </div>
      </div>
    </header>
  );
}
