import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { BillingActions } from './components/BillingActions';

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscriptions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  const subscription = user?.subscriptions[0];
  const subscriptionStatus = user?.subscriptionStatus || 'FREE';
  const trialEndsAt = user?.trialEndsAt;
  const payments = user?.payments ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground mt-2">
          Manage your subscription and billing details
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Your active subscription</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{subscriptionStatus}</div>
              {trialEndsAt && subscriptionStatus === 'TRIAL' && (
                <p className="text-sm text-muted-foreground mt-1">
                  Trial ends on {new Date(trialEndsAt).toLocaleDateString()}
                </p>
              )}
              {subscription && subscriptionStatus === 'ACTIVE' && (
                <p className="text-sm text-muted-foreground mt-1">
                  Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </p>
              )}
            </div>
            <BillingActions subscriptionStatus={subscriptionStatus} />
          </div>
        </CardContent>
      </Card>

      {/* Available Plans */}
      {subscriptionStatus !== 'ACTIVE' && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Free Trial</CardTitle>
              <CardDescription>14 days free</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-3xl font-bold">$0</div>
                <ul className="space-y-2 text-sm">
                  <li>✓ 10 config generations</li>
                  <li>✓ All templates</li>
                  <li>✓ ZIP downloads</li>
                </ul>
                <p className="text-sm text-muted-foreground font-medium">Current Plan</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>Best for professionals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-3xl font-bold">$29<span className="text-sm font-normal">/month</span></div>
                <ul className="space-y-2 text-sm">
                  <li>✓ Unlimited generations</li>
                  <li>✓ All templates</li>
                  <li>✓ Priority support</li>
                  <li>✓ Config history</li>
                </ul>
                <BillingActions subscriptionStatus={subscriptionStatus} showUpgradeOnly />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>Your past invoices and payments</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No billing history yet
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium text-sm">
                      ${(payment.amount / 100).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded-full ${
                      payment.status === 'SUCCEEDED'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
