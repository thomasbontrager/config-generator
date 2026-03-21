import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createCheckoutSession } from '@/server/services/billing.service';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const appUrl = process.env.NEXTAUTH_URL;
    if (!appUrl) return NextResponse.json({ error: 'NEXTAUTH_URL not configured' }, { status: 500 });

    const result = await createCheckoutSession(session.user.id, appUrl);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
