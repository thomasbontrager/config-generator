/**
 * POST /api/admin/flags
 *
 * Creates or updates a feature flag for an organization. Requires ADMIN role.
 *
 * Body:
 *   {
 *     organizationId: string   — target organization ID
 *     key:            string   — flag key (snake_case recommended)
 *     enabled:        boolean  — desired state
 *   }
 *
 * Returns the upserted flag record.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, AdminGuardError } from '@/server/lib/admin-guard';
import { setFeatureFlag } from '@/server/services/admin.service';
import { logActivity } from '@/server/repositories/activity.repository';

const bodySchema = z.object({
  organizationId: z.string().min(1, 'organizationId is required'),
  key: z
    .string()
    .min(1, 'key is required')
    .max(100, 'key must be 100 characters or fewer')
    .regex(/^[a-z0-9_]+$/, 'key must contain only lowercase letters, digits, and underscores'),
  enabled: z.boolean(),
});

export async function POST(request: Request) {
  let adminId: string;
  try {
    const guard = await requireAdmin();
    adminId = guard.userId;
  } catch (err) {
    if (err instanceof AdminGuardError) return err.response;
    throw err;
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  try {
    const flag = await setFeatureFlag(parsed.data);
    await logActivity({
      userId: adminId,
      action: 'ADMIN_SET_FEATURE_FLAG',
      metadata: {
        organizationId: parsed.data.organizationId,
        key: parsed.data.key,
        enabled: parsed.data.enabled,
      },
    });
    return NextResponse.json({ flag });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    const isClientError = msg.includes('Foreign key constraint') || msg.includes('not found');
    return NextResponse.json({ error: msg }, { status: isClientError ? 400 : 500 });
  }
}
