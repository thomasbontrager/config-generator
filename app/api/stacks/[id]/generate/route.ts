/**
 * POST /api/stacks/[id]/generate
 *
 * Generates a ZIP archive containing all config files for the stack's
 * configured template types, then saves a GeneratedConfig record linked
 * to the stack.
 *
 * Requires authentication. The user must own the stack.
 * Respects the TRIAL generation limit.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildZip, configTypesLabel } from '@/lib/generator';
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

    const stack = await prisma.stack.findUnique({ where: { id } });
    if (!stack) {
      return NextResponse.json({ error: 'Stack not found' }, { status: 404 });
    }
    if (stack.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Enforce trial generation limit
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscriptionStatus: true,
        _count: { select: { generatedConfigs: true } },
      },
    });

    if (user?.subscriptionStatus === 'TRIAL' && (user._count.generatedConfigs ?? 0) >= 10) {
      return NextResponse.json(
        { error: 'Trial limit reached. Please upgrade to Pro.' },
        { status: 403 }
      );
    }

    const configTypes = stack.configTypes;
    const zipBuffer = await buildZip(configTypes);
    const configName = configTypesLabel(configTypes);

    // Persist generation record linked to this stack
    await prisma.generatedConfig.create({
      data: {
        userId: session.user.id,
        stackId: stack.id,
        name: configName,
        configType: configTypes.join(', '),
        content: { configTypes },
      },
    });

    await logActivity({
      userId: session.user.id,
      action: 'GENERATE_CONFIG',
      metadata: { stackId: stack.id, configTypes },
    });

    return new NextResponse(
      new Blob([zipBuffer.buffer as ArrayBuffer], { type: 'application/zip' }),
      {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="shipforge-${stack.id}-${Date.now()}.zip"`,
        },
      }
    );
  } catch (error) {
    console.error('Stack generate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
