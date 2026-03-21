/**
 * lib/adapters/github.adapter.ts
 *
 * Concrete implementation of GitHubProvider.
 * Bridges the organization-scoped adapter interface to the existing
 * user-scoped GitHub service and integration repository functions.
 *
 * Organization → GitHub token resolution:
 *   Each org has one OWNER member.  The adapter resolves that member's userId
 *   and delegates to the existing github.service / integrations.service that
 *   operate on userId.
 */

import { prisma } from '@/lib/prisma';
import {
  exchangeGitHubCode,
  fetchGitHubUserProfile,
  createGitHubRepository,
  pushFilesToGitHub,
} from '@/lib/github';
import {
  upsertIntegration,
  findIntegrationByUserAndProvider,
} from '@/server/repositories/integration.repository';
import { logActivity } from '@/server/repositories/activity.repository';
import { buildZipFromConfig } from '@/lib/generator';
import type { StackConfig } from '@/types/stack-config';
import { stackConfigSchema } from '@/types/stack-config';
import type { GitHubProvider } from './github.provider';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the userId of the OWNER member of the given organization.
 * Throws a user-friendly error when the organization cannot be found or has
 * no owner.
 */
async function resolveOrgOwnerUserId(organizationId: string): Promise<string> {
  const ownerMember = await prisma.organizationMember.findFirst({
    where: { organizationId, role: 'OWNER' },
    select: { userId: true },
  });
  if (!ownerMember) {
    throw new Error(`Organization ${organizationId} not found or has no owner`);
  }
  return ownerMember.userId;
}

/**
 * Returns the active GitHub access token for the given user.
 * Throws a user-friendly error when no active integration exists.
 */
async function requireGitHubToken(userId: string): Promise<string> {
  const integration = await findIntegrationByUserAndProvider(userId, 'GITHUB');
  if (!integration || integration.revokedAt || !integration.accessToken) {
    throw new Error('No active GitHub integration found. Connect GitHub first.');
  }
  return integration.accessToken;
}

/**
 * Converts a display name into a safe GitHub repo slug:
 *   "My Awesome App" → "my-awesome-app"
 */
function toRepoSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── Adapter ──────────────────────────────────────────────────────────────────

export class GitHubAdapter implements GitHubProvider {
  // ── connectAccount ────────────────────────────────────────────────────────

  async connectAccount(input: { organizationId: string; code: string }): Promise<void> {
    const userId = await resolveOrgOwnerUserId(input.organizationId);

    const tokens = await exchangeGitHubCode(input.code);
    const profile = await fetchGitHubUserProfile(tokens.accessToken);

    await upsertIntegration({
      userId,
      provider: 'GITHUB',
      accessToken: tokens.accessToken,
      externalId: String(profile.id),
      scopes: tokens.scopes,
      metadata: {
        login: profile.login,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
      },
    });

    await logActivity({
      userId,
      action: 'CONNECT_GITHUB',
      metadata: { organizationId: input.organizationId, login: profile.login },
    });
  }

  // ── createRepository ──────────────────────────────────────────────────────

  async createRepository(input: {
    organizationId: string;
    repoName: string;
    isPrivate: boolean;
  }): Promise<{ repoUrl: string; repoName: string }> {
    const userId = await resolveOrgOwnerUserId(input.organizationId);
    const accessToken = await requireGitHubToken(userId);

    const repo = await createGitHubRepository(accessToken, {
      name: input.repoName,
      private: input.isPrivate,
      autoInit: false,
    });

    await logActivity({
      userId,
      action: 'GITHUB_REPO_CREATE',
      metadata: {
        organizationId: input.organizationId,
        repoFullName: repo.fullName,
        private: repo.private,
      },
    });

    return { repoUrl: repo.htmlUrl, repoName: repo.fullName };
  }

  // ── pushGeneratedStack ────────────────────────────────────────────────────

