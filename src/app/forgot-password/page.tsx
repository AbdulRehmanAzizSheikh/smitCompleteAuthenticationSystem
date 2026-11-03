import type { Metadata } from "next";
import Link from "next/link";
import AuthShell from "@/components/AuthShell";
import ForgotPasswordForm from "@/components/forms/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Forgot your password? We'll email you a 6-digit code — valid for 10 minutes — to reset it securely.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell>
      <div className="glass mx-auto w-full max-w-md p-8 sm:p-10">
        <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-violet-300">Account recovery</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">Reset your password</h1>
        <p className="mt-2 text-sm leading-relaxed text-mist-dim">
          Enter your email and we'll send a code to reset your password. Codes expire after 10 minutes.
        </p>

        <ForgotPasswordForm />

        <p className="mt-6 text-center text-sm text-mist-dim">
          Remembered it after all?{" "}
          <Link href="/login" className="font-bold text-white underline-offset-4 transition hover:text-violet-300 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
