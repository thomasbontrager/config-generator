/**
 * server/services/admin.service.ts
 * Admin domain service — user management, platform metrics, audit visibility.
 * All callers must verify ADMIN role before invoking these functions.
 */
import { listUsers, countUsers, updateUser, findUserById } from '@/server/repositories/user.repository';
import { logActivity } from '@/server/repositories/activity.repository';
import { prisma } from '@/lib/prisma';

export async function adminListUsers(opts?: { skip?: number; take?: number }) { return listUsers(opts); }
export async function adminGetUserCount() { return countUsers(); }

export async function adminUpdateSubscription(input: { userId: string; subscriptionStatus: string; adminId: string }) {
  const user = await findUserById(input.userId);
  if (!user) throw new Error('User not found');
  await updateUser(input.userId, { subscriptionStatus: input.subscriptionStatus as never });
  await logActivity({ userId: input.adminId, action: 'ADMIN_UPDATE_SUBSCRIPTION', metadata: { targetUserId: input.userId, newStatus: input.subscriptionStatus } });
}

export async function getPlatformMetrics() {
  const [totalUsers, activeSubscriptions, trialUsers, totalGenerations] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { subscriptionStatus: 'ACTIVE' } }),
    prisma.user.count({ where: { subscriptionStatus: 'TRIAL' } }),
    prisma.generatedConfig.count(),
  ]);
  return { totalUsers, activeSubscriptions, trialUsers, totalGenerations };
}

// ─── Pagination helpers ────────────────────────────────────────────────────────

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function paginateArgs(page: number, pageSize: number): { skip: number; take: number } {
  return { skip: (page - 1) * pageSize, take: pageSize };
}

// ─── Paginated users ──────────────────────────────────────────────────────────

export async function listUsersPaginated(opts: {
  page: number;
  pageSize: number;
  search?: string;
}): Promise<PaginatedResult<object>> {
  const where = opts.search
    ? {
        OR: [
          { email: { contains: opts.search, mode: 'insensitive' as const } },
          { name: { contains: opts.search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      ...paginateArgs(opts.page, opts.pageSize),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionStatus: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total, page: opts.page, pageSize: opts.pageSize, totalPages: Math.ceil(total / opts.pageSize) };
}

// ─── Organizations ────────────────────────────────────────────────────────────

export async function listOrganizations(opts: {
  page: number;
  pageSize: number;
  search?: string;
}): Promise<PaginatedResult<object>> {
  const where = opts.search
    ? { name: { contains: opts.search, mode: 'insensitive' as const } }
    : {};

  const [items, total] = await Promise.all([
    prisma.organization.findMany({
      where,
      ...paginateArgs(opts.page, opts.pageSize),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { members: true, featureFlags: true } },
      },
    }),
    prisma.organization.count({ where }),
  ]);

  return { items, total, page: opts.page, pageSize: opts.pageSize, totalPages: Math.ceil(total / opts.pageSize) };
}

// ─── Background jobs ──────────────────────────────────────────────────────────

export async function listJobs(opts: {
  page: number;
  pageSize: number;
  status?: string;
  type?: string;
}): Promise<PaginatedResult<object>> {
  const where: Record<string, unknown> = {};
  if (opts.status) where.status = opts.status;
  if (opts.type) where.type = opts.type;

  const [items, total] = await Promise.all([
    prisma.backgroundJob.findMany({
      where,
      ...paginateArgs(opts.page, opts.pageSize),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        status: true,
        attempts: true,
        maxAttempts: true,
        errorMessage: true,
        scheduledAt: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.backgroundJob.count({ where }),
  ]);

  return { items, total, page: opts.page, pageSize: opts.pageSize, totalPages: Math.ceil(total / opts.pageSize) };
}

// ─── Webhook events ────────────────────────────────────────────────────────────

export async function listWebhookEvents(opts: {
  page: number;
  pageSize: number;
  provider?: string;
  status?: string;
}): Promise<PaginatedResult<object>> {
  const where: Record<string, unknown> = {};
  if (opts.provider) where.provider = opts.provider;
  if (opts.status) where.status = opts.status;

  const [items, total] = await Promise.all([
    prisma.webhookEvent.findMany({
      where,
      ...paginateArgs(opts.page, opts.pageSize),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        provider: true,
        eventType: true,
        status: true,
        processedAt: true,
        createdAt: true,
      },
    }),
    prisma.webhookEvent.count({ where }),
  ]);

  return { items, total, page: opts.page, pageSize: opts.pageSize, totalPages: Math.ceil(total / opts.pageSize) };
}

// ─── Admin health ─────────────────────────────────────────────────────────────

export interface AdminHealthResult {
  status: 'ok' | 'degraded';
  version: string;
  environment: string;
  uptime: number;
  checks: {
    database: { status: 'ok' | 'error'; latencyMs: number | null };
    pendingJobs: { count: number };
    failedJobs: { count: number };
    pendingWebhooks: { count: number };
  };
  timestamp: string;
}

export async function getAdminHealth(): Promise<AdminHealthResult> {
  let dbOk = false;
  let dbLatencyMs: number | null = null;

  try {
    const t0 = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - t0;
    dbOk = true;
  } catch {
    // DB unreachable
  }

  const [pendingJobs, failedJobs, pendingWebhooks] = await Promise.all([
    prisma.backgroundJob.count({ where: { status: 'PENDING' } }).catch(() => -1),
    prisma.backgroundJob.count({ where: { status: 'FAILED' } }).catch(() => -1),
    prisma.webhookEvent.count({ where: { status: 'RECEIVED' } }).catch(() => -1),
  ]);

  return {
    status: dbOk ? 'ok' : 'degraded',
    version: process.env.npm_package_version ?? 'unknown',
    environment: process.env.NODE_ENV ?? 'unknown',
    uptime: process.uptime(),
    checks: {
      database: { status: dbOk ? 'ok' : 'error', latencyMs: dbLatencyMs },
      pendingJobs: { count: pendingJobs },
      failedJobs: { count: failedJobs },
      pendingWebhooks: { count: pendingWebhooks },
    },
    timestamp: new Date().toISOString(),
  };
}

// ─── Feature flags ────────────────────────────────────────────────────────────

export async function setFeatureFlag(input: {
  organizationId: string;
  key: string;
  enabled: boolean;
}): Promise<{ id: string; organizationId: string; key: string; enabled: boolean; updatedAt: Date }> {
  return prisma.featureFlag.upsert({
    where: { organizationId_key: { organizationId: input.organizationId, key: input.key } },
    create: {
      organizationId: input.organizationId,
      key: input.key,
      enabled: input.enabled,
    },
    update: { enabled: input.enabled },
    select: { id: true, organizationId: true, key: true, enabled: true, updatedAt: true },
  });
}
