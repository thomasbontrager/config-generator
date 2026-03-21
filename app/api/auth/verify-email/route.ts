import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
  email: z.string().email('Invalid email address'),
});

/**
 * POST /api/auth/verify-email
 *
 * Validates the email-verification token stored in VerificationToken.
 * On success, sets User.emailVerified and removes the token.
 *
 * The verify-email email is sent during signup (or by a re-send endpoint).
 * Token is stored as: identifier = user email, token = random UUID.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = verifyEmailSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  const { token, email } = parsed.data;

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record) {
    return NextResponse.json(
      { error: 'Verification link is invalid or has already been used.' },
      { status: 400 }
    );
  }

  // Validate that the token belongs to the expected email
  if (record.identifier !== email) {
    return NextResponse.json(
      { error: 'Verification link is invalid.' },
      { status: 400 }
    );
  }

  if (record.expires < new Date()) {
    // Clean up the expired token
    await prisma.verificationToken.delete({ where: { token } }).catch(() => null);
    return NextResponse.json(
      { error: 'Verification link has expired. Please request a new one.' },
      { status: 400 }
    );
  }

  // Mark the user's email as verified and consume the token atomically
  await prisma.$transaction([
    prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  return NextResponse.json({ message: 'Email verified successfully.' });
}
