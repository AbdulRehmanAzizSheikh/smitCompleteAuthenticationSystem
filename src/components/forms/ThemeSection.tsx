"use client";

import { useState } from "react";
import { Check, Palette, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { THEMES, applyTheme, syncThemeToAccount, type ThemeId } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** Settings page theme picker — saved to the account (this page requires sign-in). */
export default function ThemeSection({ initialTheme }: { initialTheme: ThemeId }) {
  const [active, setActive] = useState<ThemeId>(initialTheme);
  const [saving, setSaving] = useState<ThemeId | null>(null);

  async function choose(theme: ThemeId) {
    setActive(theme);
    applyTheme(theme);
    setSaving(theme);
    try {
      await syncThemeToAccount(theme);
      toast.success(`${THEMES.find((t) => t.id === theme)?.label} applied & saved.`);
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
      {THEMES.map((theme) => {
        const isActive = active === theme.id;
        return (
          <button
            key={theme.id}
            type="button"
            onClick={() => choose(theme.id)}
            aria-pressed={isActive}
            disabled={saving === theme.id}
            className={cn(
              "group relative overflow-hidden rounded-2xl border p-3 text-left transition",
              isActive
                ? "border-violet-400/50 bg-violet-400/10 shadow-[0_0_0_4px_rgba(167,139,250,0.15)]"
                : "border-white/10 bg-white/[0.03] hover:border-white/20"
            )}
          >
            {/* Mini preview */}
            <div className="h-24 w-full overflow-hidden rounded-xl border border-white/10" style={{ background: theme.swatch }} aria-hidden="true">
              <div className="mx-2 mt-3 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
                <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
              </div>
              <div className="mx-3 mt-2 rounded-lg border border-white/25 bg-white/20 px-2 py-1.5">
                <div className="h-1.5 w-3/4 rounded-full bg-white/60" />
                <div className="mt-1 h-1.5 w-1/2 rounded-full bg-white/35" />
              </div>
            </div>

            <div className="mt-3 flex items-start justify-between gap-2">
              <span>
                <span className="block text-sm font-extrabold text-white">{theme.name}</span>
                <span className="mt-0.5 block text-[0.72rem] font-semibold text-violet-200">{theme.label}</span>
                <span className="mt-1 block text-[0.68rem] leading-snug text-mist-faint">{theme.description}</span>
              </span>
              <span className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition",
                isActive ? "border-emerald-400/40 bg-emerald-400/20" : "border-white/15 bg-white/5"
              )}>
                {saving === theme.id
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin text-mist-dim" />
                  : isActive ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Palette className="h-3.5 w-3.5 text-mist-faint" />}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
