/**
 * GET /api/github/status
 *
 * Returns the GitHub integration status for the authenticated user.
 *
 * Response:
 *   200 { connected: false }
 *   200 { connected: true, login, name?, avatarUrl?, profileUrl?, scopes[], connectedAt }
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getGitHubStatus } from '@/server/services/github.service';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const status = await getGitHubStatus(session.user.id);
    return NextResponse.json(status);
  } catch (error) {
    console.error('GitHub status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
