import Link from "next/link";
import { Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 pb-16 pt-32 text-center">
      <div className="glass flex h-20 w-20 items-center justify-center !rounded-3xl">
        <Compass className="h-10 w-10 text-violet-300" />
      </div>
      <p className="mt-6 font-mono text-sm uppercase tracking-[0.3em] text-mist-faint">404</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
        This path isn't<br />on <span className="gradient-text">the map.</span>
      </h1>
      <p className="mt-3 max-w-sm text-mist-dim">
        The page you're looking for doesn't exist — it may have moved, or the link is just wrong.
      </p>
      <Link href="/" className="btn-primary mt-8">
        <Home className="h-5 w-5" /> Take me home
      </Link>
    </div>
  );
}
