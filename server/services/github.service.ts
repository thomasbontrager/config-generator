/**
 * server/services/github.service.ts
 * Domain service for GitHub repository operations.
 */
import {
  createGitHubRepository,
  pushFilesToGitHub,
  type GitHubRepoInput,
  type GitHubPushInput,
  type GitHubRepo,
  type GitHubCommitResult,
} from '@/lib/github';
import { findIntegrationByUserAndProvider } from '@/server/repositories/integration.repository';
import { logActivity } from '@/server/repositories/activity.repository';

/** Retrieves the stored GitHub access token for a user or throws if not connected. */
async function requireGitHubToken(userId: string): Promise<string> {
  const integration = await findIntegrationByUserAndProvider(userId, 'GITHUB');
  if (!integration || integration.revokedAt || !integration.accessToken) {
    throw new Error('No active GitHub integration found. Connect GitHub first.');
  }
  return integration.accessToken;
}

/**
 * Returns the GitHub connection status and profile metadata for the user.
 */
export async function getGitHubStatus(userId: string): Promise<{
  connected: boolean;
  login?: string;
  name?: string;
  avatarUrl?: string;
  profileUrl?: string;
  scopes?: string[];
  connectedAt?: Date;
}> {
  const integration = await findIntegrationByUserAndProvider(userId, 'GITHUB');
  if (!integration || integration.revokedAt) {
    return { connected: false };
  }
  const meta = (integration.metadata ?? {}) as Record<string, string | undefined>;
  return {
    connected: true,
    login: meta.login,
    name: meta.name,
    avatarUrl: meta.avatarUrl,
    profileUrl: meta.profileUrl,
    scopes: integration.scopes,
    connectedAt: integration.connectedAt,
  };
}

/**
 * Creates a new GitHub repository under the authenticated user's account.
 */
export async function createRepo(
  userId: string,
  input: GitHubRepoInput
): Promise<GitHubRepo> {
  const accessToken = await requireGitHubToken(userId);
  const repo = await createGitHubRepository(accessToken, input);
  await logActivity({
    userId,
    action: 'GITHUB_REPO_CREATE',
    metadata: { repoFullName: repo.fullName, private: repo.private },
  });
  return repo;
}

/**
 * Pushes one or more files into a GitHub repository.
 */
export async function pushFilesToRepo(
  userId: string,
  input: GitHubPushInput
): Promise<GitHubCommitResult> {
  const accessToken = await requireGitHubToken(userId);
  const result = await pushFilesToGitHub(accessToken, input);
  await logActivity({
    userId,
    action: 'GITHUB_REPO_PUSH',
    metadata: {
      repo: `${input.owner}/${input.repo}`,
      branch: input.branch ?? 'main',
      fileCount: input.files.length,
      commitSha: result.sha,
    },
  });
  return result;
}
