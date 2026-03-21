import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(60, 'Name is too long').trim(),
  expiresInDays: z.number().int().min(1).max(365).optional(),
});

/**
 * GET /api/api-keys
 * Returns all non-revoked API keys for the authenticated user.
 * Full key material is NEVER returned after creation.
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id, revokedAt: null },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ keys });
}

/**
 * POST /api/api-keys
 * Creates a new API key.
 *
 * Returns the full plaintext key **once** — it cannot be retrieved again.
 * Only a SHA-256 hash is stored in the database.
 */
export async function POST(request: Request) {
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

  const parsed = createApiKeySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  // Enforce a maximum of 10 active keys per user
  const existing = await prisma.apiKey.count({
    where: { userId: session.user.id, revokedAt: null },
  });

  if (existing >= 10) {
    return NextResponse.json(
      { error: 'Maximum of 10 API keys reached. Revoke unused keys first.' },
      { status: 429 }
    );
  }

  // Generate a cryptographically secure 32-byte random key
  const rawKey = `sfk_${crypto.randomBytes(32).toString('hex')}`; // sfk_ prefix for easy identification
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const keyPrefix = rawKey.substring(0, 12); // "sfk_" + first 8 hex chars

  const expiresAt = parsed.data.expiresInDays
    ? new Date(Date.now() + parsed.data.expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  const key = await prisma.apiKey.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      keyHash,
      keyPrefix,
      expiresAt,
    },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  // rawKey is returned ONCE and never stored in plaintext
  return NextResponse.json({ key, rawKey }, { status: 201 });
}
