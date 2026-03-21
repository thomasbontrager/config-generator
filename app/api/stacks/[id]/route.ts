import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const VALID_CONFIG_TYPES = [
  'vite-react',
  'vue3',
  'next',
  'express',
  'django',
  'docker',
  'k8s',
  'github-actions',
] as const;

const updateStackSchema = z.object({
  name: z.string().min(1).max(80).trim().optional(),
  description: z.string().max(500).trim().optional().nullable(),
  configTypes: z.array(z.enum(VALID_CONFIG_TYPES)).min(1).max(8).optional(),
  isPublic: z.boolean().optional(),
});

/** Resolve stack params safely across Next.js 14/15 versions. */
async function resolveId(
  params: { id: string } | Promise<{ id: string }>
): Promise<string> {
  return 'then' in params ? (await params).id : params.id;
}

/**
 * GET /api/stacks/[id]
 * Returns a single stack. The stack must belong to the authenticated user
 * OR be marked public.
 */
export async function GET(
  _request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const id = await resolveId(params);

  const stack = await prisma.stack.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      name: true,
      description: true,
      configTypes: true,
      isPublic: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { generatedConfigs: true } },
    },
  });

  if (!stack) {
    return NextResponse.json({ error: 'Stack not found' }, { status: 404 });
  }

  if (!stack.isPublic && stack.userId !== session?.user?.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({ stack });
}

/**
 * PATCH /api/stacks/[id]
 * Updates a stack owned by the authenticated user.
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = await resolveId(params);

  const existing = await prisma.stack.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: 'Stack not found' }, { status: 404 });
  }

  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const parsed = updateStackSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  const stack = await prisma.stack.update({
    where: { id },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
      ...(parsed.data.configTypes !== undefined && { configTypes: parsed.data.configTypes }),
      ...(parsed.data.isPublic !== undefined && { isPublic: parsed.data.isPublic }),
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

  return NextResponse.json({ stack });
}

/**
 * DELETE /api/stacks/[id]
 * Deletes a stack owned by the authenticated user.
 */
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const id = await resolveId(params);

  const existing = await prisma.stack.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: 'Stack not found' }, { status: 404 });
  }

  if (existing.userId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await prisma.stack.delete({ where: { id } });

  return NextResponse.json({ message: 'Stack deleted.' });
}
