import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, passwordResetEmail } from '@/lib/email';
import { z } from 'zod';
import crypto from 'crypto';

const schema = z.object({
  email: z.string().email(),
});

// Token expires in 1 hour
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  let email: string;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }
    email = parsed.data.email.toLowerCase();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Always return the same success message to prevent user enumeration
  const successResponse = NextResponse.json({
    message: 'If an account exists for this email, a reset link has been sent.',
  });

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // If the user doesn't exist, still return success (no enumeration)
    if (!user) {
      return successResponse;
    }

    // Credentials-only accounts have a password; OAuth-only users don't
    if (!user.password) {
      // The account exists but was created via OAuth — email them a note instead
      await sendEmail({
        to: email,
        subject: 'ShipForge – Password reset',
        text:
          'Your ShipForge account was created with a social login (Google or GitHub). ' +
          'You cannot set a password directly. Please sign in using that provider.',
        html: `<p>Your ShipForge account was created with a social login (Google or GitHub). Please sign in using that provider.</p>`,
      });
      return successResponse;
    }

    // Create or replace an existing reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    const identifier = `reset:${email}`;

    await prisma.verificationToken.deleteMany({ where: { identifier } });
    await prisma.verificationToken.create({ data: { identifier, token, expires } });

    const appUrl = process.env.NEXTAUTH_URL || 'https://shipforge.dev';
    const resetUrl = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    await sendEmail({
      to: email,
      ...passwordResetEmail(resetUrl),
    });
  } catch (error) {
    console.error('Forgot-password error:', error);
    // Don't expose internal errors to the client; log for observability
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }

  return successResponse;
}
