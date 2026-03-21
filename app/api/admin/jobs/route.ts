/**
 * GET /api/admin/jobs
 *
 * Returns a paginated list of background jobs. Requires ADMIN role.
 *
 * Query params:
 *   page     — page number (default 1)
 *   pageSize — items per page (1–100, default 20)
 *   status   — filter by JobStatus (PENDING | RUNNING | COMPLETED | FAILED | CANCELLED)
 *   type     — filter by job type string
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, AdminGuardError } from '@/server/lib/admin-guard';
import { listJobs } from '@/server/services/admin.service';

const JOB_STATUSES = ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED'] as const;

const querySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => Math.max(1, parseInt(v ?? '1', 10) || 1)),
  pageSize: z
    .string()
    .optional()
    .transform((v) => Math.min(100, Math.max(1, parseInt(v ?? '20', 10) || 20))),
  status: z.enum(JOB_STATUSES).optional(),
  type: z.string().optional(),
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
    status: searchParams.get('status') ?? undefined,
    type: searchParams.get('type') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid query parameters' },
      { status: 400 }
    );
  }

  try {
    const result = await listJobs(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Admin jobs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
