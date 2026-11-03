import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="footer-bar">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2">
              <Logo size={26} />
              <span className="text-base font-extrabold tracking-tight text-white">Aegis Auth</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-mist-faint">
              A complete, bootcamp-grade authentication system â€” email OTP verification, JWT sessions, and a glass-smooth experience.
            </p>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-10 text-sm sm:grid-cols-3">
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-mist-faint">Product</p>
              <ul className="mt-3 space-y-2">
                <li><Link href="/#features" className="text-mist-dim transition hover:text-white">Features</Link></li>
                <li><Link href="/#how-it-works" className="text-mist-dim transition hover:text-white">How it works</Link></li>
                <li><Link href="/#security" className="text-mist-dim transition hover:text-white">Security</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-mist-faint">Account</p>
              <ul className="mt-3 space-y-2">
                <li><Link href="/login" className="text-mist-dim transition hover:text-white">Sign in</Link></li>
                <li><Link href="/register" className="text-mist-dim transition hover:text-white">Create account</Link></li>
                <li><Link href="/forgot-password" className="text-mist-dim transition hover:text-white">Reset password</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-mist-faint">Stack</p>
              <ul className="mt-3 space-y-2 text-mist-dim">
                <li>Next.js 16 Â· React 19</li>
                <li>MongoDB Â· Mongoose</li>
                <li>JWT Â· bcrypt Â· Nodemailer</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-white/5 pt-6 text-xs text-mist-faint sm:flex-row sm:items-center">
          <p>Â© {new Date().getFullYear()} Aegis Auth Â· Built for the SIT Bootcamp.</p>
          <p className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse-dot" />
            All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
}
