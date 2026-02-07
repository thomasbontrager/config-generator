import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

export const STRIPE_PLANS = {
  PRO: {
    name: 'Pro',
    price: 29,
    priceId: process.env.STRIPE_PRICE_ID_PRO || '',
    features: [
      'Unlimited config generations',
      'All templates',
      'Priority support',
      'Download history',
    ],
  },
};
