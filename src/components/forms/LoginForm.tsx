"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import PasswordInput from "@/components/PasswordInput";

export default function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBanner(null);
    setFieldErrors({});

    if (!identifier.trim() || !password) {
      setFieldErrors({
        ...(!identifier.trim() ? { identifier: "Enter your email or username" } : {}),
        ...(!password ? { password: "Enter your password" } : {}),
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data?.fieldErrors) setFieldErrors(data.fieldErrors);
        setBanner(data?.message ?? "Couldn't sign you in. Please try again.");
        return;
      }

      toast.success(`Welcome back, ${data.user?.displayName ?? data.user?.username}!`);
      router.push(next && next.startsWith("/") ? next : "/dashboard");
      router.refresh();
    } catch {
      setBanner("Network error — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-7 space-y-5" noValidate>
      {banner && (
        <div role="alert" className="flex items-start gap-2.5 rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {banner}
        </div>
      )}

      {/* Identifier */}
      <div>
        <label htmlFor="identifier" className="label">Email or username</label>
        <div className="relative">
          <Mail className="input-icon" aria-hidden="true" />
          <input
            id="identifier"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="you@example.com  or  cool_user_27"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            className={`input ${fieldErrors.identifier ? "input-error" : ""}`}
          />
        </div>
        {fieldErrors.identifier && <p className="field-error">{fieldErrors.identifier}</p>}
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="password" className="label !mb-0">Password</label>
          <Link href="/forgot-password" className="text-xs font-bold text-violet-300 transition hover:text-violet-200">
            Forgot password?
          </Link>
        </div>
        <div className="mt-2">
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            error={fieldErrors.password}
            autoComplete="current-password"
          />
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full !py-3.5">
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <>Sign in <ArrowRight className="h-5 w-5" /></>}
      </button>
    </form>
  );
}
