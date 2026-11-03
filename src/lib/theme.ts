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
