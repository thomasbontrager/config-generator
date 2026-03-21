/**
 * POST /api/stacks/[id]/clone
 *
 * Clones an existing stack into a new stack owned by the authenticated user.
 * The source stack must either belong to the user or be marked public.
 *
 * The cloned stack receives:
 *   - name: "Copy of {original name}"
 *   - description: copied from original
 *   - configTypes: copied from original
 *   - isPublic: false (always private on creation)
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logActivity } from '@/server/repositories/activity.repository';

async function resolveId(
  params: { id: string } | Promise<{ id: string }>
): Promise<string> {
  return 'then' in params ? (await params).id : params.id;
}

export async function POST(
  _request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = await resolveId(params);

    const source = await prisma.stack.findUnique({ where: { id } });
    if (!source) {
      return NextResponse.json({ error: 'Stack not found' }, { status: 404 });
    }

    // Allow cloning own stacks and public stacks
    if (!source.isPublic && source.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const cloned = await prisma.stack.create({
      data: {
        userId: session.user.id,
        name: `Copy of ${source.name}`,
        description: source.description,
        configTypes: source.configTypes,
        isPublic: false,
      },
      select: {
        id: true,
        name: true,
        description: true,
        configTypes: true,
        isPublic: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await logActivity({
      userId: session.user.id,
      action: 'CLONE_STACK',
      metadata: { sourceStackId: source.id, newStackId: cloned.id },
    });

    return NextResponse.json({ stack: cloned }, { status: 201 });
  } catch (error) {
    console.error('Stack clone error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
