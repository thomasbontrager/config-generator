/**
 * GET /api/stacks/[id]/artifacts
 *
 * Returns the list of generated config artifacts (ZIP generation records)
 * for the given stack, ordered newest-first.
 *
 * Requires authentication. The stack must belong to the authenticated user
 * OR be marked public.
 *
 * Query parameters:
 *   limit  – max records to return (default: 20, max: 100)
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
    const id = await resolveId(params);

    const stack = await prisma.stack.findUnique({ where: { id } });
    if (!stack) {
      return NextResponse.json({ error: 'Stack not found' }, { status: 404 });
    }

    if (!stack.isPublic && stack.userId !== session?.user?.id) {
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10) || 20, 100);
    const cursorParam = searchParams.get('cursor');
    const cursor = cursorParam ? new Date(cursorParam) : undefined;

    const artifacts = await prisma.generatedConfig.findMany({
      where: {
        stackId: id,
        ...(cursor ? { createdAt: { lt: cursor } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        name: true,
        configType: true,
        downloadUrl: true,
        createdAt: true,
      },
    });

    const nextCursor =
      artifacts.length === limit
        ? artifacts[artifacts.length - 1]?.createdAt.toISOString()
        : null;

    return NextResponse.json({ artifacts, nextCursor });
  } catch (error) {
    console.error('Stack artifacts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
