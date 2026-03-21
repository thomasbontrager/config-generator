import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const schema = z.object({
  token: z.string().min(1),
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

export async function POST(request: Request) {
  let parsed: z.infer<typeof schema>;

  try {
    const body = await request.json();
    const result = schema.safeParse(body);
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

  const identifier = `reset:${parsed.email.toLowerCase()}`;

  const tokenRecord = await prisma.verificationToken.findUnique({
    where: { token: parsed.token },
  });

  if (!tokenRecord || tokenRecord.identifier !== identifier) {
    return NextResponse.json(
      { error: 'Invalid or expired reset link. Please request a new one.' },
      { status: 400 }
    );
  }

  if (tokenRecord.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token: parsed.token } });
    return NextResponse.json(
      { error: 'This reset link has expired. Please request a new one.' },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.email.toLowerCase() },
  });

  if (!user) {
    return NextResponse.json({ error: 'Account not found.' }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(parsed.password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    }),
    prisma.verificationToken.delete({ where: { token: parsed.token } }),
  ]);

  return NextResponse.json({ message: 'Password updated successfully.' });
}
