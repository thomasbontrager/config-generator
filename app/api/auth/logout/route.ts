/**
 * POST /api/auth/logout
 *
 * Records the logout event in the activity log for the current session user.
 *
 * ⚠️  This endpoint does NOT invalidate the NextAuth JWT or clear the
 * session cookie on its own.  Browser clients MUST also call NextAuth's
 * `signOut()` (which hits POST /api/auth/signout) to fully clear the
 * cookie and JWT.  This route exists to:
 *   - Provide a stable REST-style logout surface (e.g. for mobile / API clients).
 *   - Persist a LOGOUT event in the activity log for audit purposes.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logActivity } from '@/server/repositories/activity.repository';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (session?.user?.id) {
      await logActivity({
        userId: session.user.id,
        action: 'LOGOUT',
      });
    }

    return NextResponse.json({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
