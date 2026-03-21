/**
 * lib/adapters/billing.provider.ts
 *
 * Clean adapter interface for billing operations.
 * All methods are scoped to an organizationId so callers never need to
 * manage userId / Stripe customer-ID lookup directly.
 */

export interface BillingProviderAdapter {
  /**
   * Create a Stripe Checkout session for the given plan.
   * Returns the hosted Checkout URL that the client should redirect to.
   */
  createCheckoutSession(input: {
    organizationId: string;
    planKey: string;
    successUrl: string;
    cancelUrl: string;
  }): Promise<{ url: string }>;

  /**
   * Create a Stripe Billing Portal session.
   * Returns the hosted portal URL that the client should redirect to.
   */
  createCustomerPortalSession(input: {
    organizationId: string;
    returnUrl: string;
  }): Promise<{ url: string }>;

  /**
   * Verify a Stripe webhook signature and process the event.
   * `rawBody` must be the raw (un-parsed) request body string.
   */
  handleWebhook(input: { signature: string; rawBody: string }): Promise<void>;
}
