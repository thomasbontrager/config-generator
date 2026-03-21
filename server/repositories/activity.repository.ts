/**
 * server/repositories/activity.repository.ts
 * Append-only activity log repository.
 */
import { prisma } from '@/lib/prisma';
import type { ActivityLog } from '@prisma/client';

export async function logActivity(input: {
  userId: string; action: string; metadata?: Record<string, unknown>;
  ipAddress?: string; userAgent?: string;
}): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        // Cast to satisfy Prisma's Json type
        metadata: input.metadata ? (input.metadata as object) : undefined,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  } catch {
    // Activity logging must never break the main request path
  }
}

export async function listActivity(opts: {
  userId: string; limit?: number; cursor?: Date;
}): Promise<ActivityLog[]> {
  return prisma.activityLog.findMany({
    where: { userId: opts.userId, ...(opts.cursor ? { createdAt: { lt: opts.cursor } } : {}) },
    orderBy: { createdAt: 'desc' },
    take: Math.min(opts.limit ?? 50, 100),
  });
}
