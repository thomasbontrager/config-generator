/**
 * POST /api/integrations/storage/connect
 *
 * Stores cloud storage credentials for the authenticated user.
 * Supports S3-compatible providers (AWS S3, R2, MinIO, etc.).
 *
 * Body:
 *   {
 *     provider:        string   — e.g. "s3", "r2", "gcs", "minio"
 *     bucket:          string   — storage bucket name
 *     region?:         string   — e.g. "us-east-1"
 *     accessKeyId?:    string   — access key / account ID
 *     secretAccessKey?: string  — stored as accessToken (server-side only)
 *     endpoint?:       string   — custom endpoint for non-AWS providers
 *   }
 *
 * Apply AES-GCM encryption to secretAccessKey in production per the
 * Integration model comment.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { connectStorage } from '@/server/services/integrations.service';

const bodySchema = z.object({
  provider: z.string().min(1, 'Storage provider is required'),
  bucket: z.string().min(1, 'Bucket name is required'),
  region: z.string().optional(),
  accessKeyId: z.string().optional(),
  secretAccessKey: z.string().optional(),
  endpoint: z.string().url('endpoint must be a valid URL').optional(),
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

    const integration = await connectStorage(session.user.id, parsed.data);

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
    console.error('Storage connect error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
