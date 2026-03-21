import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import Stripe from 'stripe';

const deleteAccountSchema = z.object({
  /**
   * Credentials-auth users must confirm their current password.
   * OAuth-only users (no password) must pass confirmPhrase = "DELETE MY ACCOUNT".
   */
  confirmPassword: z.string().optional(),
  confirmPhrase: z.string().optional(),
});

/**
 * DELETE /api/user/account
 *
 * Permanently deletes the authenticated user's account and all associated data.
 * Cancels any active Stripe subscription before deletion.
 *
 * Security requirements:
 *   - Credentials users: must supply current password in `confirmPassword`
 *   - OAuth-only users:  must supply `confirmPhrase = "DELETE MY ACCOUNT"`
 *
 * Prisma cascade rules (User → Account, Session, Subscription,
 * GeneratedConfig, Payment) handle the child-record cleanup.
 */
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: z.infer<typeof deleteAccountSchema>;

  try {
    const raw = await request.json();
    const result = deleteAccountSchema.safeParse(raw);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    body = result.data;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      password: true,
      subscriptionId: true,
      subscriptions: {
        where: { status: 'ACTIVE' },
        select: { stripeSubscriptionId: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // ── Verify identity ─────────────────────────────────────────────────────────

  if (user.password) {
    // Credentials account — require current password
    if (!body.confirmPassword) {
      return NextResponse.json(
        { error: 'Please enter your current password to confirm account deletion.' },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(body.confirmPassword, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Password is incorrect. Account deletion cancelled.' },
        { status: 400 }
      );
    }
  } else {
    // OAuth-only account — require explicit phrase
    if (body.confirmPhrase !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        { error: 'Please type "DELETE MY ACCOUNT" to confirm.' },
        { status: 400 }
      );
    }
  }

  // ── Cancel active Stripe subscriptions ──────────────────────────────────────
  // Import once outside the loop. Best-effort: log errors but don't block deletion.
  let stripeClient: Stripe | null = null;
  try {
    const stripeModule = await import('@/lib/stripe');
    stripeClient = stripeModule.stripe;
  } catch (err) {
    console.error('Could not load Stripe client for subscription cancellation:', err);
  }

  for (const sub of user.subscriptions) {
    try {
      if (stripeClient) {
        await stripeClient.subscriptions.cancel(sub.stripeSubscriptionId);
      }
    } catch (err) {
      console.error(
        `Failed to cancel Stripe subscription ${sub.stripeSubscriptionId}:`,
        err
      );
    }
  }

  // ── Delete the user (Prisma cascade handles related records) ────────────────

  await prisma.user.delete({ where: { id: user.id } });

  return NextResponse.json({ message: 'Account deleted.' });
}
