import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const INTEGRATIONS = [
  {
    provider: 'GITHUB' as const,
    name: 'GitHub',
    icon: '🐙',
    description: 'Connect your GitHub account to push generated configs directly to repositories.',
    connectHref: '/dashboard/github',
  },
];

export default async function IntegrationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const connected = await prisma.integration.findMany({
    where: { userId: session.user.id, revokedAt: null },
    select: { provider: true, metadata: true, connectedAt: true },
  });

  const connectedSet = new Set(connected.map((i) => i.provider));
  const connectedMap = new Map(connected.map((i) => [i.provider, i]));

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect ShipForge with the tools you already use
        </p>
      </div>

      <div className="space-y-4">
        {INTEGRATIONS.map(({ provider, name, icon, description, connectHref }) => {
          const isConnected = connectedSet.has(provider);
          const record = connectedMap.get(provider);
          const meta = record?.metadata as
            | { login?: string; avatarUrl?: string }
            | null
            | undefined;

          return (
            <Card key={provider}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{icon}</span>
                    <div>
                      <CardTitle>{name}</CardTitle>
                      <CardDescription>{description}</CardDescription>
                    </div>
                  </div>
                  {isConnected ? (
                    <span className="text-xs font-medium px-3 py-1.5 bg-green-500/10 text-green-400 rounded-full">
                      Connected
                    </span>
                  ) : (
                    <Link href={connectHref}>
                      <Button size="sm">Connect</Button>
                    </Link>
                  )}
                </div>
              </CardHeader>
              {isConnected && record && (
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {meta?.login ? `Signed in as @${meta.login}` : 'Connected'}
                      {record.connectedAt &&
                        ` — since ${new Date(record.connectedAt).toLocaleDateString()}`}
                    </span>
                    <Link href={connectHref}>
                      <Button variant="ghost" size="sm">
                        Manage
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
