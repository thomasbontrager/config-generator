/**
 * server/services/billing.service.ts
 * Billing domain service — Stripe checkout, portal, webhook processing.
 * Architecture: route → this service → lib/billing + repositories
 */
import { stripe } from '@/lib/stripe';
import { PLANS } from '@/lib/billing';
import { findUserById, updateUser } from '@/server/repositories/user.repository';
import { upsertSubscription, upsertPayment } from '@/server/repositories/subscription.repository';
import { logActivity } from '@/server/repositories/activity.repository';
import { prisma } from '@/lib/prisma';
import type Stripe from 'stripe';

export async function createCheckoutSession(userId: string, appUrl: string) {
  const user = await findUserById(userId);
  if (!user) throw new Error('User not found');
  const priceId = PLANS.PRO.stripePriceId;
  if (!priceId) throw new Error('Stripe price ID not configured');

  let customerId = user.subscriptionId ?? undefined;
  if (!customerId || !customerId.startsWith('cus_')) {
    const customer = await stripe.customers.create({ email: user.email, name: user.name ?? undefined, metadata: { userId } });
    customerId = customer.id;
    await updateUser(userId, { subscriptionId: customerId });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId, mode: 'subscription', payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/billing?success=1`,
    cancel_url: `${appUrl}/dashboard/billing?canceled=1`,
    subscription_data: { trial_period_days: 14, metadata: { userId } },
    allow_promotion_codes: true,
  });
  if (!session.url) throw new Error('Stripe did not return a checkout URL');
  return { url: session.url };
}

export async function createPortalSession(userId: string, appUrl: string) {
  const user = await findUserById(userId);
  if (!user?.subscriptionId?.startsWith('cus_')) throw new Error('No Stripe customer found');
  const session = await stripe.billingPortal.sessions.create({ customer: user.subscriptionId, return_url: `${appUrl}/dashboard/billing` });
  return { url: session.url };
}

export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription & { current_period_start: number; current_period_end: number };
      const user = await prisma.user.findFirst({ where: { subscriptionId: sub.customer as string } });
      if (user) {
        const status = sub.status === 'active' ? 'ACTIVE' : 'TRIAL';
        await updateUser(user.id, { subscriptionStatus: status, renewalDate: new Date(sub.current_period_end * 1000) });
        await upsertSubscription({ stripeSubscriptionId: sub.id, userId: user.id, status, planId: 'pro', currentPeriodStart: new Date(sub.current_period_start * 1000), currentPeriodEnd: new Date(sub.current_period_end * 1000) });
        await logActivity({ userId: user.id, action: event.type === 'customer.subscription.created' ? 'SUBSCRIPTION_CREATED' : 'SUBSCRIPTION_UPDATED', metadata: { status } });
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.user.updateMany({ where: { subscriptionId: sub.customer as string }, data: { subscriptionStatus: 'CANCELED' } });
      break;
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      const user = await prisma.user.findFirst({ where: { subscriptionId: invoice.customer as string } });
      if (user) await upsertPayment({ userId: user.id, stripePaymentId: invoice.id, amount: invoice.amount_paid });
      break;
    }
    default:
      if (process.env.NODE_ENV === 'development') console.debug('[billing] unhandled event:', event.type);
  }
}
