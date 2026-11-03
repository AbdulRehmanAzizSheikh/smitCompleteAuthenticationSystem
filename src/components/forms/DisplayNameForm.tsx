"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Check, UserRoundPen } from "lucide-react";
import { toast } from "sonner";

/** Display name — instant update, no verification required. */
export default function DisplayNameForm({ initialDisplayName }: { initialDisplayName: string }) {
  const [value, setValue] = useState(initialDisplayName);
  const [saved, setSaved] = useState(initialDisplayName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = value.trim() !== saved;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const displayName = value.trim();
    if (!displayName) {
      setError("Display name cannot be empty.");
      return;
    }
    if (displayName === saved) return;

    setLoading(true);
    try {
      const res = await fetch("/api/user/display-name", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message ?? "Couldn't update display name.");
        return;
      }
      setValue(data.displayName);
      setSaved(data.displayName);
      toast.success("Display name updated.");
    } catch {
      setError("Network error — try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <label htmlFor="display-name" className="label">Display name</label>
        <div className="relative">
          <UserRoundPen className="input-icon" aria-hidden="true" />
          <input
            id="display-name"
            type="text"
            value={value}
            maxLength={50}
            onChange={(e) => setValue(e.target.value)}
            placeholder="e.g. Abdul Rehman"
            className={`input ${error ? "input-error" : ""}`}
          />
        </div>
        {error && <p className="field-error">{error}</p>}
      </div>
      <button type="submit" disabled={loading || !dirty} className="btn-glass shrink-0 sm:mb-[1px]">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        Save
      </button>
    </form>
  );
}
