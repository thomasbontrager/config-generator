/**
 * lib/auth — auth domain public surface.
 * Re-exports authOptions for backward-compat and exposes auth helpers.
 */
export { authOptions } from '../auth';

export const UserRole = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;
export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export const SubscriptionStatus = {
  FREE: 'FREE',
  TRIAL: 'TRIAL',
  ACTIVE: 'ACTIVE',
  CANCELED: 'CANCELED',
  PAST_DUE: 'PAST_DUE',
} as const;
export type SubscriptionStatusType = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export function isActiveSubscription(status: string | undefined | null): boolean {
  return status === SubscriptionStatus.ACTIVE || status === SubscriptionStatus.TRIAL;
}

export function isAdmin(role: string | undefined | null): boolean {
  return role === UserRole.ADMIN;
}

import bcrypt from 'bcryptjs';
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

import crypto from 'crypto';
import { prisma } from '../prisma';

export async function createVerificationToken(email: string): Promise<string> {
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.verificationToken.deleteMany({ where: { identifier: email } }).catch(() => null);
  await prisma.verificationToken.create({ data: { identifier: email, token, expires } });
  return token;
}

export async function consumeVerificationToken(token: string): Promise<string> {
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) throw new Error('Token is invalid or has already been used.');
  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => null);
    throw new Error('Token has expired. Please request a new one.');
  }
  await prisma.verificationToken.delete({ where: { token } });
  return record.identifier;
}
