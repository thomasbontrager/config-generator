import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function StacksPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const stacks = await prisma.stack.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      name: true,
      description: true,
      configTypes: true,
      isPublic: true,
      updatedAt: true,
      _count: { select: { generatedConfigs: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Stacks</h1>
          <p className="text-muted-foreground mt-2">
            Saved sets of config types you can regenerate any time
          </p>
        </div>
        <Link href="/dashboard/stacks/new">
          <Button>+ New Stack</Button>
        </Link>
      </div>

      {stacks.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">You haven&apos;t created any stacks yet.</p>
            <Link href="/dashboard/stacks/new">
              <Button>Create your first stack</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stacks.map((stack) => (
            <Card key={stack.id} className="hover:border-primary/60 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg leading-tight">{stack.name}</CardTitle>
                  {stack.isPublic && (
                    <span className="text-xs px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full font-medium shrink-0">
                      Public
                    </span>
                  )}
                </div>
                {stack.description && (
                  <CardDescription className="line-clamp-2">{stack.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-1">
                  {stack.configTypes.map((t) => (
                    <span
                      key={t}
                      className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{stack._count.generatedConfigs} generation{stack._count.generatedConfigs !== 1 ? 's' : ''}</span>
                  <span>Updated {new Date(stack.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex gap-2">
                  <Link href={`/dashboard/stacks/${stack.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      View
                    </Button>
                  </Link>
                  <Link href={`/dashboard/generator?stackId=${stack.id}`} className="flex-1">
                    <Button size="sm" className="w-full">
                      Generate
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
