import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { VALID_CONFIG_TYPES, buildZip, configTypesLabel } from '@/lib/generator';

// ─── Input schema ─────────────────────────────────────────────────────────────

const requestSchema = z.object({
  configTypes: z
    .array(z.enum(VALID_CONFIG_TYPES as [string, ...string[]]))
    .min(1, 'Select at least one config type')
    .max(VALID_CONFIG_TYPES.length),
});

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let configTypes: string[];

    try {
      const body = await request.json();
      const parsed = requestSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0]?.message ?? 'Invalid request' },
          { status: 400 }
        );
      }
      configTypes = parsed.data.configTypes;
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
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

    // Build ZIP
    const zipBuffer = await buildZip(configTypes);

    // Persist record for history
    const configName = configTypesLabel(configTypes);

    await prisma.generatedConfig.create({
      data: {
        userId: session.user.id,
        name: configName,
        configType: configTypes.join(', '),
        content: { configTypes },
      },
    });

    return new NextResponse(new Blob([zipBuffer.buffer as ArrayBuffer], { type: 'application/zip' }), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="shipforge-${configTypes.join('-')}-${Date.now()}.zip"`,
      },
    });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
