"use client";

import { useState } from "react";
import {
  Palette,
  LayoutTemplate,
  MousePointerClick,
  Shapes,
  Check,
  Shuffle,
  Clock3,
  Pin,
  Loader2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  LAYOUTS,
  BUTTON_STYLES,
  ICON_STYLES,
  MODE_OPTIONS,
  applyAppearance,
  syncAppearanceToAccount,
  type Appearance,
  type ThemeIdLike,
} from "@/lib/appearance";
import { THEMES } from "@/lib/theme";
import { cn } from "@/lib/utils";

type AppearanceKey = keyof Appearance;

const MODE_ICONS = { auto: Shuffle, rotate: Clock3, fixed: Pin } as const;

/**
 * Full appearance control — 4 independent axes + theme mode.
 * Every option applies instantly (html[data-*]) and syncs to the account.
 */
export default function AppearanceSection({ initial }: { initial: Appearance }) {
  const [appearance, setAppearance] = useState<Appearance>(initial);
  const [saving, setSaving] = useState(false);

  async function update(key: AppearanceKey, value: string) {
    const next = { ...appearance, [key]: value } as Appearance;
    // Choosing any explicit theme option implies fixed mode (unless picking mode itself)
    if (key === "theme") next.mode = "fixed";
    setAppearance(next);
    applyAppearance(next);

    setSaving(true);
    try {
      await syncAppearanceToAccount(next);
      toast.success("Appearance saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-7">
      {/* ── Theme mode ─────────────────────────────────────── */}
      <div>
        <div className="mb-2.5 flex items-center gap-3">
          <Shuffle className="h-4 w-4 text-mist-faint" />
          <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-mist-faint">Theme Mode</p>
          {saving && <Loader2 className="h-3.5 w-3.5 animate-spin text-mist-faint" />}
        </div>
        <div role="radiogroup" aria-label="Theme mode" className="grid gap-2 sm:grid-cols-3">
          {MODE_OPTIONS.map((mode) => {
            const Icon = MODE_ICONS[mode.id];
            const active = appearance.mode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => update("mode", mode.id)}
                className={cn(
                  "rounded-2xl border p-3.5 text-left transition",
                  active
                    ? "border-violet-400/50 bg-violet-400/10 shadow-[0_0_0_3px_rgba(167,139,250,0.18)]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon className={cn("h-4 w-4", active ? "text-violet-200" : "text-mist-faint")} />
                  <span className="text-xs font-extrabold text-white">{mode.label}</span>
                </span>
                <span className="mt-1.5 block text-[0.68rem] leading-snug text-mist-faint">{mode.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Theme ──────────────────────────────────────────── */}
      <Group label="Theme" icon={Palette}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {THEMES.map((theme) => {
            const active = appearance.theme === theme.id;
            return (
              <button
                key={theme.id}
                type="button"
                onClick={() => update("theme", theme.id as ThemeIdLike)}
                aria-pressed={active}
                className={cn(
                  "rounded-2xl border p-1.5 text-left transition",
                  active
                    ? "border-violet-400/50 bg-violet-400/10 shadow-[0_0_0_3px_rgba(167,139,250,0.18)]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                )}
              >
                <span className="block h-12 w-full rounded-xl border border-white/10" style={{ background: theme.swatch }} aria-hidden="true" />
                <span className="mt-1.5 block px-0.5 text-[0.68rem] font-extrabold leading-tight text-white">{theme.name}</span>
                <span className="block px-0.5 pb-1 text-[0.55rem] font-bold uppercase tracking-[0.16em] text-mist-faint">{theme.label}</span>
              </button>
            );
          })}
        </div>
      </Group>

      {/* ── Layout ─────────────────────────────────────────── */}
      <Group label="Layout" icon={LayoutTemplate}>
        <div className="grid gap-2 sm:grid-cols-3">
          {LAYOUTS.map((layout) => {
            const active = appearance.layout === layout.id;
            return (
              <button
                key={layout.id}
                type="button"
                onClick={() => update("layout", layout.id)}
                aria-pressed={active}
                className={cn(
                  "rounded-2xl border p-2 text-left transition",
                  active
                    ? "border-sky-400/50 bg-sky-400/10 shadow-[0_0_0_3px_rgba(125,211,252,0.18)]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                )}
              >
                {/* Wireframe preview */}
                <span className="block h-16 w-full rounded-xl border border-white/10 bg-white/[0.04] p-1.5" aria-hidden="true">
                  {layout.id === "layout-1" && (
                    <span className="flex h-full gap-1">
                      <span className="h-full w-1/2 rounded-md bg-slate-500/30" />
                      <span className="flex h-full w-1/2 flex-col justify-center gap-1 rounded-md bg-slate-500/20 p-1.5">
                        <span className="h-1.5 w-4/5 rounded bg-slate-400/40" />
                        <span className="h-1.5 w-3/5 rounded bg-slate-400/30" />
                        <span className="mt-1 h-2 w-full rounded bg-slate-400/50" />
                      </span>
                    </span>
                  )}
                  {layout.id === "layout-2" && (
                    <span className="flex h-full flex-col items-center justify-center gap-1 rounded-md bg-slate-500/20 p-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-400/50" />
                      <span className="h-1.5 w-1/2 rounded bg-slate-400/40" />
                      <span className="h-1.5 w-2/3 rounded bg-slate-400/30" />
                      <span className="mt-1 h-2 w-3/4 rounded bg-slate-400/50" />
                    </span>
                  )}
                  {layout.id === "layout-3" && (
                    <span className="flex h-full gap-1">
                      <span className="h-full w-4 rounded-md bg-slate-500/35" />
                      <span className="flex h-full flex-1 flex-col justify-center gap-1 rounded-md bg-slate-500/20 p-1.5">
                        <span className="h-1.5 w-3/4 rounded bg-slate-400/40" />
                        <span className="h-1.5 w-1/2 rounded bg-slate-400/30" />
                        <span className="mt-1 h-2 w-full rounded bg-slate-400/50" />
                      </span>
                    </span>
                  )}
                </span>
                <span className="mt-1.5 block text-[0.7rem] font-extrabold text-white">{layout.name}</span>
                <span className="block text-[0.56rem] font-bold uppercase tracking-[0.16em] text-sky-300/80">{layout.label}</span>
              </button>
            );
          })}
        </div>
      </Group>

      {/* ── Buttons ─────────────────────────────────────────── */}
      <Group label="Buttons" icon={MousePointerClick}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {BUTTON_STYLES.map((style) => {
            const active = appearance.buttons === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => update("buttons", style.id)}
                aria-pressed={active}
                className={cn(
                  "rounded-2xl border p-2 text-left transition",
                  active
                    ? "border-pink-400/50 bg-pink-400/10 shadow-[0_0_0_3px_rgba(249,168,212,0.18)]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                )}
              >
                {/* Live preview — nested data-buttons gives real button CSS */}
                <span className="pointer-events-none flex h-14 w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.05]" data-buttons={style.id} aria-hidden="true">
                  <span className="btn-primary pointer-events-none !px-3 !py-1.5 !text-[0.62rem] !font-bold">Button</span>
                </span>
                <span className="mt-1.5 block text-[0.65rem] font-extrabold leading-tight text-white">{style.name}</span>
                <span className="block text-[0.53rem] font-bold uppercase tracking-[0.16em] text-pink-300/80">{style.label}</span>
              </button>
            );
          })}
        </div>
      </Group>

      {/* ── Icons ───────────────────────────────────────────── */}
      <Group label="Icons" icon={Shapes}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {ICON_STYLES.map((style) => {
            const active = appearance.icons === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => update("icons", style.id)}
                aria-pressed={active}
                className={cn(
                  "rounded-2xl border p-2 text-left transition",
                  active
                    ? "border-emerald-400/50 bg-emerald-400/10 shadow-[0_0_0_3px_rgba(110,231,183,0.18)]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20"
                )}
              >
                <span className="pointer-events-none flex h-14 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05]" data-icons={style.id} aria-hidden="true">
                  <span className="icon-tile pointer-events-none !h-7 !w-7"><Mail className="h-4 w-4" /></span>
                  <span className="icon-tile pointer-events-none !h-7 !w-7"><ShieldCheck className="h-4 w-4" /></span>
                </span>
                <span className="mt-1.5 block text-[0.65rem] font-extrabold leading-tight text-white">{style.name}</span>
                <span className="block text-[0.53rem] font-bold uppercase tracking-[0.16em] text-emerald-300/80">{style.label}</span>
              </button>
            );
          })}
        </div>
      </Group>
    </div>
  );
}

function Group({ label, icon: Icon, children }: { label: string; icon: typeof Palette; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2.5 flex items-center gap-3">
        <Icon className="h-4 w-4 text-mist-faint" />
        <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-mist-faint">{label}</p>
      </div>
      {children}
    </div>
  );
}
