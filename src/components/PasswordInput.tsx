"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/** Password field with show/hide eye toggle and an optional live strength meter. */
export default function PasswordInput({
  id,
  value,
  onChange,
  error,
  showStrength = false,
  autoComplete = "new-password",
  placeholder = "••••••••",
  className,
  ...rest
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  showStrength?: boolean;
  placeholder?: string;
  className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="relative">
        <Lock className="input-icon" aria-hidden="true" />
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={cn("input pr-12", error && "input-error", className)}
          {...rest}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-mist-faint transition hover:bg-white/5 hover:text-mist"
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      {showStrength && value.length > 0 && <StrengthMeter password={value} />}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function StrengthMeter({ password }: { password: string }) {
  const score = scorePassword(password);
  const labels = ["Too weak", "Weak", "Fair", "Strong", "Excellent"];
  const colors = ["#f87171", "#fb923c", "#facc15", "#34d399", "#2dd4bf"];

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors duration-300"
            style={{ background: i < score ? colors[score - 1] : "rgba(255,255,255,0.08)" }}
          />
        ))}
      </div>
      <p className="mt-1.5 text-[0.72rem] font-medium" style={{ color: colors[score - 1] ?? "#6b7492" }}>
        {labels[score - 1] ?? "Too weak"}
      </p>
    </div>
  );
}

function scorePassword(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^a-zA-Z0-9]/.test(pw)) score++;
  else if (/\d/.test(pw) || /[^a-zA-Z0-9]/.test(pw)) score += 0.5;
  return Math.max(1, Math.min(4, Math.round(score)));
}
