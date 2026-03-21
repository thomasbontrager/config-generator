/**
 * lib/billing — billing domain public surface.
 * Re-exports stripe client and plan definitions.
 */
export { stripe } from '../stripe';

export const PLANS = {
  PRO: {
    id: 'pro',
    name: 'Pro',
    priceCents: 2900,
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO || '',
    features: ['Unlimited config generations', 'All templates', 'Priority support', 'Download history'],
  },
} as const;

// Backward compat alias
export const STRIPE_PLANS = {
  PRO: {
    name: PLANS.PRO.name,
    price: PLANS.PRO.priceCents / 100,
    priceId: PLANS.PRO.stripePriceId,
    features: PLANS.PRO.features,
  },
};

export const TRIAL_GENERATION_LIMIT = 10;

export function canGenerate(status: string | undefined | null, count: number): boolean {
  if (!status) return false;
  if (status === 'ACTIVE') return true;
  if (status === 'TRIAL') return count < TRIAL_GENERATION_LIMIT;
  return false;
}
