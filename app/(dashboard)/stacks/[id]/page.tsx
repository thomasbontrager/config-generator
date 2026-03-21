import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StackActions } from './components/StackActions';

interface Props {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function StackDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const id = 'then' in params ? (await params).id : params.id;

  const stack = await prisma.stack.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      name: true,
      description: true,
      configTypes: true,
      isPublic: true,
      createdAt: true,
      updatedAt: true,
      generatedConfigs: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, name: true, configType: true, createdAt: true, content: true },
      },
      _count: { select: { generatedConfigs: true } },
    },
  });

  if (!stack) notFound();

  // Only the owner can see private stacks
  if (!stack.isPublic && stack.userId !== session.user.id) {
    redirect('/dashboard/stacks');
  }

  const isOwner = stack.userId === session.user.id;

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/dashboard/stacks">
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{stack.name}</h1>
            {stack.isPublic && (
              <span className="text-xs px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full font-medium">
                Public
              </span>
            )}
          </div>
          {stack.description && (
            <p className="text-muted-foreground mt-2">{stack.description}</p>
          )}
        </div>
        {isOwner && <StackActions stackId={stack.id} />}
      </div>

      {/* Config types */}
      <Card>
        <CardHeader>
          <CardTitle>Config types</CardTitle>
          <CardDescription>{stack.configTypes.length} type{stack.configTypes.length !== 1 ? 's' : ''} included</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {stack.configTypes.map((t) => (
              <span
                key={t}
                className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-mono font-medium"
              >
                {t}
              </span>
            ))}
          </div>
          {isOwner && (
            <div className="mt-4">
              <Link href={`/dashboard/generator?stackId=${stack.id}`}>
                <Button>Generate ZIP from this stack</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Total Generations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stack._count.generatedConfigs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{new Date(stack.createdAt).toLocaleDateString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-medium">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{new Date(stack.updatedAt).toLocaleDateString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent generations */}
      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Recent generations</CardTitle>
            <CardDescription>Configs generated from this stack</CardDescription>
          </CardHeader>
          <CardContent>
            {stack.generatedConfigs.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No generations yet — click &quot;Generate ZIP&quot; above to create your first.
              </p>
            ) : (
              <div className="space-y-3">
                {stack.generatedConfigs.map((config) => (
                  <div
                    key={config.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/30 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-sm">{config.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {config.configType} • {new Date(config.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                {stack._count.generatedConfigs > 10 && (
                  <Link href="/dashboard/configs">
                    <Button variant="ghost" size="sm" className="w-full">
                      View all {stack._count.generatedConfigs} generations →
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
