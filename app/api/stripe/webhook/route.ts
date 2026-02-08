import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        
        // Find user by Stripe customer ID
        const user = await prisma.user.findFirst({
          where: { subscriptionId: subscription.customer as string },
        });

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: subscription.status === 'active' ? 'ACTIVE' : 'TRIAL',
              renewalDate: new Date(subscription.current_period_end * 1000),
            },
          });
          
          await prisma.subscription.upsert({
            where: { stripeSubscriptionId: subscription.id },
            create: {
              stripeSubscriptionId: subscription.id,
              userId: user.id,
              status: subscription.status === 'active' ? 'ACTIVE' : 'TRIAL',
              planId: 'pro',
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
            update: {
              status: subscription.status === 'active' ? 'ACTIVE' : 'TRIAL',
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });
        }
        break;

      case 'customer.subscription.deleted':
        const deletedSub = event.data.object;
        await prisma.user.updateMany({
          where: { subscriptionId: deletedSub.customer as string },
          data: {
            subscriptionStatus: 'CANCELED',
          },
        });
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object;
        
        // Find user by customer ID
        const paymentUser = await prisma.user.findFirst({
          where: { subscriptionId: invoice.customer as string },
        });

        if (paymentUser) {
          await prisma.payment.create({
            data: {
              userId: paymentUser.id,
              stripePaymentId: invoice.id,
              amount: invoice.amount_paid,
              status: 'SUCCEEDED',
            },
          });
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
