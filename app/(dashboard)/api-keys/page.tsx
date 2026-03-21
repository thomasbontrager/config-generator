import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ApiKeysManager } from './components/ApiKeysManager';

export default async function ApiKeysPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const rawKeys = await prisma.apiKey.findMany({
    where: { userId: session.user.id, revokedAt: null },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      expiresAt: true,
      createdAt: true,
    },
  });

  // Serialize Dates to ISO strings for the client component
  const keys = rawKeys.map((k) => ({
    ...k,
    lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
    expiresAt: k.expiresAt?.toISOString() ?? null,
    createdAt: k.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">API Keys</h1>
        <p className="text-muted-foreground mt-2">
          Create and manage API keys for programmatic access and CI/CD pipelines
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security notice</CardTitle>
          <CardDescription>
            API keys are shown in full only once at creation. Store them securely — they cannot be
            retrieved again. Treat them like passwords.
          </CardDescription>
        </CardHeader>
      </Card>

      <ApiKeysManager initialKeys={keys} />
    </div>
  );
}
