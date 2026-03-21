import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/health
 *
 * Lightweight liveness + readiness probe used by load balancers,
 * uptime monitors, and CI/CD pipelines.
 *
 * Returns 200 when the app server is up and Postgres is reachable.
 * Returns 503 when the database is unavailable.
 */
export async function GET() {
  const startedAt = Date.now();

  let dbOk = false;
  let dbLatencyMs: number | null = null;

  try {
    const t0 = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - t0;
    dbOk = true;
  } catch {
    // DB unreachable — return 503
  }

  const status = dbOk ? 'ok' : 'degraded';
  const httpStatus = dbOk ? 200 : 503;

  return NextResponse.json(
    {
      status,
      version: process.env.npm_package_version ?? 'unknown',
      environment: process.env.NODE_ENV ?? 'unknown',
      uptime: process.uptime(),
      responseTimeMs: Date.now() - startedAt,
      checks: {
        database: {
          status: dbOk ? 'ok' : 'error',
          latencyMs: dbLatencyMs,
        },
      },
      timestamp: new Date().toISOString(),
    },
    { status: httpStatus }
  );
}
