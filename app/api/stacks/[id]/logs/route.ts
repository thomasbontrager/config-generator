/**
 * GET /api/stacks/[id]/logs
 *
 * Returns the activity log entries associated with the given stack,
 * ordered newest-first. Entries are those logged with metadata.stackId
 * equal to the stack's id (e.g. GENERATE_CONFIG, CLONE_STACK events).
 *
 * Requires authentication. The stack must belong to the authenticated user.
 *
 * Query parameters:
 *   limit  – max records to return (default: 50, max: 100)
 *   cursor – ISO-8601 createdAt for keyset pagination (exclusive, "before" direction)
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function resolveId(
  params: { id: string } | Promise<{ id: string }>
): Promise<string> {
  return 'then' in params ? (await params).id : params.id;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = await resolveId(params);

    const stack = await prisma.stack.findUnique({ where: { id } });
    if (!stack) {
      return NextResponse.json({ error: 'Stack not found' }, { status: 404 });
    }
    if (stack.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10) || 50, 100);
    const cursorParam = searchParams.get('cursor');
    const cursor = cursorParam ? new Date(cursorParam) : undefined;

    const logs = await prisma.activityLog.findMany({
      where: {
        userId: session.user.id,
        ...(cursor ? { createdAt: { lt: cursor } } : {}),
        metadata: {
          path: ['stackId'],
          equals: id,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        action: true,
        metadata: true,
        ipAddress: true,
        createdAt: true,
      },
    });

    const nextCursor =
      logs.length === limit ? logs[logs.length - 1]?.createdAt.toISOString() : null;

    return NextResponse.json({ logs, nextCursor });
  } catch (error) {
    console.error('Stack logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
