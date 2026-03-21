/**
 * lib/adapters/github.provider.ts
 *
 * Clean adapter interface for GitHub integration operations.
 * All methods are scoped to an organizationId so callers never need to
 * manage userId / access-token lookup directly.
 */

export interface GitHubProvider {
  /**
   * Exchange an OAuth authorization code for an access token and store the
   * GitHub integration for the owner of the given organization.
   */
  connectAccount(input: { organizationId: string; code: string }): Promise<void>;

  /**
   * Create a new GitHub repository under the organization owner's account.
   * Returns the repository URL and name as confirmed by GitHub.
   */
  createRepository(input: {
    organizationId: string;
    repoName: string;
    isPrivate: boolean;
  }): Promise<{ repoUrl: string; repoName: string }>;

  /**
   * Push the files from a previously-generated stack configuration to a
   * GitHub repository named after the stack.
   * Returns the resulting commit SHA and repository URL when available.
   */
  pushGeneratedStack(input: {
    organizationId: string;
    stackProjectId: string;
    generationId: string;
  }): Promise<{ commitSha?: string; repoUrl?: string }>;

  /**
   * Returns the current GitHub connection status for the organization owner.
   * `accountName` is the GitHub login; `lastSyncAt` is the ISO timestamp of
   * the most recent token update (or null if not available).
   */
  getConnectionStatus(input: { organizationId: string }): Promise<{
    connected: boolean;
    accountName?: string;
    lastSyncAt?: string | null;
  }>;
}
