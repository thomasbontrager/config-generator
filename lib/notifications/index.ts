/**
 * lib/notifications — transactional email and alert boundary.
 * Delegates to lib/email for delivery; owns notification templates.
 */
export { sendEmail } from '../email';
export type { EmailPayload } from '../email';

const APP_NAME = 'ShipForge';
const APP_URL = process.env.NEXTAUTH_URL ?? 'https://shipforge.dev';

export function welcomeEmail(name: string) {
  return {
    subject: `Welcome to ${APP_NAME}!`,
    text: `Hi ${name},\n\nWelcome to ${APP_NAME}! Get started at ${APP_URL}/dashboard/generator\n\n— The ${APP_NAME} team`,
    html: `<p>Hi ${name}, welcome to <strong>${APP_NAME}</strong>! <a href="${APP_URL}/dashboard/generator">Generate your first config →</a></p>`,
  };
}

export function verifyEmailMessage(verifyUrl: string) {
  return {
    subject: `${APP_NAME} – Verify your email address`,
    text: `Verify your email by visiting: ${verifyUrl}\n\nLink expires in 24 hours.`,
    html: `<p>Click to verify your email: <a href="${verifyUrl}">Verify Email</a> (expires in 24 hours)</p>`,
  };
}
