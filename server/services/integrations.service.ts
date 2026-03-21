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

export async function connectStripe(
  userId: string,
  input: { apiKey: string; accountId?: string }
) {
  // TODO: encrypt apiKey with AES-GCM before storing (see Integration.accessToken comment)
  const integration = await upsertIntegration({
    userId,
    provider: 'STRIPE',
    accessToken: input.apiKey,
    externalId: input.accountId,
    metadata: { accountId: input.accountId },
  });
  await logActivity({ userId, action: 'CONNECT_STRIPE', metadata: { accountId: input.accountId } });
  return integration;
}

export async function connectOpenAI(
  userId: string,
  input: { apiKey: string; orgId?: string }
) {
  // TODO: encrypt apiKey with AES-GCM before storing (see Integration.accessToken comment)
  const integration = await upsertIntegration({
    userId,
    provider: 'OPENAI',
    accessToken: input.apiKey,
    externalId: input.orgId,
    metadata: { orgId: input.orgId },
  });
  await logActivity({ userId, action: 'CONNECT_OPENAI', metadata: { orgId: input.orgId } });
  return integration;
}

export async function connectEmail(
  userId: string,
  input: {
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
    fromAddress?: string;
    apiKey?: string;
    emailProvider?: string;
  }
) {
  // TODO: encrypt smtpPass/apiKey with AES-GCM before storing (see Integration.accessToken comment)
  const integration = await upsertIntegration({
    userId,
    provider: 'EMAIL',
    accessToken: input.apiKey ?? input.smtpPass,
    metadata: {
      smtpHost: input.smtpHost,
      smtpPort: input.smtpPort,
      smtpUser: input.smtpUser,
      fromAddress: input.fromAddress,
      emailProvider: input.emailProvider,
    },
  });
  await logActivity({ userId, action: 'CONNECT_EMAIL', metadata: { emailProvider: input.emailProvider } });
  return integration;
}

export async function connectStorage(
  userId: string,
  input: {
    provider: string;
    bucket: string;
    region?: string;
    accessKeyId?: string;
    secretAccessKey?: string;
    endpoint?: string;
  }
) {
  // TODO: encrypt secretAccessKey with AES-GCM before storing (see Integration.accessToken comment)
  const integration = await upsertIntegration({
    userId,
    provider: 'STORAGE',
    accessToken: input.secretAccessKey,
    externalId: input.bucket,
    metadata: {
      provider: input.provider,
      bucket: input.bucket,
      region: input.region,
      accessKeyId: input.accessKeyId,
      endpoint: input.endpoint,
    },
  });
  await logActivity({ userId, action: 'CONNECT_STORAGE', metadata: { provider: input.provider, bucket: input.bucket } });
  return integration;
}
