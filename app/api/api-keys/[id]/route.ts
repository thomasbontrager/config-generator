import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function resolveId(
  params: { id: string } | Promise<{ id: string }>
): Promise<string> {
  return 'then' in params ? (await params).id : params.id;
}

/**
 * DELETE /api/api-keys/[id]
 * Revokes (soft-deletes) an API key owned by the authenticated user.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = await resolveId(params);

  const key = await prisma.apiKey.findUnique({
    where: { id },
    select: { userId: true, revokedAt: true },
  });

  if (!key) {
    return NextResponse.json({ error: 'API key not found' }, { status: 404 });
  }

  if (key.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (key.revokedAt) {
    return NextResponse.json({ error: 'API key is already revoked' }, { status: 409 });
  }

  await prisma.apiKey.update({
    where: { id },
    data: { revokedAt: new Date() },
  });

  return NextResponse.json({ message: 'API key revoked.' });
}
