/**
 * server/services/api-keys.service.ts
 * API keys domain service.
 */
import { generateApiKey } from '@/lib/security';
import { findApiKeyById, listActiveApiKeysByUser, countActiveApiKeysByUser, createApiKey, revokeApiKey } from '@/server/repositories/api-key.repository';
import { logActivity } from '@/server/repositories/activity.repository';

const MAX_KEYS = 10;

export class ApiKeyLimitError extends Error { constructor() { super(`Max ${MAX_KEYS} API keys reached`); } }
export class ApiKeyNotFoundError extends Error { constructor() { super('API key not found'); } }
export class ApiKeyForbiddenError extends Error { constructor() { super('Forbidden'); } }

export async function listApiKeys(userId: string) { return listActiveApiKeysByUser(userId); }

export async function createApiKeyForUser(input: { userId: string; name: string; expiresInDays?: number }) {
  if (await countActiveApiKeysByUser(input.userId) >= MAX_KEYS) throw new ApiKeyLimitError();
  const { rawKey, keyHash, keyPrefix } = generateApiKey();
  const expiresAt = input.expiresInDays ? new Date(Date.now() + input.expiresInDays * 86400000) : null;
  const key = await createApiKey({ userId: input.userId, name: input.name, keyHash, keyPrefix, expiresAt });
  await logActivity({ userId: input.userId, action: 'CREATE_API_KEY', metadata: { keyId: key.id } });
  return { key: { id: key.id, name: key.name, keyPrefix: key.keyPrefix, expiresAt: key.expiresAt, createdAt: key.createdAt }, rawKey };
}

export async function revokeApiKeyForUser(keyId: string, userId: string): Promise<void> {
  const key = await findApiKeyById(keyId);
  if (!key) throw new ApiKeyNotFoundError();
  if (key.userId !== userId) throw new ApiKeyForbiddenError();
  await revokeApiKey(keyId);
  await logActivity({ userId, action: 'REVOKE_API_KEY', metadata: { keyId } });
}
