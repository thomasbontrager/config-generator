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
