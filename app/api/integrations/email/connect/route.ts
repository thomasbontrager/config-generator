/**
 * POST /api/integrations/email/connect
 *
 * Stores email provider credentials for the authenticated user.
 * Supports two modes:
 *   1. SMTP:  { smtpHost, smtpPort, smtpUser, smtpPass, fromAddress }
 *   2. API:   { apiKey, emailProvider, fromAddress }
 *             (e.g. Resend, SendGrid, Postmark)
 *
 * Credentials are persisted server-side only via the Integration model.
 * Apply AES-GCM encryption in production per the Integration model comment.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { connectEmail } from '@/server/services/integrations.service';

const smtpSchema = z.object({
  mode: z.literal('smtp'),
  smtpHost: z.string().min(1, 'SMTP host is required'),
  smtpPort: z.number().int().min(1).max(65535).default(587),
  smtpUser: z.string().min(1, 'SMTP username is required'),
  smtpPass: z.string().min(1, 'SMTP password is required'),
  fromAddress: z.string().email('fromAddress must be a valid email').optional(),
});

const apiSchema = z.object({
  mode: z.literal('api'),
  apiKey: z.string().min(1, 'API key is required'),
  emailProvider: z.string().min(1, 'emailProvider is required'),
  fromAddress: z.string().email('fromAddress must be a valid email').optional(),
});

const bodySchema = z.discriminatedUnion('mode', [smtpSchema, apiSchema]);

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

    const data = parsed.data;
    const integration = await connectEmail(session.user.id, {
      smtpHost: data.mode === 'smtp' ? data.smtpHost : undefined,
      smtpPort: data.mode === 'smtp' ? data.smtpPort : undefined,
      smtpUser: data.mode === 'smtp' ? data.smtpUser : undefined,
      smtpPass: data.mode === 'smtp' ? data.smtpPass : undefined,
      apiKey: data.mode === 'api' ? data.apiKey : undefined,
      emailProvider: data.mode === 'api' ? data.emailProvider : undefined,
      fromAddress: data.fromAddress,
    });

    return NextResponse.json(
      {
        integration: {
          id: integration.id,
          provider: integration.provider,
          metadata: integration.metadata,
          connectedAt: integration.connectedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Email connect error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
