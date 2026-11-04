/**
 * Appearance system — 4 independent axes:
 *   theme    (colors & atmosphere)      theme-1..5
 *   layout   (auth page structure)      layout-1..3
 *   buttons  (button styling)           buttons-1..5
 *   icons    (icon tile styling)        icons-1..5
 *
 * Saved to localStorage + cookie for guests, and to the account for
 * signed-in users (synced from the client right after a change).
 */

export const LAYOUTS = [
  { id: "layout-1", name: "Layout 1", label: "Split Panel", description: "Brand showcase on the left, form on the right." },
  { id: "layout-2", name: "Layout 2", label: "Centered Card", description: "Centered card with a logo header above." },
  { id: "layout-3", name: "Layout 3", label: "Slim Rail", description: "Slim vertical brand rail beside the form." },
] as const;

export const BUTTON_STYLES = [
  { id: "buttons-1", name: "Buttons 1", label: "Gradient Pill", description: "Signature blue→violet→pink gradient pill." },
  { id: "buttons-2", name: "Buttons 2", label: "Neumorphism", description: "Solid violet squircle, soft dual shadows." },
  { id: "buttons-3", name: "Buttons 3", label: "Frosted Capsule", description: "Translucent indigo frosted glass capsule." },
  { id: "buttons-4", name: "Buttons 4", label: "Electric Squircle", description: "Solid blue gradient squircle button." },
  { id: "buttons-5", name: "Buttons 5", label: "Teal HUD", description: "Glowing teal HUD capsule." },
] as const;

export const ICON_STYLES = [
  { id: "icons-1", name: "Icons 1", label: "Soft Tile", description: "Frosted gradient tiles (current default)." },
  { id: "icons-2", name: "Icons 2", label: "Neumorph Squircle", description: "Light embossed tiles, violet icons." },
  { id: "icons-3", name: "Icons 3", label: "Neon Circle", description: "Circular tiles with cyan neon glow." },
  { id: "icons-4", name: "Icons 4", label: "Solid Pop", description: "Solid indigo gradient tiles, white glyphs." },
  { id: "icons-5", name: "Icons 5", label: "Pill Glass", description: "Frosted white pill tiles." },
] as const;

export type LayoutId = (typeof LAYOUTS)[number]["id"];
export type ButtonId = (typeof BUTTON_STYLES)[number]["id"];
export type IconId = (typeof ICON_STYLES)[number]["id"];
export type ThemeIdLike = "theme-1" | "theme-2" | "theme-3" | "theme-4" | "theme-5";
export type ThemeMode = "auto" | "rotate" | "fixed";

export interface Appearance {
  theme: ThemeIdLike;
  mode: ThemeMode;
  layout: LayoutId;
  buttons: ButtonId;
  icons: IconId;
}

export const MODE_OPTIONS = [
  { id: "auto", name: "Auto", label: "Auto · Random", description: "The server picks a random theme on every load." },
  { id: "rotate", name: "Rotate", label: "Auto · Rotation", description: "Themes rotate every second (server clock)." },
  { id: "fixed", name: "Fixed", label: "Fixed · Your pick", description: "Your saved theme, applied on every visit." },
] as const;

export const DEFAULT_APPEARANCE: Appearance = {
  theme: "theme-1",
  mode: "auto",
  layout: "layout-1",
  buttons: "buttons-1",
  icons: "icons-1",
};

export const APPEARANCE_STORAGE_KEY = "aegis-appearance";
export const APPEARANCE_COOKIE = "aegis-appearance";

export const LAYOUT_IDS = LAYOUTS.map((l) => l.id) as readonly LayoutId[];
export const BUTTON_IDS = BUTTON_STYLES.map((b) => b.id) as readonly ButtonId[];
export const ICON_IDS = ICON_STYLES.map((i) => i.id) as readonly IconId[];
export const THEME_ID_LIST = ["theme-1", "theme-2", "theme-3", "theme-4", "theme-5"] as const;

export function isThemeMode(v: unknown): v is ThemeMode {
  return v === "auto" || v === "rotate" || v === "fixed";
}
export function isLayoutId(v: unknown): v is LayoutId {
  return typeof v === "string" && (LAYOUT_IDS as readonly string[]).includes(v);
}
export function isButtonId(v: unknown): v is ButtonId {
  return typeof v === "string" && (BUTTON_IDS as readonly string[]).includes(v);
}
export function isIconId(v: unknown): v is IconId {
  return typeof v === "string" && (ICON_IDS as readonly string[]).includes(v);
}
export function isThemeIdValue(v: unknown): v is ThemeIdLike {
  return typeof v === "string" && (THEME_ID_LIST as readonly string[]).includes(v);
}

