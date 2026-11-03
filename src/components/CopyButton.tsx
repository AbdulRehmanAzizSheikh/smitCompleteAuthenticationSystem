"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

export default function CopyButton({ text, label = "Copy to clipboard" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn't copy — your browser blocked it.");
    }
  }

  return (
    <button
      onClick={copy}
      aria-label={label}
      title={label}
      className="rounded-lg p-1.5 text-mist-faint transition hover:bg-white/5 hover:text-mist"
    >
      {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}
