"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LogoutButton({ variant = "icon" }: { variant?: "icon" | "full" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) throw new Error("Logout failed");
      toast.success("Signed out. See you soon!");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Couldn't sign you out. Please try again.");
      setLoading(false);
    }
  }

  if (variant === "full") {
    return (
      <button onClick={handleLogout} disabled={loading} className="btn-glass w-full">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
        Sign out
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      aria-label="Sign out"
      title="Sign out"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-mist-dim transition hover:border-white/20 hover:bg-white/10 hover:text-white"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
    </button>
  );
}
