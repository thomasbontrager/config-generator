/**
 * server/lib/admin-guard.ts
 *
 * Shared helper: resolves the current session and returns the user ID when the
 * caller is an authenticated ADMIN.  Throws an AdminGuardError on auth /
 * authorization failures so each admin route can do:
 *
 *   const { userId } = await requireAdmin();
 */
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions, isAdmin } from '@/lib/auth';

export class AdminGuardError {
  constructor(public readonly response: NextResponse) {}
}

export async function requireAdmin(): Promise<{ userId: string }> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new AdminGuardError(
      NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    );
  }

  if (!isAdmin(session.user.role)) {
    throw new AdminGuardError(
      NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    );
  }

  return { userId: session.user.id };
}
