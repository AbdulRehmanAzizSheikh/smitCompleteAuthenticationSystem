"use client";

import { useEffect } from "react";
import Link from "next/link";
import { LifeBuoy, RotateCcw, Home } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app-error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 pb-16 pt-6 text-center">
      <div className="glass flex h-20 w-20 items-center justify-center !rounded-3xl">
        <LifeBuoy className="h-10 w-10 text-pink-300" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white">Something snapped.</h1>
      <p className="mt-2 max-w-sm text-mist-dim">
        An unexpected error occurred. It has been logged — try again, or head back home.
      </p>
      <div className="mt-8 flex items-center gap-3">
        <button onClick={reset} className="btn-primary">
          <RotateCcw className="h-5 w-5" /> Try again
        </button>
        <Link href="/" className="btn-glass">
          <Home className="h-5 w-5" /> Home
        </Link>
      </div>
    </div>
  );
}
