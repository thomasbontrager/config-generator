import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/integrations
 * Returns all third-party integrations connected by the authenticated user.
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const integrations = await prisma.integration.findMany({
    where: { userId: session.user.id, revokedAt: null },
    select: {
      id: true,
      provider: true,
      externalId: true,
      scopes: true,
      metadata: true,
      connectedAt: true,
      updatedAt: true,
    },
    orderBy: { connectedAt: 'desc' },
  });

  return NextResponse.json({ integrations });
}
