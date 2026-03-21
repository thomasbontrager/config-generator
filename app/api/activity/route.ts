import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const querySchema = z.object({
  limit: z
    .string()
    .optional()
    .transform((v) => Math.min(parseInt(v ?? '50', 10) || 50, 100)),
  cursor: z.string().optional(),
});

/**
 * GET /api/activity
 * Returns paginated activity logs for the authenticated user.
 *
 * Query params:
 *   - limit (1–100, default 50)
 *   - cursor  (createdAt ISO string for cursor-based pagination)
 */
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    limit: searchParams.get('limit') ?? undefined,
    cursor: searchParams.get('cursor') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
  }

  const { limit, cursor } = parsed.data;

  const logs = await prisma.activityLog.findMany({
    where: {
      userId: session.user.id,
      ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1, // fetch one extra to detect if there's a next page
    select: {
      id: true,
      action: true,
      metadata: true,
      ipAddress: true,
      createdAt: true,
    },
  });

  const hasMore = logs.length > limit;
  const items = hasMore ? logs.slice(0, limit) : logs;
  const nextCursor = hasMore ? items[items.length - 1]?.createdAt.toISOString() : null;

  return NextResponse.json({ logs: items, hasMore, nextCursor });
}
