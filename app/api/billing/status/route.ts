/**
 * GET /api/billing/status
 *
 * Returns the authenticated user's current billing status including their
 * subscription plan, status, trial end date, and upcoming renewal date.
 *
 * Requires an authenticated session.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PLANS, TRIAL_GENERATION_LIMIT, canGenerate } from '@/lib/billing';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        subscriptionStatus: true,
        subscriptionId: true,
        trialEndsAt: true,
        renewalDate: true,
        _count: { select: { generatedConfigs: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const generationCount = user._count.generatedConfigs;
    const isEligible = canGenerate(user.subscriptionStatus, generationCount);

    return NextResponse.json({
      status: user.subscriptionStatus,
      plan: user.subscriptionStatus === 'ACTIVE' ? PLANS.PRO : null,
      hasStripeCustomer: !!user.subscriptionId?.startsWith('cus_'),
      trialEndsAt: user.trialEndsAt,
      renewalDate: user.renewalDate,
      usage: {
        generationCount,
        generationLimit:
          user.subscriptionStatus === 'TRIAL' ? TRIAL_GENERATION_LIMIT : null,
        canGenerate: isEligible,
      },
    });
  } catch (error) {
    console.error('Billing status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
