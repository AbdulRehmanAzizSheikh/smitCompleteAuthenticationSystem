import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import Background from "@/components/Background";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getCurrentUser } from "@/lib/dal";
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
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body className="min-h-screen">
        <Background />
        <Navbar user={user} />
        <main className="relative">{children}</main>
        <Footer />
        <Toaster
          theme="dark"
          position="top-center"
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
