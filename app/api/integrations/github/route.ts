import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const connectSchema = z.object({
  code: z.string().min(1, 'GitHub OAuth code is required'),
});

const GITHUB_OAUTH_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_API_URL = 'https://api.github.com/user';

/**
 * POST /api/integrations/github
 *
 * Exchanges a GitHub OAuth authorization code for an access token and
 * persists the integration. Requires:
 *   - GITHUB_OAUTH_CLIENT_ID  (env)
 *   - GITHUB_OAUTH_CLIENT_SECRET (env)
 *
 * The access token is stored server-side only and never returned to the client.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GITHUB_OAUTH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('GITHUB_OAUTH_CLIENT_ID or GITHUB_OAUTH_CLIENT_SECRET is not set');
    return NextResponse.json(
      { error: 'GitHub integration is not configured on this server.' },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = connectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  // Exchange code for access token
  const tokenResponse = await fetch(GITHUB_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code: parsed.data.code,
    }),
  });

  if (!tokenResponse.ok) {
    return NextResponse.json(
      { error: 'Failed to exchange GitHub OAuth code' },
      { status: 502 }
    );
  }

  const tokenData = (await tokenResponse.json()) as {
    access_token?: string;
    scope?: string;
    error?: string;
    error_description?: string;
  };

  if (tokenData.error || !tokenData.access_token) {
    return NextResponse.json(
      {
        error:
          tokenData.error_description ??
          tokenData.error ??
          'GitHub returned an error during token exchange',
      },
      { status: 400 }
    );
  }

  const accessToken = tokenData.access_token;
  const scopes = tokenData.scope ? tokenData.scope.split(',').map((s) => s.trim()) : [];

  // Fetch the authenticated GitHub user
  const userResponse = await fetch(GITHUB_USER_API_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  });

  if (!userResponse.ok) {
    return NextResponse.json(
      { error: 'Failed to fetch GitHub user profile' },
      { status: 502 }
    );
  }

  const githubUser = (await userResponse.json()) as {
    id: number;
    login: string;
    name?: string;
    avatar_url?: string;
    html_url?: string;
  };

  // Upsert the integration record
  const integration = await prisma.integration.upsert({
    where: { userId_provider: { userId: session.user.id, provider: 'GITHUB' } },
    create: {
      userId: session.user.id,
      provider: 'GITHUB',
      accessToken,
      externalId: String(githubUser.id),
      scopes,
      metadata: {
        login: githubUser.login,
        name: githubUser.name,
        avatarUrl: githubUser.avatar_url,
        profileUrl: githubUser.html_url,
      },
    },
    update: {
      accessToken,
      externalId: String(githubUser.id),
      scopes,
      metadata: {
        login: githubUser.login,
        name: githubUser.name,
        avatarUrl: githubUser.avatar_url,
        profileUrl: githubUser.html_url,
      },
      revokedAt: null, // re-connecting a previously disconnected integration
      updatedAt: new Date(),
    },
    select: {
      id: true,
      provider: true,
      externalId: true,
      scopes: true,
      metadata: true,
      connectedAt: true,
    },
  });

  return NextResponse.json({ integration }, { status: 201 });
}

/**
 * DELETE /api/integrations/github
 * Revokes the GitHub integration (soft-delete, preserves audit trail).
 */
export async function DELETE() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const integration = await prisma.integration.findUnique({
    where: { userId_provider: { userId: session.user.id, provider: 'GITHUB' } },
  });

  if (!integration || integration.revokedAt) {
    return NextResponse.json(
      { error: 'No active GitHub integration found' },
      { status: 404 }
    );
  }

  await prisma.integration.update({
    where: { id: integration.id },
    data: { revokedAt: new Date(), accessToken: null },
  });

  return NextResponse.json({ message: 'GitHub integration disconnected.' });
}
