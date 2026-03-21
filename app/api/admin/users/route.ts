/**
 * GET /api/admin/users
 *
 * Returns a paginated list of all users. Requires ADMIN role.
 *
 * Query params:
 *   page     — page number (default 1)
 *   pageSize — items per page (1–100, default 20)
 *   search   — partial email / name match (optional)
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin, AdminGuardError } from '@/server/lib/admin-guard';
import { listUsersPaginated } from '@/server/services/admin.service';

const querySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => Math.max(1, parseInt(v ?? '1', 10) || 1)),
  pageSize: z
    .string()
    .optional()
    .transform((v) => Math.min(100, Math.max(1, parseInt(v ?? '20', 10) || 20))),
  search: z.string().optional(),
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
    search: searchParams.get('search') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
  }

  try {
    const result = await listUsersPaginated(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
