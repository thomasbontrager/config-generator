/**
 * server/repositories/user.repository.ts
 * All database access for the User aggregate.
 */
import { prisma } from '@/lib/prisma';
import type { Prisma, User } from '@prisma/client';

export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(input: {
  name: string; email: string; hashedPassword: string; trialEndsAt: Date;
}): Promise<User> {
  return prisma.user.create({
    data: { name: input.name, email: input.email, password: input.hashedPassword, subscriptionStatus: 'TRIAL', trialEndsAt: input.trialEndsAt },
  });
}

export async function updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
  return prisma.user.update({ where: { id }, data });
}

export async function updateUserByEmail(email: string, data: Prisma.UserUpdateInput): Promise<User> {
  return prisma.user.update({ where: { email }, data });
}

export async function listUsers(opts?: { skip?: number; take?: number }): Promise<User[]> {
  return prisma.user.findMany({ orderBy: { createdAt: 'desc' }, ...opts });
}

export async function countUsers(): Promise<number> {
  return prisma.user.count();
}
