/**
 * POST /api/auth/login
 *
 * Credential-validation endpoint: verifies email + password and returns
 * the authenticated user's public profile on success.
 *
 * ⚠️  This endpoint does NOT set a session cookie.
 * Browser clients that need a persisted session must call NextAuth's
 * `signIn('credentials', { email, password, redirect: false })` (which
 * hits POST /api/auth/callback/credentials) in addition to this endpoint.
 * This route is intended for:
 *   - REST API consumers / mobile apps that manage tokens themselves.
 *   - Server-to-server authentication flows.
 *
 * Timing-safe: a dummy hash is derived once at module load so the
 * bcrypt comparison always runs even when the user is not found,
 * preventing email-enumeration via response timing.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth';
import { logActivity } from '@/server/repositories/activity.repository';

// Derived once at startup — prevents timing-based user enumeration.
const DUMMY_HASH = bcrypt.hashSync(Math.random().toString(36), 12);

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  // Use the module-level dummy hash so bcrypt always runs; prevents enumeration.
  const passwordHash = user?.password ?? DUMMY_HASH;
  const valid = await verifyPassword(password, passwordHash);

  if (!user || !valid) {
    return NextResponse.json(
      { error: 'Invalid email or password.' },
      { status: 401 }
    );
  }

  await logActivity({
    userId: user.id,
    action: 'LOGIN',
    ipAddress: request.headers.get('x-forwarded-for') ?? undefined,
    userAgent: request.headers.get('user-agent') ?? undefined,
  });

  return NextResponse.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      emailVerified: user.emailVerified,
    },
  });
}
