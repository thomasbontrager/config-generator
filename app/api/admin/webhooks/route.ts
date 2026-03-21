/**
 * GET /api/admin/webhooks
 *
 * Returns a paginated list of webhook events (all providers). Requires ADMIN role.
 *
 * Query params:
 *   page     — page number (default 1)
 *   pageSize — items per page (1–100, default 20)
 *   provider — filter by provider string (e.g. "GITHUB", "STRIPE")
 *   status   — filter by WebhookEventStatus (RECEIVED | PROCESSED | FAILED | IGNORED)
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, AdminGuardError } from '@/server/lib/admin-guard';
import { listWebhookEvents } from '@/server/services/admin.service';

const WEBHOOK_STATUSES = ['RECEIVED', 'PROCESSED', 'FAILED', 'IGNORED'] as const;

const querySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => Math.max(1, parseInt(v ?? '1', 10) || 1)),
  pageSize: z
    .string()
    .optional()
    .transform((v) => Math.min(100, Math.max(1, parseInt(v ?? '20', 10) || 20))),
  provider: z.string().optional(),
  status: z.enum(WEBHOOK_STATUSES).optional(),
});

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AdminGuardError) return err.response;
    throw err;
  }

  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    page: searchParams.get('page') ?? undefined,
    pageSize: searchParams.get('pageSize') ?? undefined,
    provider: searchParams.get('provider') ?? undefined,
    status: searchParams.get('status') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid query parameters' },
      { status: 400 }
    );
  }

  try {
    const result = await listWebhookEvents(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Admin webhooks error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
