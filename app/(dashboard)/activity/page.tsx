import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ACTION_LABELS: Record<string, string> = {
  GENERATE_CONFIG: 'Generated a config ZIP',
  LOGIN: 'Signed in',
  LOGOUT: 'Signed out',
  SIGNUP: 'Created account',
  PASSWORD_CHANGED: 'Changed password',
  PASSWORD_RESET: 'Reset password',
  EMAIL_VERIFIED: 'Verified email address',
  ACCOUNT_DELETED: 'Deleted account',
  CREATE_STACK: 'Created a stack',
  DELETE_STACK: 'Deleted a stack',
  CREATE_API_KEY: 'Created an API key',
  REVOKE_API_KEY: 'Revoked an API key',
  CONNECT_GITHUB: 'Connected GitHub',
  DISCONNECT_GITHUB: 'Disconnected GitHub',
  SUBSCRIPTION_CREATED: 'Started subscription',
  SUBSCRIPTION_CANCELED: 'Cancelled subscription',
  PROFILE_UPDATED: 'Updated profile',
};

function actionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action.replace(/_/g, ' ').toLowerCase();
}

export default async function ActivityPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const logs = await prisma.activityLog.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: {
      id: true,
      action: true,
      metadata: true,
      ipAddress: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Activity</h1>
        <p className="text-muted-foreground mt-2">
          A log of recent actions on your account
        </p>
      </div>

      {logs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            No activity recorded yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {logs.map((log) => (
              <div key={log.id} className="py-4 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-medium text-sm">{actionLabel(log.action)}</div>
                  {log.ipAddress && (
                    <div className="text-xs text-muted-foreground">
                      from {log.ipAddress}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
