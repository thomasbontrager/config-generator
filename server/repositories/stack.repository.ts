/**
 * server/repositories/stack.repository.ts
 * All database access for the Stack aggregate.
 */
import { prisma } from '@/lib/prisma';
import type { Prisma, Stack } from '@prisma/client';

export async function findStackById(id: string): Promise<Stack | null> {
  return prisma.stack.findUnique({ where: { id } });
}

export async function listStacksByUser(userId: string): Promise<Stack[]> {
  return prisma.stack.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } });
}

export async function createStack(input: {
  userId: string; name: string; description?: string; configTypes: string[]; isPublic?: boolean;
}): Promise<Stack> {
  return prisma.stack.create({ data: { ...input, isPublic: input.isPublic ?? false } });
}

export async function updateStack(id: string, data: Prisma.StackUpdateInput): Promise<Stack> {
  return prisma.stack.update({ where: { id }, data });
}

export async function deleteStack(id: string): Promise<void> {
  await prisma.stack.delete({ where: { id } });
}
