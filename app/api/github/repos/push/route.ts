/**
 * POST /api/github/repos/push
 *
 * Pushes one or more files into a GitHub repository using the authenticated
 * user's stored GitHub access token.
 *
 * For repositories that already have commits, a proper Git tree + commit is
 * created via the Git Data API so history is preserved.
 * For brand-new (empty) repositories, each file is PUT via the Contents API.
 *
 * Body:
 *   {
 *     owner:    string               — GitHub username or org that owns the repo
 *     repo:     string               — repository name
 *     branch?:  string               — target branch (default: "main")
 *     message?: string               — commit message
 *     files:    { path: string, content: string }[]  — UTF-8 file content
 *   }
 *
 * Requires an active GitHub integration (POST /api/integrations/github/connect first).
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { pushFilesToRepo } from '@/server/services/github.service';

const fileSchema = z.object({
  path: z
    .string()
    .min(1, 'File path is required')
    .refine((p) => !p.startsWith('/'), 'File path must be relative (no leading slash)'),
  content: z.string(),
});

const bodySchema = z.object({
  owner: z.string().min(1, 'owner is required'),
  repo: z.string().min(1, 'repo is required'),
  branch: z.string().min(1).optional(),
  message: z.string().min(1).max(72).optional(),
  files: z
    .array(fileSchema)
    .min(1, 'At least one file is required')
    .max(100, 'Cannot push more than 100 files at once'),
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

    const result = await pushFilesToRepo(session.user.id, parsed.data);

    return NextResponse.json({ commit: result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal server error';
    const isClientError =
      msg.includes('No active GitHub integration') ||
      msg.includes('Not Found') ||
      msg.includes('Repository access blocked');
    return NextResponse.json({ error: msg }, { status: isClientError ? 400 : 500 });
  }
}
