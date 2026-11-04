"use client";

import { useEffect, useRef, useState } from "react";
import { Palette, Check, MonitorSmartphone, Info } from "lucide-react";
import { THEMES, applyTheme, syncThemeToAccount, type ThemeId } from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * Appearance switcher — a proper themed popover (not a plain dropdown).
 * Logged in  → saved to the account.
 * Logged out → saved locally (and synced to account on next sign-in/up).
 */
export default function ThemeToggle({ initialTheme, isAuthed }: { initialTheme: ThemeId; isAuthed: boolean }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<ThemeId>(initialTheme);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  async function choose(theme: ThemeId) {
    setActive(theme);
    applyTheme(theme);
    setOpen(false);
    if (isAuthed) await syncThemeToAccount(theme);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open appearance settings"
        title="Appearance"
        aria-expanded={open}
        aria-haspopup="dialog"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-mist-dim transition hover:border-white/20 hover:bg-white/10 hover:text-white"
      >
        <Palette className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Choose theme"
          className="mobile-panel absolute right-0 top-12 z-50 w-[min(30rem,calc(100vw-2rem))] max-h-[80vh] overflow-y-auto rounded-3xl p-4 sm:top-14"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-white/10 pb-3">
            <span className="icon-tile !h-9 !w-9 !rounded-xl">
              <Palette className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-white">Appearance</p>
              <p className="text-[0.68rem] leading-tight text-mist-faint">
                {isAuthed ? "Saved to your account · syncs everywhere" : "Saved on this device · sign in to sync"}
              </p>
            </div>
            <MonitorSmartphone className="ml-auto h-4 w-4 shrink-0 text-mist-faint" aria-hidden="true" />
          </div>

          {/* Theme grid — proper card layout */}
          <div className="grid grid-cols-2 gap-2.5 pt-3 max-h-[62vh] overflow-y-auto pr-1 sm:grid-cols-3">
            {THEMES.map((theme) => {
              const selected = active === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => choose(theme.id)}
                  aria-pressed={selected}
                  className={cn(
                    "group rounded-2xl border p-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50",
                    selected
                      ? "border-violet-400/50 bg-violet-400/10 shadow-[0_0_0_3px_rgba(167,139,250,0.18)]"
                      : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]"
                  )}
                >
                  {/* Swatch preview */}
                  <div className="relative h-16 w-full overflow-hidden rounded-xl border border-white/10 sm:h-[4.5rem]" style={{ background: theme.swatch }} aria-hidden="true">
                    <div className="absolute left-2 top-2 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                      <span className="h-1.5 w-1.5 rounded-full bg-white/45" />
                      <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                    </div>
                    <div className="absolute left-2 right-2 top-5 rounded-md bg-white/25 px-1.5 py-1 backdrop-blur-sm sm:top-6">
                      <div className="h-1.5 w-2/3 rounded-full bg-white/70" />
                      <div className="mt-1 h-1.5 w-1/3 rounded-full bg-white/40" />
                    </div>
                    {selected && (
                      <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-[#06281f]">
                        <Check className="h-3 w-3" strokeWidth={3.5} />
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 px-0.5">
                    <p className="text-[0.72rem] font-extrabold leading-tight text-white">{theme.name}</p>
                    <p className="text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-violet-300/80 group-hover:text-violet-200">{theme.label}</p>
                  </div>
                </button>
              );
            })}
            {/* Filler cell keeps the grid tidy */}
            <div className="hidden items-center justify-center rounded-2xl border border-dashed border-white/10 p-2 text-center sm:flex" aria-hidden="true">
              <p className="text-[0.62rem] leading-snug text-mist-faint">More<br />coming<br />soon</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3 text-[0.65rem] text-mist-faint">
            <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Applies instantly — no reload needed.</span>
          </div>
        </div>
      )}
    </div>
  );
}
