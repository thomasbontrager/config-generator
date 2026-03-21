/**
 * lib/adapters/billing.adapter.ts
 *
 * Concrete Stripe implementation of BillingProviderAdapter.
 * Bridges the organization-scoped adapter interface to the existing
 * user-scoped billing service functions.
 *
 * Organization → user resolution:
 *   Each org has one OWNER member.  The adapter resolves that member's userId
 *   and delegates to createCheckoutSession / createPortalSession /
 *   handleStripeWebhook in server/services/billing.service.
 */

import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { PLANS } from '@/lib/billing';
import { handleStripeWebhook } from '@/server/services/billing.service';
import type { BillingProviderAdapter } from './billing.provider';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the userId of the OWNER member of the given organization.
 * Throws a user-friendly error when the organization cannot be found or has
 * no owner.
 */
async function resolveOrgOwnerUserId(organizationId: string): Promise<string> {
  const ownerMember = await prisma.organizationMember.findFirst({
    where: { organizationId, role: 'OWNER' },
    select: { userId: true },
  });
  if (!ownerMember) {
    throw new Error(`Organization ${organizationId} not found or has no owner`);
  }
  return ownerMember.userId;
}

// ─── Adapter ──────────────────────────────────────────────────────────────────

export class StripeBillingAdapter implements BillingProviderAdapter {
  // ── createCheckoutSession ─────────────────────────────────────────────────

  async createCheckoutSession(input: {
    organizationId: string;
    planKey: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string }> {
    const userId = await resolveOrgOwnerUserId(input.organizationId);

    // Validate planKey against the known plan registry
    const planKey = input.planKey.toUpperCase() as keyof typeof PLANS;
    if (!PLANS[planKey]) {
      throw new Error(`Unknown plan key: ${input.planKey}`);
    }

    const priceId = PLANS[planKey].stripePriceId;
    if (!priceId) throw new Error(`Stripe price ID not configured for plan ${input.planKey}`);

    // Use the Stripe client directly to honour the caller-supplied URLs
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    let customerId = user.subscriptionId ?? undefined;
    if (!customerId || !customerId.startsWith('cus_')) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name ?? undefined,
        metadata: { userId },
      });
      customerId = customer.id;
      await prisma.user.update({ where: { id: userId }, data: { subscriptionId: customerId } });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      subscription_data: { trial_period_days: 14, metadata: { userId, organizationId: input.organizationId } },
      allow_promotion_codes: true,
    });

    if (!session.url) throw new Error('Stripe did not return a checkout URL');
    return { url: session.url };
  }

  // ── createCustomerPortalSession ───────────────────────────────────────────

  async createCustomerPortalSession(input: {
    organizationId: string;
    returnUrl: string;
  }): Promise<{ url: string }> {
    const userId = await resolveOrgOwnerUserId(input.organizationId);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.subscriptionId?.startsWith('cus_')) {
      throw new Error('No Stripe customer found for this organization');
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.subscriptionId,
      return_url: input.returnUrl,
    });

    return { url: session.url };
  }

  // ── handleWebhook ─────────────────────────────────────────────────────────

  async handleWebhook(input: { signature: string; rawBody: string }): Promise<void> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is not configured');

    const event = stripe.webhooks.constructEvent(
      input.rawBody,
      input.signature,
      webhookSecret
    );

    await handleStripeWebhook(event);
  }
}
