import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import LoginForm from "@/components/forms/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Aegis Auth with your email or username and password.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;

  return (
    <AuthShell>
      <div className="glass mx-auto w-full max-w-md p-8 sm:p-10">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-violet-300">Welcome back</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">Sign in to your account</h1>
        <p className="mt-2 text-sm leading-relaxed text-mist-dim">
          Use your email <em>or</em> username — whichever you remember.
        </p>

        <LoginForm next={next} />

        <p className="mt-6 text-center text-sm text-mist-dim">
          New to Aegis?{" "}
          <Link href="/register" className="font-bold text-white underline-offset-4 transition hover:text-violet-300 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
