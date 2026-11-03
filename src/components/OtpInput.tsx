"use client";

import { useEffect, useRef, useState, KeyboardEvent, ClipboardEvent, ChangeEvent } from "react";
import { cn } from "@/lib/utils";

/**
 * Six-digit OTP input: auto-advance, backspace to previous, arrow navigation,
 * and full-code paste distribution.
 */
export default function OtpInput({
  value,
  onChange,
  onComplete,
  autoFocus = false,
  disabled = false,
  hasError = false,
  length = 6,
  ariaLabel = "One-time passcode",
}: {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  hasError?: boolean;
  length?: number;
  ariaLabel?: string;
}) {
  const inputs = useRef<Array<HTMLInputElement | null>>([]);
  const [shake, setShake] = useState(false);
  const chars = Array.from({ length }, (_, i) => value[i] ?? "");

  // Trigger the shake animation when the parent flags an error
  useEffect(() => {
    if (!hasError) return;
    setShake(true);
    const t = setTimeout(() => setShake(false), 500);
    return () => clearTimeout(t);
  }, [hasError]);

  function commit(next: string) {
    const cleaned = next.replace(/\D/g, "").slice(0, length);
    onChange(cleaned);
    if (cleaned.length === length) onComplete?.(cleaned);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>, index: number) {
    const digits = e.target.value.replace(/\D/g, "");
    if (!digits) {
      const next = value.slice(0, index) + value.slice(index + 1);
      onChange(next);
      return;
    }
    // Typing or replacing a single box — take the last digit typed
    const digit = digits[digits.length - 1];
    const arr = chars.slice();
    arr[index] = digit;
    const next = arr.join("");
    commit(next);
    if (index < length - 1) inputs.current[index + 1]?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (chars[index]) {
        const arr = chars.slice();
        arr[index] = "";
        onChange(arr.join(""));
      } else if (index > 0) {
        inputs.current[index - 1]?.focus();
        const arr = chars.slice();
        arr[index - 1] = "";
        onChange(arr.join(""));
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    if (pasted.length === length) {
      onComplete?.(pasted);
      inputs.current[length - 1]?.focus();
    } else {
      inputs.current[pasted.length]?.focus();
    }
  }

  return (
    <div className={cn("grid grid-cols-6 gap-2 sm:gap-3", shake && "animate-shake")} role="group" aria-label={ariaLabel}>
      {chars.map((char, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          autoFocus={autoFocus && i === 0}
          value={char}
          aria-label={`Digit ${i + 1} of ${length}`}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="otp-box disabled:cursor-not-allowed disabled:opacity-40"
        />
      ))}
    </div>
  );
}
