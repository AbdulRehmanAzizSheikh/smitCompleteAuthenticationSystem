"use client";

import { useState } from "react";
import { Pin, PinOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { applyAppearance, syncAppearanceToAccount, type ThemeIdLike } from "@/lib/appearance";

/**
 * "Fix this theme" — pins whatever theme is currently on screen to the user's
 * account/device (mode: fixed). Click again to return to Auto (server random).
 */
export default function FixThemeButton({ pinned, isAuthed }: { pinned: boolean; isAuthed: boolean }) {
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    const html = document.documentElement;

    try {
      if (pinned) {
        // Back to Auto — theme will be server-picked on every load
        applyAppearance({ mode: "auto" });
        if (isAuthed) await syncAppearanceToAccount({ mode: "auto" });
        toast.success("Auto mode — theme picked by the server on every load.");
      } else {
        const theme = (html.dataset.theme ?? "theme-1") as ThemeIdLike;
        applyAppearance({ theme, mode: "fixed" });
        if (isAuthed) await syncAppearanceToAccount({ theme, mode: "fixed" });
        toast.success("Theme pinned! It will stay this way on every visit.");
      }
    } catch {
      toast.error("Couldn't update your theme. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={pinned}
      title={pinned ? "Unpin theme — back to Auto" : "Fix this theme"}
      aria-label={pinned ? "Unpin theme" : "Fix this theme"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-mist-dim transition hover:border-white/20 hover:bg-white/10 hover:text-white"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
    </button>
  );
}
