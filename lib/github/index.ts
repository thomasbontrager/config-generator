/**
 * lib/github — GitHub OAuth provider adapter and API helpers.
 */

const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';
const GITHUB_API_BASE = 'https://api.github.com';

export interface GitHubTokens { accessToken: string; scopes: string[]; }
export interface GitHubUserProfile {
  id: number; login: string; name?: string; avatarUrl?: string; profileUrl?: string;
}

export interface GitHubRepoInput {
  name: string;
  description?: string;
  private?: boolean;
  autoInit?: boolean;
}

export interface GitHubRepo {
  id: number;
  fullName: string;
  htmlUrl: string;
  cloneUrl: string;
  sshUrl: string;
  private: boolean;
  defaultBranch: string;
}

export interface GitHubFileEntry {
  path: string;
  /** UTF-8 file content (will be base64-encoded before sending to GitHub API) */
  content: string;
}

export interface GitHubPushInput {
  owner: string;
  repo: string;
  branch?: string;
  /** Commit message */
  message?: string;
  files: GitHubFileEntry[];
}

export interface GitHubCommitResult {
  sha: string;
  htmlUrl: string;
}

export async function exchangeGitHubCode(code: string): Promise<GitHubTokens> {
  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('GitHub OAuth credentials not configured');

  const res = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });
  if (!res.ok) throw new Error(`GitHub token endpoint returned HTTP ${res.status}`);
  const data = await res.json() as { access_token?: string; scope?: string; error_description?: string };
  if (!data.access_token) throw new Error(data.error_description ?? 'GitHub token exchange failed');
  return { accessToken: data.access_token, scopes: data.scope ? data.scope.split(' ') : [] };
}

export async function fetchGitHubUserProfile(accessToken: string): Promise<GitHubUserProfile> {
  const res = await fetch(GITHUB_USER_URL, {
    headers: { Authorization: `token ${accessToken}`, Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`GitHub API returned HTTP ${res.status}`);
  const u = await res.json() as { id: number; login: string; name?: string; avatar_url?: string; html_url?: string };
  return { id: u.id, login: u.login, name: u.name, avatarUrl: u.avatar_url, profileUrl: u.html_url };
}

/**
 * Create a new GitHub repository under the authenticated user's account.
 */
export async function createGitHubRepository(
  accessToken: string,
  input: GitHubRepoInput
): Promise<GitHubRepo> {
  const res = await fetch(`${GITHUB_API_BASE}/user/repos`, {
    method: 'POST',
    headers: {
      Authorization: `token ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({
      name: input.name,
      description: input.description ?? '',
      private: input.private ?? false,
      auto_init: input.autoInit ?? false,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? `GitHub API returned HTTP ${res.status} creating repository`);
  }

  const r = await res.json() as {
    id: number; full_name: string; html_url: string;
    clone_url: string; ssh_url: string; private: boolean; default_branch: string;
  };
  return {
    id: r.id,
    fullName: r.full_name,
    htmlUrl: r.html_url,
    cloneUrl: r.clone_url,
    sshUrl: r.ssh_url,
    private: r.private,
    defaultBranch: r.default_branch,
  };
}

/**
 * Push one or more files to a GitHub repository using the Contents API.
 * Each file is created or updated (upserted) in a separate blob, then a single
 * tree + commit is built on top of the target branch's HEAD.
 *
 * If the repository is empty (no commits yet), each file is pushed individually
 * via PUT /repos/{owner}/{repo}/contents/{path} because the Git Data API
 * requires at least one commit to create a tree.
 */
export async function pushFilesToGitHub(
  accessToken: string,
  input: GitHubPushInput
): Promise<GitHubCommitResult> {
  const { owner, repo, files, message = 'chore: add generated configuration files' } = input;
  const branch = input.branch ?? 'main';

  const ghHeaders = {
    Authorization: `token ${accessToken}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  // Resolve current HEAD SHA for the branch (may not exist for empty repos)
  const refRes = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/ref/heads/${branch}`,
    { headers: ghHeaders }
  );

  // 404 = branch/ref doesn't exist yet; 409 = repository is completely empty.
  // Both cases mean we fall back to the Contents API for individual file creation.
  // Any other non-OK status (401, 403, 500, …) is a real error.
  if (!refRes.ok && refRes.status !== 404 && refRes.status !== 409) {
    const err = await refRes.json().catch(() => ({})) as { message?: string };
    throw new Error(err.message ?? `GitHub API returned HTTP ${refRes.status} resolving branch ref`);
  }

  if (!refRes.ok) {
    // Repository is empty or branch doesn't exist yet — use Contents API for each file
    let lastSha = '';
    let lastHtmlUrl = '';
    for (const file of files) {
      const contentBase64 = Buffer.from(file.content, 'utf-8').toString('base64');
      const putRes = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${file.path}`,
        {
          method: 'PUT',
          headers: ghHeaders,
          body: JSON.stringify({ message, content: contentBase64, branch }),
        }
      );
      if (!putRes.ok) {
        const err = await putRes.json().catch(() => ({})) as { message?: string };
        throw new Error(err.message ?? `GitHub API returned HTTP ${putRes.status} pushing ${file.path}`);
      }
      const data = await putRes.json() as { commit: { sha: string; html_url: string } };
      lastSha = data.commit.sha;
      lastHtmlUrl = data.commit.html_url;
    }
    return { sha: lastSha, htmlUrl: lastHtmlUrl };
  }

  const refData = await refRes.json() as { object: { sha: string } };
  const baseSha = refData.object.sha;

  // Get base tree SHA from commit
  const baseCommitRes = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/commits/${baseSha}`,
    { headers: ghHeaders }
  );
  if (!baseCommitRes.ok) throw new Error(`GitHub API: could not fetch base commit ${baseSha}`);
  const baseCommitData = await baseCommitRes.json() as { tree: { sha: string } };
  const baseTreeSha = baseCommitData.tree.sha;

  // Create blobs for each file
  const treeItems = await Promise.all(
    files.map(async (file) => {
      const blobRes = await fetch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/blobs`,
        {
          method: 'POST',
          headers: ghHeaders,
          body: JSON.stringify({ content: file.content, encoding: 'utf-8' }),
        }
      );
      if (!blobRes.ok) throw new Error(`GitHub API: failed to create blob for ${file.path}`);
      const blob = await blobRes.json() as { sha: string };
      return { path: file.path, mode: '100644', type: 'blob', sha: blob.sha };
    })
  );

  // Create new tree
  const treeRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees`, {
    method: 'POST',
    headers: ghHeaders,
    body: JSON.stringify({ base_tree: baseTreeSha, tree: treeItems }),
  });
  if (!treeRes.ok) throw new Error('GitHub API: failed to create git tree');
  const treeData = await treeRes.json() as { sha: string };

  // Create commit
  const commitRes = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/commits`, {
    method: 'POST',
    headers: ghHeaders,
    body: JSON.stringify({ message, tree: treeData.sha, parents: [baseSha] }),
  });
  if (!commitRes.ok) throw new Error('GitHub API: failed to create commit');
  const commitData = await commitRes.json() as { sha: string; html_url: string };

  // Update branch reference
  const updateRefRes = await fetch(
    `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/refs/heads/${branch}`,
    {
      method: 'PATCH',
      headers: ghHeaders,
      body: JSON.stringify({ sha: commitData.sha }),
    }
  );
  if (!updateRefRes.ok) throw new Error('GitHub API: failed to update branch ref');

  return { sha: commitData.sha, htmlUrl: commitData.html_url };
}