function normalize(part: Partial<Appearance>): Partial<Appearance> {
  const out: Partial<Appearance> = {};
  if (isThemeIdValue(part.theme)) out.theme = part.theme;
  if (isThemeMode(part.mode)) out.mode = part.mode;
  if (isLayoutId(part.layout)) out.layout = part.layout;
  if (isButtonId(part.buttons)) out.buttons = part.buttons;
  if (isIconId(part.icons)) out.icons = part.icons;
  return out;
}

export function parseAppearanceJSON(raw: string | null | undefined): Partial<Appearance> {
  if (!raw) return {};
  try {
    return normalize(JSON.parse(raw) as Partial<Appearance>);
  } catch {
    return {};
  }
}

export function serializeAppearance(p: Partial<Appearance>): string {
  const n = normalize(p);
  const fallback = ["theme-1", "auto", "layout-1", "buttons-1", "icons-1"] as const;
  return [n.theme, n.mode, n.layout, n.buttons, n.icons]
    .map((v, i) => v ?? fallback[i])
    .join("|");
}

/** Parse the aegis-appearance cookie: "theme-1|auto|layout-2|buttons-3|icons-4" */
export function parseAppearanceCookie(raw: string | undefined | null): Partial<Appearance> {
  if (!raw) return {};
  const [theme, mode, layout, buttons, icons] = raw.split("|");
  return normalize({
    theme: theme as ThemeIdLike,
    mode: mode as ThemeMode,
    layout: layout as LayoutId,
    buttons: buttons as ButtonId,
    icons: icons as IconId,
  });
}

/** Clock-based rotation (used when mode = "rotate"). One theme per second, round-robin. */
export function getGlobalThemeNow(nowMs: number = Date.now()): ThemeIdLike {
  const idx = Math.floor(nowMs / 1000) % THEME_ID_LIST.length;
  return THEME_ID_LIST[idx];
}

/** Server-side random theme (used when mode = "auto"). */
export function getRandomThemeNow(): ThemeIdLike {
  const idx = Math.floor(Math.random() * THEME_ID_LIST.length);
  return THEME_ID_LIST[idx];
}

/**
 * Resolve the appearance for this request.
 * mode (account ?? cookie ?? "auto") decides where the theme comes from:
 *   auto   → server-side random theme on every load
 *   rotate → server-clock round-robin (every second)
 *   fixed  → the user's saved selection
 */
export function resolveAppearance(
  account?: Partial<Appearance>,
  cookie?: Partial<Appearance>
): Appearance {
  const mode = account?.mode ?? cookie?.mode ?? DEFAULT_APPEARANCE.mode;
  let resolvedTheme: ThemeIdLike;
  if (mode === "fixed") {
    resolvedTheme = account?.theme ?? cookie?.theme ?? DEFAULT_APPEARANCE.theme;
  } else if (mode === "rotate") {
    resolvedTheme = getGlobalThemeNow();
  } else {
    resolvedTheme = getRandomThemeNow();
  }
  return {
    theme: resolvedTheme,
    mode,
    layout: account?.layout ?? cookie?.layout ?? DEFAULT_APPEARANCE.layout,
    buttons: account?.buttons ?? cookie?.buttons ?? DEFAULT_APPEARANCE.buttons,
    icons: account?.icons ?? cookie?.icons ?? DEFAULT_APPEARANCE.icons,
  };
}

/* ── client-side helpers ───────────────────────────────── */

export function getStoredAppearance(): Partial<Appearance> {
  if (typeof window === "undefined") return {};
  return parseAppearanceJSON(window.localStorage.getItem(APPEARANCE_STORAGE_KEY));
}

/** Apply appearance instantly: html[data-*] + localStorage + cookie mirror. */
export function applyAppearance(partial: Partial<Appearance>) {
  if (typeof window === "undefined") return;
  const current = parseAppearanceJSON(window.localStorage.getItem(APPEARANCE_STORAGE_KEY));
  const next = { ...current, ...normalize(partial) };

  // html[data-theme] and html[data-mode] are authoritative; layout/buttons/icons too
  for (const key of ["theme", "mode", "layout", "buttons", "icons"] as const) {
    if (next[key]) document.documentElement.dataset[key] = next[key] as string;
  }

  try {
    window.localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable */
  }
  try {
    document.cookie = `${APPEARANCE_COOKIE}=${serializeAppearance(next)};path=/;max-age=31536000;samesite=lax`;
  } catch {
    /* cookie blocked */
  }
}

/** Push appearance to the user's account (call only when authed). */
export async function syncAppearanceToAccount(partial: Partial<Appearance>) {
  try {
    await fetch("/api/user/appearance", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalize(partial)),
    });
  } catch {
    /* non-fatal — local choice still applies */
  }
}
