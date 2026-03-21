/**
 * lib/github — GitHub OAuth provider adapter.
 */

const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';

export interface GitHubTokens { accessToken: string; scopes: string[]; }
export interface GitHubUserProfile {
  id: number; login: string; name?: string; avatarUrl?: string; profileUrl?: string;
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
  return { accessToken: data.access_token, scopes: data.scope ? data.scope.split(',') : [] };
}

export async function fetchGitHubUserProfile(accessToken: string): Promise<GitHubUserProfile> {
  const res = await fetch(GITHUB_USER_URL, {
    headers: { Authorization: `token ${accessToken}`, Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`GitHub API returned HTTP ${res.status}`);
  const u = await res.json() as { id: number; login: string; name?: string; avatar_url?: string; html_url?: string };
  return { id: u.id, login: u.login, name: u.name, avatarUrl: u.avatar_url, profileUrl: u.html_url };
}
