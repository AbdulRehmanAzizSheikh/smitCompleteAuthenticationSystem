import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import RegisterForm from "@/components/forms/RegisterForm";

export const metadata: Metadata = {
  title: "Create account",
  description: "Register with username, email and password — verify your email with a 6-digit code and you're in.",
};

export default function RegisterPage() {
  return (
    <AuthShell>
      <div className="glass mx-auto w-full max-w-md p-8 sm:p-10">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-violet-300">Get started</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">Create your account</h1>
        <p className="mt-2 text-sm leading-relaxed text-mist-dim">
          We'll email you a 6-digit code — verify it, and your account is created instantly.
        </p>

        <RegisterForm />

        <p className="mt-6 text-center text-sm text-mist-dim">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-white underline-offset-4 transition hover:text-violet-300 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
