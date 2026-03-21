/**
 * Email integration boundary for ShipForge.
 *
 * Required environment variables (at least one provider must be configured):
 *
 * ── Provider 1: Resend (recommended) ──────────────────────────────────────
 *   RESEND_API_KEY=re_...          Resend API key from resend.com
 *   EMAIL_FROM=ShipForge <noreply@shipforge.dev>
 *
 * ── Provider 2: Generic SMTP (self-hosted / Mailgun SMTP / SES SMTP) ─────
 *   EMAIL_SERVER_HOST=smtp.mailgun.org
 *   EMAIL_SERVER_PORT=587
 *   EMAIL_SERVER_USER=postmaster@mg.shipforge.dev
 *   EMAIL_SERVER_PASSWORD=...
 *   EMAIL_FROM=ShipForge <noreply@shipforge.dev>
 *
 * If neither provider is configured this module throws a descriptive error
 * so the problem is caught immediately rather than silently dropped.
 */

export interface EmailPayload {
  to: string;
  subject: string;
  /** Plain-text fallback */
  text: string;
  /** HTML body */
  html: string;
}

// ─── Resend ───────────────────────────────────────────────────────────────────

async function sendViaResend(payload: EmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set');
  }

  const { Resend } = await import('resend');
  const client = new Resend(apiKey);

  const from = process.env.EMAIL_FROM || 'ShipForge <noreply@shipforge.dev>';

  const { error } = await client.emails.send({
    from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });

  if (error) {
    throw new Error(`Resend delivery failed: ${error.message}`);
  }
}

// ─── SMTP (nodemailer) ────────────────────────────────────────────────────────

async function sendViaSMTP(payload: EmailPayload): Promise<void> {
  // Dynamic import keeps the build lean when nodemailer is not the active provider.
  let nodemailer: typeof import('nodemailer');
  try {
    nodemailer = await import('nodemailer');
  } catch {
    throw new Error(
      'nodemailer is not installed. Run `npm install nodemailer` or configure RESEND_API_KEY instead.'
    );
  }

  const host = process.env.EMAIL_SERVER_HOST;
  if (!host) {
    throw new Error('EMAIL_SERVER_HOST is not set');
  }

  const portRaw = process.env.EMAIL_SERVER_PORT || '587';
  const port = parseInt(portRaw, 10);
  if (Number.isNaN(port) || port < 1 || port > 65535) {
    throw new Error(
      `EMAIL_SERVER_PORT "${portRaw}" is not a valid port number (1–65535)`
    );
  }
  const user = process.env.EMAIL_SERVER_USER;
  const pass = process.env.EMAIL_SERVER_PASSWORD;
  const from = process.env.EMAIL_FROM || 'ShipForge <noreply@shipforge.dev>';

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });

  await transporter.sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Send an email using whichever provider is configured in the environment.
 * Throws if no provider is configured so misconfiguration is caught early.
 */
export async function sendEmail(payload: EmailPayload): Promise<void> {
  if (process.env.RESEND_API_KEY) {
    return sendViaResend(payload);
  }

  if (process.env.EMAIL_SERVER_HOST) {
    return sendViaSMTP(payload);
  }

  throw new Error(
    'No email provider configured.\n' +
      'Set RESEND_API_KEY (recommended) or EMAIL_SERVER_HOST / EMAIL_SERVER_PORT / ' +
      'EMAIL_SERVER_USER / EMAIL_SERVER_PASSWORD / EMAIL_FROM in your .env.local file.\n' +
      'See .env.example for details.'
  );
}

/**
 * Extract the bare email address from an RFC 5322-style "Name <email>" string.
 * Returns the raw value unchanged if it doesn't match that format.
 *
 * @example
 * extractEmailAddress('ShipForge <noreply@shipforge.dev>') // 'noreply@shipforge.dev'
 * extractEmailAddress('hello@shipforge.dev')               // 'hello@shipforge.dev'
 */
export function extractEmailAddress(formatted: string): string {
  const match = formatted.match(/<([^>]+)>/);
  return match?.[1] ?? formatted;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const APP_NAME = 'ShipForge';

export function passwordResetEmail(resetUrl: string): Pick<EmailPayload, 'subject' | 'text' | 'html'> {
  return {
    subject: `${APP_NAME} – Reset your password`,
    text: `You requested a password reset for your ${APP_NAME} account.\n\nClick the link below to choose a new password (expires in 1 hour):\n\n${resetUrl}\n\nIf you did not request this, you can safely ignore this email.`,
    html: `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#0a0a1a;color:#e2e8f0;margin:0;padding:40px 20px">
  <div style="max-width:520px;margin:0 auto;background:#111827;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:40px">
    <div style="font-size:24px;font-weight:700;margin-bottom:8px">⚡ ${APP_NAME}</div>
    <h2 style="color:#fff;margin:0 0 16px">Reset your password</h2>
    <p style="color:#94a3b8;line-height:1.6">
      You requested a password reset for your ${APP_NAME} account. Click the button below to choose a new password. This link expires in <strong style="color:#e2e8f0">1 hour</strong>.
    </p>
    <a href="${resetUrl}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:linear-gradient(135deg,#06b6d4,#7c3aed);color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
      Reset Password
    </a>
    <p style="color:#64748b;font-size:13px;margin-top:16px">
      If you did not request this, you can safely ignore this email.<br>
      If the button doesn't work, copy this link: <span style="color:#7dd3fc">${resetUrl}</span>
    </p>
  </div>
</body>
</html>`,
  };
}

export function contactConfirmationEmail(
  name: string,
  message: string
): Pick<EmailPayload, 'subject' | 'text' | 'html'> {
  return {
    subject: `${APP_NAME} – We received your message`,
    text: `Hi ${name},\n\nThanks for reaching out to ${APP_NAME}. We've received your message and will get back to you shortly.\n\nYour message:\n"${message}"\n\n— The ${APP_NAME} team`,
    html: `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#0a0a1a;color:#e2e8f0;margin:0;padding:40px 20px">
  <div style="max-width:520px;margin:0 auto;background:#111827;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:40px">
    <div style="font-size:24px;font-weight:700;margin-bottom:8px">⚡ ${APP_NAME}</div>
    <h2 style="color:#fff;margin:0 0 16px">We got your message!</h2>
    <p style="color:#94a3b8;line-height:1.6">Hi ${name},</p>
    <p style="color:#94a3b8;line-height:1.6">
      Thanks for reaching out. We'll get back to you as soon as possible.
    </p>
    <blockquote style="border-left:3px solid #7c3aed;margin:20px 0;padding:12px 16px;color:#94a3b8;background:rgba(124,58,237,.08);border-radius:0 6px 6px 0">
      ${message}
    </blockquote>
    <p style="color:#64748b;font-size:13px;margin-top:24px">— The ${APP_NAME} team</p>
  </div>
</body>
</html>`,
  };
}

export function contactInternalEmail(
  name: string,
  from: string,
  message: string
): Pick<EmailPayload, 'subject' | 'text' | 'html'> {
  return {
    subject: `[Contact] ${name} <${from}>`,
    text: `New contact form submission\n\nName: ${name}\nEmail: ${from}\n\nMessage:\n${message}`,
    html: `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;background:#f8fafc;color:#1e293b;margin:0;padding:40px 20px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:8px;padding:32px">
    <h2 style="margin:0 0 16px">New contact form submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> <a href="mailto:${from}">${from}</a></p>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:20px 0">
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap;color:#475569">${message}</p>
  </div>
</body>
</html>`,
  };
}
