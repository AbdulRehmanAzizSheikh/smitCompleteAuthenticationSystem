# Aegis Auth — Complete Authentication System

A bootcamp-grade, production-hardened authentication system built with **Next.js 16 (App Router)**, **MongoDB Atlas**, and **JWT** — with a glassmorphic, iOS-inspired UI. Everything (UI, API, email) lives in one Next.js app; APIs are Route Handlers, emails go through Nodemailer over Hostinger SMTP.

🔗 **Repo:** https://github.com/AbdulRehmanAzizSheikh/smitCompleteAuthenticationSystem

---

## ✨ Features

| Area | What you get |
|---|---|
| **Register** | Username + email + password + confirm password, show/hide eye toggle, live strength meter |
| **Email verification** | 6-digit OTP sent via Nodemailer (Hostinger SMTP) **before** the account is created |
| **OTP storage** | Separate `otps` collection — email + bcrypt-hashed code, **10-minute TTL index** (auto-deleted) |
| **Account creation** | OTP re-verified at submit → account created → welcome email → **auto sign-in** |
| **Login** | Sign in with **email OR username** + password (timing-attack aware, generic errors) |
| **Sessions** | JWT (HS256, httpOnly, SameSite=Lax) with **sliding 7-day expiry** — refreshed on every visit, expires after a week away; logout anytime |
| **Forgot / reset password** | OTP-authorized reset flow, security notification email after change |
| **Change password** | Requires the **current password** (no OTP), confirmation email sent |
| **Change email** | **Two-step**: authorize code on the *current* inbox → verify code on the *new* inbox → both inboxes notified |
| **Username change** | Email OTP to current inbox required |
| **Display name** | Instant change, no verification needed |
| **Rate limiting** | Fixed-window per-IP and per-email limits on every sensitive endpoint + 5-attempt OTP lockout |
| **Security headers** | `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` |
| **UI** | Glassmorphism (aurora background, blur cards, gradient accents), responsive, mobile menu, OTP segmented input with paste/auto-advance |

## 🧱 Tech Stack

- **Next.js 16** · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui (Radix)
- **MongoDB Atlas** (`sitAuthenticationSystemBootcamp` database, Cluster0) · Mongoose 9
- **jose** (JWT) · **bcryptjs** (passwords + OTPs) · **nodemailer** (Hostinger SMTP)
- **zod** (validation) · **sonner** (toasts) · **lucide-react** (icons)

## 🚀 Getting Started

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local     # then fill in real values

# 3. Run the dev server
npm run dev                    # http://localhost:3000

# 4. Production build
npm run build && npm start
```

### Environment Variables

| Key | Purpose |
|---|---|
| `MONGODB_URI` | Atlas connection string **including the database name** (`/sitAuthenticationSystemBootcamp`) |
| `JWT_SECRET` | HS256 signing secret (`openssl rand -base64 48`) |
| `SESSION_TTL_DAYS` | Sliding session lifetime (default `7`) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Hostinger SMTP (`smtp.hostinger.com:465`, mailbox password / app password) |
| `EMAIL_FROM` | Sender identity, e.g. `Aegis Auth <mail@abdulrehman.sbs>` |
| `NEXT_PUBLIC_APP_URL` | Public base URL (used in email templates) |

> `.env.local` stays on your machine (git-ignored). For **Vercel**, paste the same keys into
> Project → Settings → Environment Variables. A ready-to-import `.env` for that purpose exists locally (also git-ignored).

## 🔐 Authentication Flows

### Registration (OTP-gated)
```
Fill form ──► click "Verify email"
      │
      ▼
POST /api/auth/register/send-otp   ──►  DB check: email taken? → 409
      │                                    else: bcrypt-hash 6-digit code,
      │                                    store in `otps` (TTL 10 min), email it
      ▼
User enters OTP, submits ──► POST /api/auth/register
      ▼
OTP verified (5-attempt lock) ──► uniqueness re-check ──► bcrypt hash (cost 12)
      ▼
