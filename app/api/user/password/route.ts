import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

/**
 * PATCH /api/user/password
 *
 * Changes the authenticated user's password.
 * Requires the current password for verification (prevents account takeover
 * if a session is stolen but the attacker doesn't know the current password).
 *
 * OAuth-only accounts (password field is null) cannot use this endpoint;
 * they must reset via the forgot-password flow.
 */
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let parsed: z.infer<typeof changePasswordSchema>;

  try {
    const body = await request.json();
    const result = changePasswordSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      );
    }
    parsed = result.data;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, password: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // OAuth-only accounts have no password — direct them to the reset flow
  if (!user.password) {
    return NextResponse.json(
      {
        error:
          'Your account uses social login (Google or GitHub). ' +
          'Use the forgot-password flow to set a password.',
      },
      { status: 400 }
    );
  }

  const isCurrentPasswordValid = await bcrypt.compare(
    parsed.currentPassword,
    user.password
  );

  if (!isCurrentPasswordValid) {
    return NextResponse.json(
      { error: 'Current password is incorrect' },
      { status: 400 }
    );
  }

  const hashed = await bcrypt.hash(parsed.newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashed },
  });

  return NextResponse.json({ message: 'Password changed successfully.' });
}
