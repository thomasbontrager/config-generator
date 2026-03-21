import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error(
    'Missing required environment variable: STRIPE_SECRET_KEY\n' +
      'Set this to your Stripe secret key (sk_live_... or sk_test_...) in .env.local'
  );
}

export const stripe = new Stripe(stripeSecretKey, {
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
