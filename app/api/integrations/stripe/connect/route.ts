/**
 * POST /api/integrations/stripe/connect
 *
 * Stores a Stripe API key (and optional account ID) for the authenticated user.
 * The key is persisted as the integration's accessToken.
 *
 * Body:
 *   { apiKey: string, accountId?: string }
 *
 * Note: The apiKey is stored in `accessToken` (server-side only).
 * Apply AES-GCM encryption in production per the Integration model comment.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { connectStripe } from '@/server/services/integrations.service';

const bodySchema = z.object({
  apiKey: z
    .string()
    .min(1, 'Stripe API key is required')
    .refine(
      (k) => k.startsWith('sk_') || k.startsWith('rk_'),
      'API key must be a valid Stripe secret key (sk_... or rk_...)'
    ),
  accountId: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const integration = await connectStripe(session.user.id, {
      apiKey: parsed.data.apiKey,
      accountId: parsed.data.accountId,
    });

    return NextResponse.json(
      {
        integration: {
          id: integration.id,
          provider: integration.provider,
          externalId: integration.externalId,
          metadata: integration.metadata,
          connectedAt: integration.connectedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Stripe connect error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
