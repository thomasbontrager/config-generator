import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Missing config ID' }, { status: 400 });
  }

  // Verify ownership before deleting
  const config = await prisma.generatedConfig.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!config) {
    return NextResponse.json({ error: 'Config not found' }, { status: 404 });
  }

  if (config.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.generatedConfig.delete({ where: { id } });

  return NextResponse.json({ message: 'Deleted' });
}
