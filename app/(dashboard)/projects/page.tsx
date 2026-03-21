import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

/**
 * Projects page.
 *
 * Projects are logical groupings of generated configs and stacks.
 * In this iteration, a "project" maps 1-to-1 with the user's generated configs
 * grouped by stack. Full project management (create, rename, archive) will
 * follow once the Project Prisma model is added.
 */
export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  // Group recent configs by stack
  const recentConfigs = await prisma.generatedConfig.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      name: true,
      configType: true,
      createdAt: true,
      stackId: true,
      stack: { select: { id: true, name: true } },
    },
  });

  const noStackConfigs = recentConfigs.filter((c) => !c.stackId);
  const byStack = recentConfigs
    .filter((c) => c.stackId)
    .reduce<Record<string, typeof recentConfigs>>((acc, c) => {
      const key = c.stackId!;
      acc[key] = acc[key] ?? [];
      acc[key].push(c);
      return acc;
    }, {});

  const totalConfigs = await prisma.generatedConfig.count({
    where: { userId: session.user.id },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-2">
            Your generated configs, organised by stack
          </p>
        </div>
        <Link href="/dashboard/generator">
          <Button>+ Generate New</Button>
        </Link>
      </div>

      {totalConfigs === 0 ? (
        <Card>
          <CardContent className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">No configs generated yet.</p>
            <Link href="/dashboard/generator">
              <Button>Generate your first config</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Stack-grouped */}
          {Object.entries(byStack).map(([stackId, configs]) => {
            const stackName = configs[0]?.stack?.name ?? stackId;
            return (
              <Card key={stackId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{stackName}</CardTitle>
                    <Link href={`/dashboard/stacks/${stackId}`}>
                      <Button variant="ghost" size="sm">View stack →</Button>
                    </Link>
                  </div>
                  <CardDescription>{configs.length} generation{configs.length !== 1 ? 's' : ''}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {configs.slice(0, 5).map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-accent/30"
                      >
                        <span className="font-medium">{c.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {/* Un-stacked configs */}
          {noStackConfigs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Standalone configs</CardTitle>
                <CardDescription>Generated without a saved stack</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {noStackConfigs.slice(0, 10).map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-accent/30"
                    >
                      <span className="font-medium">{c.name}</span>
                      <span className="text-muted-foreground text-xs">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  {noStackConfigs.length > 10 && (
                    <Link href="/dashboard/configs">
                      <Button variant="ghost" size="sm" className="w-full mt-2">
                        View all {noStackConfigs.length} configs →
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
