/**
 * POST /api/billing/portal
 *
 * Creates a Stripe Billing Portal session and returns the URL that the
 * client should redirect to, allowing the user to manage their subscription,
 * update payment methods, and download invoices.
 *
 * Requires an authenticated session with an existing Stripe customer.
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createPortalSession } from '@/server/services/billing.service';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const appUrl = process.env.NEXTAUTH_URL;
    if (!appUrl) {
      return NextResponse.json({ error: 'NEXTAUTH_URL not configured' }, { status: 500 });
    }

    const result = await createPortalSession(session.user.id, appUrl);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Billing portal error:', error);
    return NextResponse.json({ error: 'Failed to create portal session' }, { status: 500 });
  }
}
