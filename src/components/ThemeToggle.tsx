"use client";

import { useEffect, useRef, useState } from "react";
import { Palette, Check } from "lucide-react";
import { THEMES, applyTheme, syncThemeToAccount, type ThemeId } from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * Compact theme picker for the navbar.
 * Logged in → saved to the account. Logged out → saved in localStorage only.
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
        aria-label="Choose theme"
        title="Change theme"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-mist-dim transition hover:border-white/20 hover:bg-white/10 hover:text-white"
      >
        <Palette className="h-4 w-4" />
      </button>

      {open && (
        <div role="listbox" aria-label="Theme options" className="mobile-panel absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl p-1.5">
          <p className="px-3 pb-1.5 pt-2 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-mist-faint">Theme</p>
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              role="option"
              aria-selected={active === theme.id}
              onClick={() => choose(theme.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/5",
                active === theme.id && "bg-white/5"
              )}
            >
              <span className="h-8 w-8 shrink-0 rounded-lg border border-white/10" style={{ background: theme.swatch }} aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-mist">{theme.name} — {theme.label}</span>
              </span>
              {active === theme.id && <Check className="h-4 w-4 shrink-0 text-emerald-300" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
