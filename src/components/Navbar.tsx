import Link from "next/link";
import { cookies } from "next/headers";
import Logo from "./Logo";
import LogoutButton from "./LogoutButton";
import MobileMenu from "./MobileMenu";
import ThemeToggle from "./ThemeToggle";
import FixThemeButton from "./FixThemeButton";
import { getInitials } from "@/lib/utils";
import { DEFAULT_THEME, type ThemeId } from "@/lib/theme";
import { parseAppearanceCookie, APPEARANCE_COOKIE } from "@/lib/appearance";
import type { CurrentUserDTO } from "@/lib/dal";

/**
 * Session-aware glass navigation bar.
 * Receives the (possibly null) current user and the live/extracted theme from the server layout.
 * Reads the appearance cookie to know if the user pinned their theme.
 */
export default async function Navbar({ user, currentTheme }: { user: CurrentUserDTO | null; currentTheme?: string }) {
  const cookieStore = await cookies();
  const cookieMode = parseAppearanceCookie(cookieStore.get(APPEARANCE_COOKIE)?.value).mode;
  const pinned = user?.mode === "fixed" || cookieMode === "fixed";
  const theme: ThemeId = (currentTheme as ThemeId | undefined) ?? user?.theme ?? DEFAULT_THEME;

  return (
    <header className="sticky top-3 z-40 sm:top-4">
      <div className="mx-auto max-w-6xl px-4">
        <div className="pointer-events-auto mt-4 flex h-14 items-center justify-between gap-3 rounded-2xl px-3 sm:px-4 navbar-bar">
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
                <ThemeToggle initialTheme={theme} isAuthed />
                <FixThemeButton pinned={pinned} isAuthed />
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
                <ThemeToggle initialTheme={theme} isAuthed={false} />
                <FixThemeButton pinned={pinned} isAuthed={false} />
                <Link href="/register" className="btn-primary !px-5 !py-2 text-sm">
                  Get started
                </Link>
              </>
            )}
          </nav>

          {/* Mobile: theme toggle + pin + hamburger (visible below md) */}
          <div className="flex items-center gap-2 md:hidden">
            <FixThemeButton pinned={pinned} isAuthed={!!user} />
            <ThemeToggle initialTheme={theme} isAuthed={!!user} />
            <MobileMenu user={user ? { displayName: user.displayName, email: user.email } : null} />
          </div>
        </div>
      </div>
    </header>
  );
}
