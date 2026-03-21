/**
 * POST /api/github/repos/create
 *
 * Creates a new GitHub repository under the authenticated user's account,
 * using the stored GitHub access token from their integration.
 *
 * Body:
 *   {
 *     name:        string   — repository name (letters, numbers, hyphens, underscores, dots)
 *     description?: string  — short description
 *     private?:     boolean — default false (public)
 *     autoInit?:    boolean — initialise with an empty README; default false
 *   }
 *
 * Requires an active GitHub integration (POST /api/integrations/github/connect first).
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { createRepo } from '@/server/services/github.service';

const bodySchema = z.object({
  name: z
    .string()
    .min(1, 'Repository name is required')
    .max(100, 'Repository name must be 100 characters or fewer')
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      'Repository name may only contain letters, numbers, hyphens, underscores, and dots'
    ),
  description: z.string().max(350).optional(),
  private: z.boolean().optional().default(false),
  autoInit: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const repo = await createRepo(session.user.id, parsed.data);

    return NextResponse.json({ repo }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    const isClientError =
      msg.includes('No active GitHub integration') ||
      msg.includes('already exists') ||
      msg.includes('name already exists');
    return NextResponse.json({ error: msg }, { status: isClientError ? 400 : 500 });
  }
}
