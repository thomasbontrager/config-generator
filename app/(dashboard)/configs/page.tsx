import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfigsActions } from './components/ConfigsActions';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function ConfigsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const configs = await prisma.generatedConfig.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      configType: true,
      content: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Configuration History</h1>
        <p className="text-muted-foreground mt-2">
          View and re-download your previously generated configurations
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Configurations ({configs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {configs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No configurations generated yet</p>
              <Link href="/dashboard/generator">
                <Button>Generate your first config</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {configs.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{config.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {config.configType} • {new Date(config.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <ConfigsActions
                    configId={config.id}
                    configTypes={
                      (config.content as { configTypes?: string[] })?.configTypes ?? []
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