  async pushGeneratedStack(input: {
    organizationId: string;
    stackProjectId: string;
    generationId: string;
  }): Promise<{ commitSha?: string; repoUrl?: string }> {
    const userId = await resolveOrgOwnerUserId(input.organizationId);
    const accessToken = await requireGitHubToken(userId);

    // Load the stack to derive the repository name
    const stack = await prisma.stack.findUnique({
      where: { id: input.stackProjectId },
      select: { id: true, name: true, userId: true },
    });
    if (!stack) {
      throw new Error(`Stack ${input.stackProjectId} not found`);
    }

    // Load the generation record to get the stored StackConfig
    const generation = await prisma.generatedConfig.findUnique({
      where: { id: input.generationId },
      select: { id: true, content: true, userId: true },
    });
    if (!generation) {
      throw new Error(`Generation ${input.generationId} not found`);
    }

    // Determine the target repo name from the stack name
    const repoSlug = toRepoSlug(stack.name);

    // Build files from the stored config
    // The content field may contain a full StackConfig (new format) or a legacy
    // { configTypes: string[] } object.  We attempt the new format first.
    let files: Array<{ path: string; content: string }>;

    const parsedConfig = stackConfigSchema.safeParse(generation.content);
    if (parsedConfig.success) {
      // New format: full StackConfig — rebuild ZIP and extract files as a flat list
      files = await extractFilesFromConfig(parsedConfig.data);
    } else {
      // Legacy format: { configTypes: string[] }
      const legacy = generation.content as { configTypes?: string[] };
      const configTypes = Array.isArray(legacy?.configTypes) ? legacy.configTypes : [];
      files = await extractFilesFromLegacyTypes(configTypes);
    }

    if (files.length === 0) {
      return {};
    }

    // Get the authenticated user's GitHub login to determine the repo owner
    const integration = await findIntegrationByUserAndProvider(userId, 'GITHUB');
    const meta = (integration?.metadata ?? {}) as Record<string, string | undefined>;
    const ownerLogin = meta.login;
    if (!ownerLogin) {
      throw new Error('GitHub login not found in integration metadata');
    }

    const result = await pushFilesToGitHub(accessToken, {
      owner: ownerLogin,
      repo: repoSlug,
      branch: 'main',
      message: `chore: add generated stack files (generation ${input.generationId})`,
      files,
    });

    await logActivity({
      userId,
      action: 'GITHUB_REPO_PUSH',
      metadata: {
        organizationId: input.organizationId,
        stackProjectId: input.stackProjectId,
        generationId: input.generationId,
        repo: `${ownerLogin}/${repoSlug}`,
        commitSha: result.sha,
      },
    });

    return { commitSha: result.sha, repoUrl: result.htmlUrl };
  }

  // ── getConnectionStatus ───────────────────────────────────────────────────

  async getConnectionStatus(input: { organizationId: string }): Promise<{
    connected: boolean;
    accountName?: string;
    lastSyncAt?: string | null;
  }> {
    let userId: string;
    try {
      userId = await resolveOrgOwnerUserId(input.organizationId);
    } catch {
      return { connected: false };
    }

    const integration = await findIntegrationByUserAndProvider(userId, 'GITHUB');
    if (!integration || integration.revokedAt) {
      return { connected: false };
    }

    const meta = (integration.metadata ?? {}) as Record<string, string | undefined>;
    return {
      connected: true,
      accountName: meta.login,
      lastSyncAt: integration.updatedAt?.toISOString() ?? null,
    };
  }
}

// ─── File extraction helpers ──────────────────────────────────────────────────

/**
 * Generates a ZIP from a StackConfig and returns its entries as flat files
 * suitable for pushFilesToGitHub.
 */
async function extractFilesFromConfig(
  config: StackConfig
): Promise<Array<{ path: string; content: string }>> {
  // Dynamically import JSZip to unpack the generated archive
  const JSZip = (await import('jszip')).default;
  const zipBuffer = await buildZipFromConfig(config);
  const zip = await JSZip.loadAsync(zipBuffer);

  const entries: Array<{ path: string; content: string }> = [];
  for (const [relativePath, file] of Object.entries(zip.files)) {
    if (file.dir) continue;
    const content = await file.async('string');
    // Strip the leading slug/ folder so files land at the repo root
    const repoPath = relativePath.replace(/^[^/]+\//, '');
    if (repoPath) {
      entries.push({ path: repoPath, content });
    }
  }
  return entries;
}

/**
 * Builds files for the legacy configTypes array by delegating to the existing
 * TEMPLATES registry.
 */
async function extractFilesFromLegacyTypes(
  configTypes: string[]
): Promise<Array<{ path: string; content: string }>> {
  const { TEMPLATES } = await import('@/lib/generator');
  const entries: Array<{ path: string; content: string }> = [];
  for (const configType of configTypes) {
    const template = TEMPLATES[configType];
    if (!template) continue;
    for (const [filePath, content] of Object.entries(template.files)) {
      entries.push({ path: `${configType}/${filePath}`, content });
    }
  }
  return entries;
}
