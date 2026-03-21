/**
 * server/repositories/integration.repository.ts
 * All database access for the Integration aggregate.
 */
import { prisma } from '@/lib/prisma';
import type { Integration, IntegrationProvider } from '@prisma/client';

export async function findIntegrationByUserAndProvider(userId: string, provider: IntegrationProvider): Promise<Integration | null> {
  return prisma.integration.findUnique({ where: { userId_provider: { userId, provider } } });
}

export async function listActiveIntegrationsByUser(userId: string): Promise<Integration[]> {
  return prisma.integration.findMany({ where: { userId, revokedAt: null }, orderBy: { connectedAt: 'desc' } });
}

export async function upsertIntegration(input: {
  userId: string; provider: IntegrationProvider; accessToken?: string; refreshToken?: string;
  externalId?: string; scopes?: string[]; metadata?: object;
}): Promise<Integration> {
  return prisma.integration.upsert({
    where: { userId_provider: { userId: input.userId, provider: input.provider } },
    create: { ...input, scopes: input.scopes ?? [], revokedAt: null, connectedAt: new Date(), updatedAt: new Date() },
    update: { ...input, scopes: input.scopes ?? [], revokedAt: null, updatedAt: new Date() },
  });
}

export async function revokeIntegration(id: string): Promise<Integration> {
  return prisma.integration.update({ where: { id }, data: { revokedAt: new Date(), accessToken: null } });
}
