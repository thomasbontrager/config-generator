import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { buildZipFromConfig } from '@/lib/generator';
import { stackConfigSchema } from '@/types/stack-config';

// ─── Route handler ────────────────────────────────────────────────────────────

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

    const parsed = stackConfigSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid request' },
        { status: 400 }
      );
    }

    const config = parsed.data;

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

    // Build ZIP from normalized config
    const zipBuffer = await buildZipFromConfig(config);

    // Persist record for history
    await prisma.generatedConfig.create({
      data: {
        userId: session.user.id,
        name: config.projectName,
        configType: [
          config.frontend,
          config.backend !== 'none' ? config.backend : null,
          config.database !== 'none' ? config.database : null,
        ]
          .filter(Boolean)
          .join(', '),
        content: config,
      },
    });

    return new NextResponse(new Blob([zipBuffer.buffer as ArrayBuffer], { type: 'application/zip' }), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${config.slug}-${Date.now()}.zip"`,
      },
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
