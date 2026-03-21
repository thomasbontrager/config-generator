/**
 * server/repositories/api-key.repository.ts
 * All database access for the ApiKey aggregate.
 */
import { prisma } from '@/lib/prisma';
import type { ApiKey } from '@prisma/client';

export async function findApiKeyById(id: string): Promise<ApiKey | null> {
  return prisma.apiKey.findUnique({ where: { id } });
}

export async function findApiKeyByHash(keyHash: string): Promise<ApiKey | null> {
  return prisma.apiKey.findUnique({ where: { keyHash } });
}

export async function listActiveApiKeysByUser(userId: string): Promise<ApiKey[]> {
  return prisma.apiKey.findMany({ where: { userId, revokedAt: null }, orderBy: { createdAt: 'desc' } });
}

export async function countActiveApiKeysByUser(userId: string): Promise<number> {
  return prisma.apiKey.count({ where: { userId, revokedAt: null } });
}

export async function createApiKey(input: {
  userId: string; name: string; keyHash: string; keyPrefix: string; expiresAt?: Date | null;
}): Promise<ApiKey> {
  return prisma.apiKey.create({ data: input });
}

export async function revokeApiKey(id: string): Promise<ApiKey> {
  return prisma.apiKey.update({ where: { id }, data: { revokedAt: new Date() } });
}
