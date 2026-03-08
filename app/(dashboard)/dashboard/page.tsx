import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      generatedConfigs: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  const configCount = user?.generatedConfigs.length || 0;
  const subscriptionStatus = user?.subscriptionStatus || 'FREE';
  const trialEndsAt = user?.trialEndsAt;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'User'}! 👋</h1>
        <p className="text-muted-foreground mt-2">
          Here&apos;s an overview of your account
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptionStatus}</div>
            {trialEndsAt && subscriptionStatus === 'TRIAL' && (
              <p className="text-xs text-muted-foreground mt-1">
                Trial ends {new Date(trialEndsAt).toLocaleDateString()}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configs Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{configCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {subscriptionStatus === 'TRIAL' ? '10 max during trial' : 'Unlimited'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Action</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/generator">
              <Button className="w-full">Generate Config</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Configs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Configurations</CardTitle>
        </CardHeader>
        <CardContent>
          {configCount === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                You haven&apos;t generated any configs yet
              </p>
              <Link href="/dashboard/generator">
                <Button>Create Your First Config</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {user?.generatedConfigs.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{config.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {config.configType} • {new Date(config.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upgrade CTA if on trial */}
      {subscriptionStatus === 'TRIAL' && (
        <Card className="bg-primary/10 border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Upgrade to Pro</h3>
                <p className="text-sm text-muted-foreground">
                  Get unlimited generations and priority support
                </p>
              </div>
              <Link href="/dashboard/billing">
                <Button>Upgrade Now - $29/mo</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
