/**
 * server/repositories/subscription.repository.ts
 */
import { prisma } from '@/lib/prisma';
import type { Subscription, Payment } from '@prisma/client';

export async function upsertSubscription(input: {
  stripeSubscriptionId: string; userId: string; status: string; planId: string;
  currentPeriodStart: Date; currentPeriodEnd: Date;
}): Promise<Subscription> {
  return prisma.subscription.upsert({
    where: { stripeSubscriptionId: input.stripeSubscriptionId },
    create: { ...input, status: input.status as never },
    update: { status: input.status as never, currentPeriodStart: input.currentPeriodStart, currentPeriodEnd: input.currentPeriodEnd },
  });
}

export async function upsertPayment(input: {
  userId: string; stripePaymentId: string; amount: number;
}): Promise<Payment> {
  return prisma.payment.upsert({
    where: { stripePaymentId: input.stripePaymentId },
    create: { ...input, status: 'SUCCEEDED' },
    update: { amount: input.amount, status: 'SUCCEEDED' },
  });
}
