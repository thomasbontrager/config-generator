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

const createStackSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80, 'Name is too long').trim(),
  description: z.string().max(500, 'Description is too long').trim().optional(),
  configTypes: z
    .array(z.enum(VALID_CONFIG_TYPES))
    .min(1, 'Select at least one config type')
    .max(8, 'Too many config types selected'),
  isPublic: z.boolean().optional().default(false),
});

/**
 * GET /api/stacks
 * Returns all stacks owned by the authenticated user.
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stacks = await prisma.stack.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      description: true,
      configTypes: true,
      isPublic: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { generatedConfigs: true } },
    },
  });

  return NextResponse.json({ stacks });
}

/**
 * POST /api/stacks
 * Creates a new stack for the authenticated user.
 */
export async function POST(request: Request) {
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

  const parsed = createStackSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 }
    );
  }

  const stack = await prisma.stack.create({
    data: {
      userId: session.user.id,
      name: parsed.data.name,
      description: parsed.data.description,
      configTypes: parsed.data.configTypes,
      isPublic: parsed.data.isPublic,
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

  return NextResponse.json({ stack }, { status: 201 });
}
