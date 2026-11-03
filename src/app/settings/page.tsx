import type { Metadata } from "next";
import { AtSign, KeyRound, Mail, UserRoundPen, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/dal";
import { maskEmail } from "@/lib/utils";
import SettingsSection from "@/components/SettingsSection";
import DisplayNameForm from "@/components/forms/DisplayNameForm";
import UsernameChangeForm from "@/components/forms/UsernameChangeForm";
import EmailChangeForm from "@/components/forms/EmailChangeForm";
import PasswordChangeForm from "@/components/forms/PasswordChangeForm";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your display name, username, email and password â€” every change is verified and secure.",
};

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireUser();
  const masked = maskEmail(user.email);

  return (
    <div className="mx-auto max-w-[1680px] px-4 pb-20 sm:px-6 lg:px-8 pt-6 sm:pt-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-violet-300">Settings</p>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-tight text-white">Account & security</h1>
          <p className="mt-1.5 max-w-lg text-sm leading-relaxed text-mist-dim">
            Display names update instantly. Everything else is guarded by a 10-minute, single-use email code â€”
            or your current password for the crown-jewel stuff.
          </p>
        </div>
        <span className="glass-pill hidden items-center gap-2 px-3 py-2 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-emerald-300 sm:inline-flex">
          <ShieldCheck className="h-4 w-4" /> Protected
        </span>
      </div>

      <div className="mt-8 space-y-5">
        <SettingsSection
          id="display-name"
          icon={UserRoundPen}
          tint="text-sky-300"
          title="Display name"
          subtitle="How your name appears across the app. Changes apply instantly and need no verification."
        >
          <DisplayNameForm initialDisplayName={user.displayName} />
        </SettingsSection>

        <SettingsSection
          id="username"
          icon={AtSign}
          tint="text-violet-300"
          title="Username"
          subtitle="Usernames are unique and permanent-ish â€” changing one requires a code sent to your current inbox."
        >
          <UsernameChangeForm currentUsername={user.username} maskedEmail={masked} />
        </SettingsSection>

        <SettingsSection
          id="email"
          icon={Mail}
          tint="text-pink-300"
          title="Email address"
          subtitle="Two-step verification: authorize the change from your current inbox, then prove the new one. Both get notified."
        >
          <EmailChangeForm currentEmail={user.email} maskedCurrentEmail={masked} />
        </SettingsSection>

        <SettingsSection
          id="password"
          icon={KeyRound}
          tint="text-emerald-300"
          title="Password"
          subtitle="Changing your password requires the current one. We'll email you a confirmation afterwards."
        >
          <PasswordChangeForm />
        </SettingsSection>
      </div>
    </div>
  );
}
