/**
 * server/services/auth.service.ts
 * Auth domain service — signup, password reset, email verification.
 * Architecture: route → this service → repositories + lib/auth
 */
import { hashPassword, verifyPassword, createVerificationToken, consumeVerificationToken } from '@/lib/auth';
import { sendEmail, passwordResetEmail } from '@/lib/email';
import { logActivity } from '@/server/repositories/activity.repository';
import { findUserByEmail, findUserById, createUser, updateUser, updateUserByEmail } from '@/server/repositories/user.repository';

export class UserAlreadyExistsError extends Error {
  constructor(email: string) { super(`User ${email} already exists`); this.name = 'UserAlreadyExistsError'; }
}

export async function signup(input: { name: string; email: string; password: string }) {
  const existing = await findUserByEmail(input.email);
  if (existing) throw new UserAlreadyExistsError(input.email);
  const hashedPassword = await hashPassword(input.password);
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);
  const user = await createUser({ name: input.name, email: input.email, hashedPassword, trialEndsAt });
  await logActivity({ userId: user.id, action: 'SIGNUP' });
  return { id: user.id, name: user.name, email: user.email };
}

export async function initiatePasswordReset(email: string, appUrl: string): Promise<void> {
  const user = await findUserByEmail(email);
  if (!user) return; // Don't reveal existence
  const token = await createVerificationToken(email);
  const resetUrl = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  await sendEmail({ to: email, ...passwordResetEmail(resetUrl) });
}

export class InvalidTokenError extends Error {
  constructor() { super('Token is invalid or has expired.'); this.name = 'InvalidTokenError'; }
}

export async function completePasswordReset(token: string, email: string, newPassword: string): Promise<void> {
  let identifier: string;
  try { identifier = await consumeVerificationToken(token); } catch { throw new InvalidTokenError(); }
  if (identifier !== email) throw new InvalidTokenError();
  const hashed = await hashPassword(newPassword);
  await updateUserByEmail(email, { password: hashed });
  const user = await findUserByEmail(email);
  if (user) await logActivity({ userId: user.id, action: 'PASSWORD_RESET' });
}

export class IncorrectPasswordError extends Error {
  constructor() { super('Current password is incorrect.'); this.name = 'IncorrectPasswordError'; }
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  const user = await findUserById(userId);
  if (!user?.password) throw new IncorrectPasswordError();
  const valid = await verifyPassword(currentPassword, user.password);
  if (!valid) throw new IncorrectPasswordError();
  await updateUser(userId, { password: await hashPassword(newPassword) });
  await logActivity({ userId, action: 'PASSWORD_CHANGED' });
}
