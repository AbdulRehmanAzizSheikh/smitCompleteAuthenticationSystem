import "server-only";
import nodemailer from "nodemailer";

/**
 * Hostinger SMTP transport + branded HTML email templates.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in .env.local");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = SSL, 587 = STARTTLS
    auth: { user, pass },
  });
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  const transporter = getTransporter();
  const from = process.env.EMAIL_FROM ?? `"Aegis Auth" <${process.env.SMTP_USER}>`;

  await transporter.sendMail({
    from,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text ?? "Please view this email in an HTML-capable client.",
  });
}

/* ───────────────────────── Templates ───────────────────────── */

function baseLayout(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Aegis Auth</title>
</head>
<body style="margin:0;padding:0;background:#070b1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#070b1a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding:8px 0 28px;">
              <span style="display:inline-block;font-size:22px;font-weight:800;letter-spacing:-0.02em;color:#ffffff;">
                <span style="display:inline-block;width:34px;height:34px;line-height:34px;border-radius:10px;background:linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6);color:#0b1020;font-size:18px;vertical-align:-9px;margin-right:10px;">&#128737;</span>
                Aegis&nbsp;Auth
              </span>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background:linear-gradient(160deg,rgba(255,255,255,0.10),rgba(255,255,255,0.04));border:1px solid rgba(255,255,255,0.14);border-radius:24px;padding:36px 34px;box-shadow:0 24px 80px rgba(0,0,0,0.55);">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding:22px 12px 0;">
              <p style="margin:0;font-size:12px;color:#5b6478;">You received this email because an action was requested on your Aegis Auth account.<br/>If this wasn't you, you can safely ignore this message.</p>
              <p style="margin:10px 0 0;font-size:12px;color:#3f4759;">&copy; ${new Date().getFullYear()} Aegis Auth &middot; <a href="${APP_URL}" style="color:#8ea2ff;text-decoration:none;">${APP_URL.replace(/^https?:\/\//, "")}</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

const h1 = (text: string) =>
  `<h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;font-weight:800;letter-spacing:-0.02em;color:#f5f7ff;">${text}</h1>`;

const p = (text: string) =>
  `<p style="margin:0 0 18px;font-size:14px;line-height:1.7;color:#aab3cc;">${text}</p>`;

const otpBlock = (code: string) =>
  `<div style="text-align:center;margin:26px 0;">
     <div style="display:inline-block;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:16px;padding:16px 30px;">
       <span style="font-family:'SFMono-Regular',Consolas,'Liberation Mono',monospace;font-size:34px;font-weight:700;letter-spacing:12px;color:#ffffff;padding-left:12px;">${code}</span>
     </div>
     <p style="margin:12px 0 0;font-size:12px;color:#7c86a3;">Valid for <strong style="color:#c3cae3;">10 minutes</strong> &middot; single use</p>
   </div>`;

export function otpEmail(params: { code: string; purpose: "register" | "forgot-password" | "username-change" | "email-change-old" | "email-change-new"; meta?: Record<string, unknown> }) {
  const { code, purpose, meta } = params;

  const copy: Record<typeof purpose, { subject: string; title: string; body: string }> = {
    register: {
      subject: "Your verification code — Aegis Auth",
      title: "Verify your email",
      body: "Welcome! Use the code below to verify your email address and finish creating your account.",
    },
    "forgot-password": {
      subject: "Reset your password — Aegis Auth",
      title: "Password reset requested",
      body: "We received a request to reset your Aegis Auth password. Enter the code below to choose a new password.",
    },
    "username-change": {
      subject: "Confirm your username change — Aegis Auth",
      title: "Change your username",
      body: `Use the code below to confirm changing your username${meta?.newUsername ? ` to <strong style="color:#fff;">${String(meta.newUsername)}</strong>` : ""}.`,
    },
    "email-change-old": {
      subject: "Authorize your email change — Aegis Auth",
      title: "Is this you?",
      body: `Someone (hopefully you) asked to change the email on this account${meta?.newEmail ? ` to <strong style="color:#fff;">${String(meta.newEmail)}</strong>` : ""}. Enter the code below to authorize this change. If this wasn't you, ignore this email — your account stays untouched.`,
    },
    "email-change-new": {
      subject: "Verify your new email — Aegis Auth",
      title: "Confirm your new email",
      body: "Almost done! Enter the code below to verify this inbox and complete the email change.",
    },
  };

  const { subject, title, body } = copy[purpose];

  return {
    subject,
    html: baseLayout(`${h1(title)}${p(body)}${otpBlock(code)}${p("Didn't request this code? Your account is safe — just ignore this email and the code will expire automatically.")}`),
    text: `${title}\n\n${body.replace(/<[^>]+>/g, "")}\n\nYour code: ${code} (valid for 10 minutes)`,
  };
}

export function welcomeEmail(params: { username: string; email: string }) {
  const { username, email } = params;
  const html = baseLayout(`
    ${h1("Your account is ready 🎉")}
    ${p(`Hi <strong style="color:#fff;">${username}</strong>, your Aegis Auth account has been created successfully and you're now signed in.`)}
    <div style="text-align:center;margin:26px 0;">
      <a href="${APP_URL}/dashboard" style="display:inline-block;background:linear-gradient(135deg,#60a5fa,#a78bfa,#f472b6);color:#0b1020;font-size:14px;font-weight:800;text-decoration:none;padding:14px 32px;border-radius:999px;letter-spacing:0.01em;">Open your Dashboard</a>
    </div>
    ${p(`Signed up with <strong style="color:#fff;">${email}</strong>. You can now manage your display name, username, email and password anytime from Settings.`)}
  `);
  return {
    subject: "Welcome to Aegis Auth — your account is ready",
    html,
    text: `Hi ${username}, your Aegis Auth account has been created successfully. Open your dashboard: ${APP_URL}/dashboard`,
  };
}

export function passwordChangedEmail(params: { username: string }) {
  const html = baseLayout(`
    ${h1("Password updated")}
    ${p(`Hi <strong style="color:#fff;">${params.username}</strong>, your password was changed successfully.`)}
    ${p("If you didn't make this change, secure your account immediately by using <strong style='color:#fff;'>Forgot password</strong> on the login page.")}
  `);
  return {
    subject: "Your password was changed — Aegis Auth",
    html,
    text: `Hi ${params.username}, your password was changed. If this wasn't you, reset it at ${APP_URL}/forgot-password`,
  };
}

export function emailChangedEmail(params: { username: string; oldEmail: string; newEmail: string }) {
  const { username, oldEmail, newEmail } = params;
  const html = baseLayout(`
    ${h1("Email address updated")}
    ${p(`Hi <strong style="color:#fff;">${username}</strong>, the email on your account was changed from <strong style="color:#fff;">${oldEmail}</strong> to <strong style="color:#fff;">${newEmail}</strong>.`)}
    ${p("If you didn't authorize this change, sign in and contact support immediately, or use Forgot password to lock your account down.")}
  `);
  return {
    subject: "Your email was changed — Aegis Auth",
    html,
    text: `Hi ${username}, your account email changed from ${oldEmail} to ${newEmail}. If this wasn't you, secure your account now.`,
  };
}
