"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import LogoutButton from "./LogoutButton";

/** Hamburger menu for small screens — keeps the navbar honest on mobile. */
export default function MobileMenu({ user }: { user: { displayName: string; email: string } | null }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-mist"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute left-4 right-4 top-[4.5rem] rounded-2xl border border-white/12 bg-[#0b1128]/95 p-3 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
          {user ? (
            <div className="flex flex-col gap-1">
              <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-widest text-mist-faint">
                Signed in as <span className="text-mist">{user.displayName}</span>
              </p>
              <Link onClick={() => setOpen(false)} href="/dashboard" className="rounded-xl px-3 py-2.5 text-sm font-semibold text-mist transition hover:bg-white/5">
                Overview
              </Link>
              <Link onClick={() => setOpen(false)} href="/settings" className="rounded-xl px-3 py-2.5 text-sm font-semibold text-mist transition hover:bg-white/5">
                Settings
              </Link>
              <div className="mt-2 border-t border-white/10 pt-2">
                <LogoutButton variant="full" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <Link onClick={() => setOpen(false)} href="/login" className="rounded-xl px-3 py-2.5 text-sm font-semibold text-mist transition hover:bg-white/5">
                Sign in
              </Link>
              <Link onClick={() => setOpen(false)} href="/register" className="rounded-xl px-3 py-2.5 text-sm font-semibold text-mist transition hover:bg-white/5">
                Create account
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