Account created ──► OTP consumed ──► welcome email ──► session cookie set ──► /dashboard
```
> If the account is never created, the `otps` document deletes itself after 10 minutes.

### Sliding Session (1 week inactivity ⇒ logout)
`src/proxy.ts` (Next.js 16 Proxy) re-signs the JWT on **every page visit** and refreshes the
cookie. No visit for 7 days → token expires naturally. `/dashboard` & `/settings` redirect to
`/login` without a valid session; route handlers re-verify via the DAL (`src/lib/dal.ts`).

### Email change (double verification)
```
Enter new email ─► code to CURRENT inbox  ("was this you?")
      ─► verify ─► code to NEW inbox       ("prove you own it")
      ─► verify ─► email updated, old+new inboxes notified
```

## 📡 API Reference (Route Handlers)

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register/send-otp` | public (rate-limited) | Email OTP for registration |
| POST | `/api/auth/register` | public | Verify OTP → create account → auto sign-in |
| POST | `/api/auth/login` | public | Login with email **or** username |
| POST | `/api/auth/logout` | session | Destroy session |
| GET | `/api/auth/me` | session | Current user DTO |
| POST | `/api/auth/forgot-password/send-otp` | public (enum-safe) | Send reset code (generic response) |
| POST | `/api/auth/forgot-password/reset` | public | Verify OTP → set new password |
| POST | `/api/user/change-password` | required | Current password → new password |
| PATCH | `/api/user/display-name` | required | Instant display-name update |
| POST | `/api/user/username/send-otp` | required | OTP (current inbox) to change username |
| POST | `/api/user/username/verify` | required | Verify → apply username |
| POST | `/api/user/email-change/start` | required | Step 1 — code to CURRENT inbox |
| POST | `/api/user/email-change/verify-old` | required | Step 2 — verify, code to NEW inbox |
| POST | `/api/user/email-change/verify-new` | required | Step 3 — verify → email updated |

All responses share an envelope: `{ success: boolean, message?: string, ... }`.
Validation errors return `422` with `{ fieldErrors: { field: message } }`.

## 🗄️ Data Model

**`users`** — `username` (unique, lowercase, 3–20 `[a-z0-9_]`), `displayName`, `email` (unique),
`password` (bcrypt, `select: false`), timestamps.

**`otps`** — `email`, `purpose` (`register` | `forgot-password` | `username-change` | `email-change-old` | `email-change-new`),
`otpHash` (bcrypt), `meta` (e.g. `{ newEmail, newUsername }`), `attempts` (max 5),
`expiresAt` (**TTL index, 10 min, auto-delete**), optional `userId` for logged-in flows.

## 📁 Project Structure

```
src/
├─ app/
│  ├─ page.tsx                  # Landing (hero, features, flow, security, CTA)
│  ├─ login|register|forgot-password/
│  ├─ dashboard/                # Protected overview (force-dynamic)
│  ├─ settings/                 # Display name / username / email / password
│  ├─ not-found.tsx · error.tsx
│  └─ api/                      # Route Handlers (see table above)
├─ components/                  # Navbar, Footer, AuthShell, OtpInput, PasswordInput…
│  └─ forms/                    # Client forms for every flow
├─ lib/
│  ├─ db.ts · models/           # Cached Mongoose connection, User & Otp models
│  ├─ session.ts · jwt.ts · dal.ts   # Cookie session, jose HS256, data-access layer
│  ├─ otp.ts · email.ts · rateLimit.ts · validation.ts · api.ts
├─ proxy.ts                     # Next 16 Proxy — sliding session + route protection
```

## ☁️ Deploying to Vercel

1. Import the GitHub repo in Vercel (framework auto-detected: Next.js).
2. Add the environment variables from `.env` (Project → Settings → Environment Variables).
3. Deploy — `main` pushes auto-deploy.
4. Update `NEXT_PUBLIC_APP_URL` to the final URL and redeploy (email links).

## 🛡️ Security Notes

- Passwords & OTPs are **bcrypt**-hashed; OTPs never stored/logged in plain text.
- Sessions are **httpOnly** cookies — invisible to JS (XSS-safe), `Secure` in production, `SameSite=Lax`.
- OTP endpoint lockout (5 attempts) + per-IP/per-email rate limiting.
- Registration flow re-checks uniqueness at submit (closes the send-otp → submit race).
- Login uses a constant-work bcrypt compare against a dummy hash when the user doesn't exist (no user-enumeration via timing), with a generic error message.
- Forgot-password responses are identical whether or not the email exists.
- After a password change, a security notification email is sent to the account address.
