/**
 * Theme catalog — shared between server (validation, defaults) and client (UI).
 * Keep this file free of server-only imports.
 */

export const THEMES = [
  {
    id: "theme-1",
    name: "Theme 1",
    label: "Aurora Glass",
    description: "Deep-space glassmorphism with neon gradient glows.",
    swatch: "linear-gradient(135deg,#101736,#3b2d6e,#5b2b52)",
    tile: "linear-gradient(150deg,rgba(124,196,255,.35),rgba(167,139,250,.35),rgba(244,114,182,.35))",
  },
  {
    id: "theme-2",
    name: "Theme 2",
    label: "Neumorphism",
    description: "Soft, light surfaces with embossed dual shadows.",
    swatch: "linear-gradient(135deg,#eef1f7,#dfe5ee,#cdd5e0)",
    tile: "linear-gradient(150deg,#e9edf4,#e2e8ef)",
  },
  {
    id: "theme-3",
    name: "Theme 3",
    label: "Vivid Glass",
    description: "Festival-purple glass with vivid translucent panels.",
    swatch: "linear-gradient(150deg,#4c1d95,#7e22ce,#db2777)",
    tile: "linear-gradient(150deg,rgba(255,255,255,.3),rgba(255,255,255,.08))",
  },
  {
    id: "theme-4",
    name: "Theme 4",
    label: "Gradient Glass",
    description: "Featherlight glass on a vivid blue gradient canvas.",
    swatch: "linear-gradient(150deg,#e0f2fe 0%,#dbeafe 35%,#60a5fa 75%,#06b6d4 100%)",
    tile: "linear-gradient(150deg,#ffffff,#e2e8f0)",
  },
  {
    id: "theme-5",
    name: "Theme 5",
    label: "Liquid Glass",
    description: "macOS Control Center — dark frosted panels over a moody scene.",
    swatch: "linear-gradient(160deg,#0b3b39 0%,#0e2a35 45%,#081c26 100%)",
    tile: "linear-gradient(150deg,rgba(255,255,255,.22),rgba(255,255,255,.06))",
  },
  {
    id: "theme-6",
    name: "Theme 6",
    label: "Noir Editorial",
    description: "Midnight black, ivory ink and a whisper of gold — magazine luxury.",
    swatch: "linear-gradient(150deg,#0d0d0f 0%,#17171c 55%,#1f1c16 100%)",
    tile: "linear-gradient(150deg,rgba(212,175,55,.3),rgba(255,255,255,.04))",
  },
  {
    id: "theme-7",
    name: "Theme 7",
    label: "Sakura Blush",
    description: "Soft rose pastels, warm cream and dreamy light.",
    swatch: "linear-gradient(150deg,#fdf2f7 0%,#fce7f0 45%,#fbcfe8 100%)",
    tile: "linear-gradient(150deg,#ffffff,#fce7f0)",
  },
  {
    id: "theme-8",
    name: "Theme 8",
    label: "Neon Circuit",
    description: "Cyberpunk HUD — black space, cyan and magenta neon glow.",
    swatch: "linear-gradient(150deg,#05070f 0%,#0d1220 45%,#1b0b26 100%)",
    tile: "linear-gradient(150deg,rgba(34,211,238,.4),rgba(240,171,252,.18))",
  },
  {
    id: "theme-9",
    name: "Theme 9",
    label: "Sage & Cream",
    description: "Organic botanical minimal — warm cream with quiet sage.",
    swatch: "linear-gradient(150deg,#f4f1ea 0%,#eef0e6 45%,#e4e9d8 100%)",
    tile: "linear-gradient(150deg,#ffffff,#e9ede2)",
  },
  {
    id: "theme-10",
    name: "Theme 10",
    label: "Arctic Aurora",
    description: "Glacial white canvas lit by northern lights.",
    swatch: "linear-gradient(150deg,#eef4fb 0%,#e0ecfa 40%,#d3f5ec 100%)",
    tile: "linear-gradient(150deg,#ffffff,#e2ecf8)",
  },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME: ThemeId = "theme-1";
export const THEME_STORAGE_KEY = "aegis-theme";
export const THEME_IDS: readonly ThemeId[] = THEMES.map((t) => t.id);

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && (THEME_IDS as readonly string[]).includes(value);
}

/** Client-side: apply a theme instantly (CSS variables react to [data-theme]). */
export function applyTheme(theme: ThemeId) {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = theme;
  }
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* storage unavailable — theme still applies for this session */
  }
}

/** Client-side: push the given theme to the user's account (call only when authed). */
export async function syncThemeToAccount(theme: ThemeId) {
  try {
    await fetch("/api/user/theme", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme }),
    });
  } catch {
    /* non-fatal — local theme still applies */
  }
}
