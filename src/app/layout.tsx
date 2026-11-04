import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { cookies } from "next/headers";
import { Toaster } from "sonner";
import Background from "@/components/Background";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/lib/dal";
import { resolveAppearance, parseAppearanceCookie, APPEARANCE_COOKIE } from "@/lib/appearance";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Aegis Auth — Authentication that feels effortless",
    template: "%s · Aegis Auth",
  },
  description:
    "A complete authentication system built with Next.js: email OTP verification, login with email or username, sliding 7-day JWT sessions, forgot/reset password, and secure email & username changes — wrapped in a glassmorphic UI.",
  applicationName: "Aegis Auth",
  keywords: ["authentication", "nextjs", "jwt", "otp", "email verification", "mongodb", "bootcamp"],
  openGraph: {
    title: "Aegis Auth — Authentication that feels effortless",
    description: "Register with email OTP verification, sign in with email or username, and manage your account securely.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#060a1d",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, cookieStore] = await Promise.all([getCurrentUser(), cookies()]);
  const cookieAppearance = parseAppearanceCookie(cookieStore.get(APPEARANCE_COOKIE)?.value);

  const appearance = resolveAppearance(
    user
      ? { theme: user.theme, mode: user.mode, layout: user.layout, buttons: user.buttons, icons: user.icons }
      : undefined,
    cookieAppearance
  );

  return (
    <html
      lang="en"
      data-theme={appearance.theme}
      data-mode={appearance.mode}
      data-layout={appearance.layout}
      data-buttons={appearance.buttons}
      data-icons={appearance.icons}
      suppressHydrationWarning
    >
      <body className="min-h-screen">
        {/* Apply locally-fixed appearance before paint (guests only); auto/rotate defer to the server */}
        <Script id="aegis-appearance-init" strategy="beforeInteractive">
          {`try{var raw=localStorage.getItem('aegis-appearance');if(raw){var a=JSON.parse(raw);if(!a.mode||a.mode==='fixed'){['theme','mode','layout','buttons','icons'].forEach(function(k){if(a[k]){document.documentElement.dataset[k]=a[k];}});}}}catch(e){}`}
        </Script>
        <Background />
        <Navbar user={user} currentTheme={appearance.theme} />
        <main className="relative">{children}</main>
        <Footer />
        <Toaster
          theme="dark"
          position="top-center"
          offset={84} /* keep clear of the fixed glass navbar */
          toastOptions={{
            style: {
              background: "rgba(17, 24, 51, 0.92)",
              border: "1px solid rgba(255,255,255,0.12)",
              backdropFilter: "blur(12px)",
              color: "#e7eaf6",
            },
          }}
        />
      </body>
    </html>
  );
}
