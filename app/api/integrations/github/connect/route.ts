/**
 * POST /api/integrations/github/connect
 *
 * Exchanges a GitHub OAuth authorization code for an access token and
 * persists (or updates) the integration record for the authenticated user.
 *
 * Body: { code: string }
 * Requires: GITHUB_OAUTH_CLIENT_ID and GITHUB_OAUTH_CLIENT_SECRET env vars.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { connectGitHub } from '@/server/services/integrations.service';

const bodySchema = z.object({
  code: z.string().min(1, 'GitHub OAuth code is required'),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.GITHUB_OAUTH_CLIENT_ID || !process.env.GITHUB_OAUTH_CLIENT_SECRET) {
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

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      );
    }

    const integration = await connectGitHub(session.user.id, parsed.data.code);

    return NextResponse.json(
      {
        integration: {
          id: integration.id,
          provider: integration.provider,
          externalId: integration.externalId,
          scopes: integration.scopes,
          metadata: integration.metadata,
          connectedAt: integration.connectedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    const isClientError =
      msg.includes('not configured') ||
      msg.includes('token exchange') ||
      msg.includes('GitHub returned');
    return NextResponse.json({ error: msg }, { status: isClientError ? 400 : 500 });
  }
}
