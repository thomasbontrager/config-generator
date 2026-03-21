/**
 * POST /api/integrations/github/disconnect
 *
 * Revokes the authenticated user's GitHub integration (soft-delete).
 * The access token is cleared and revokedAt is set; the record is
 * retained for audit trail purposes.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { disconnectGitHub } from '@/server/services/integrations.service';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await disconnectGitHub(session.user.id);

    return NextResponse.json({ message: 'GitHub integration disconnected.' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    const isNotFound = msg.includes('No active GitHub integration');
    return NextResponse.json({ error: msg }, { status: isNotFound ? 404 : 500 });
  }
}
