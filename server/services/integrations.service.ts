/**
 * server/services/integrations.service.ts
 * Integrations domain service.
 */
import { exchangeGitHubCode, fetchGitHubUserProfile } from '@/lib/github';
import { findIntegrationByUserAndProvider, upsertIntegration, revokeIntegration } from '@/server/repositories/integration.repository';
import { logActivity } from '@/server/repositories/activity.repository';

export async function connectGitHub(userId: string, code: string) {
  const tokens = await exchangeGitHubCode(code);
  const profile = await fetchGitHubUserProfile(tokens.accessToken);
  const integration = await upsertIntegration({
    userId, provider: 'GITHUB', accessToken: tokens.accessToken,
    externalId: String(profile.id), scopes: tokens.scopes,
    metadata: { login: profile.login, name: profile.name, avatarUrl: profile.avatarUrl },
  });
  await logActivity({ userId, action: 'CONNECT_GITHUB', metadata: { login: profile.login } });
  return integration;
}

export async function disconnectGitHub(userId: string): Promise<void> {
  const existing = await findIntegrationByUserAndProvider(userId, 'GITHUB');
  if (!existing || existing.revokedAt) throw new Error('No active GitHub integration found');
  await revokeIntegration(existing.id);
  await logActivity({ userId, action: 'DISCONNECT_GITHUB' });
}

export async function getGitHubIntegration(userId: string) {
  const record = await findIntegrationByUserAndProvider(userId, 'GITHUB');
  if (!record || record.revokedAt) return null;
  return record;
}
