import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * Team page.
 *
 * Team collaboration is available on the Pro plan. This page shows the current
 * plan status and a CTA to upgrade.
 *
 * Full team invite/member management will be implemented in the next iteration
 * once the TeamMember Prisma model is in the production database.
 */
export default async function TeamPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Team</h1>
        <p className="text-muted-foreground mt-2">
          Collaborate on stacks and configs with your team
        </p>
      </div>

      <Card className="bg-primary/5 border-primary/30">
        <CardHeader>
          <CardTitle>Team collaboration — Pro feature</CardTitle>
          <CardDescription>
            Invite teammates, share stacks, and manage roles on a Pro or higher plan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>✓ Invite unlimited team members</li>
            <li>✓ Assign Owner / Admin / Member roles</li>
            <li>✓ Share public and private stacks</li>
            <li>✓ Shared config history across your team</li>
          </ul>
          <Button asChild>
            <a href="/dashboard/billing">Upgrade to Pro</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
