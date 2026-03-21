/**
 * GET /api/admin/health
 *
 * Extended health check for admin / ops use.  Includes database latency,
 * pending / failed background job counts, and unprocessed webhook counts.
 * Requires ADMIN role (unlike the public GET /api/health which is open).
 *
 * Returns 200 when all checks pass, 503 when the database is unavailable.
 */
import { NextResponse } from 'next/server';
import { requireAdmin, AdminGuardError } from '@/server/lib/admin-guard';
import { getAdminHealth } from '@/server/services/admin.service';

export async function GET() {
  try {
    await requireAdmin();
  } catch (err) {
    if (err instanceof AdminGuardError) return err.response;
    throw err;
  }

  try {
    const health = await getAdminHealth();
    const httpStatus = health.status === 'ok' ? 200 : 503;
    return NextResponse.json(health, { status: httpStatus });
  } catch (error) {
    console.error('Admin health error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
