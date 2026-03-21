import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { GitHubConnectButton } from './components/GitHubConnectButton';

export default async function GitHubPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect('/login');

  const integration = await prisma.integration.findUnique({
    where: {
      userId_provider: { userId: session.user.id, provider: 'GITHUB' },
    },
    select: {
      id: true,
      externalId: true,
      scopes: true,
      metadata: true,
      connectedAt: true,
      revokedAt: true,
    },
  });

  const isConnected = !!integration && !integration.revokedAt;

  const clientId = process.env.GITHUB_OAUTH_CLIENT_ID ?? '';
  // Redirect back to /dashboard/github after OAuth
  const redirectUri = `${process.env.NEXTAUTH_URL ?? ''}/dashboard/github/callback`;

  const meta = integration?.metadata as
    | { login?: string; name?: string; avatarUrl?: string; profileUrl?: string }
    | null
    | undefined;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          🐙 GitHub Integration
        </h1>
        <p className="text-muted-foreground mt-2">
          Connect your GitHub account to push generated configs directly to repositories
        </p>
      </div>

      {/* Connection status */}
      <Card>
        <CardHeader>
          <CardTitle>Connection status</CardTitle>
          <CardDescription>
            {isConnected ? 'GitHub is connected to your ShipForge account.' : 'Not connected yet.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected && meta ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                {meta.avatarUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={meta.avatarUrl}
                    alt={meta.login ?? 'GitHub avatar'}
                    className="w-10 h-10 rounded-full border"
                  />
                )}
                <div>
                  <div className="font-medium">{meta.name ?? meta.login ?? 'GitHub user'}</div>
                  {meta.login && (
                    <a
                      href={meta.profileUrl ?? `https://github.com/${meta.login}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      @{meta.login}
                    </a>
                  )}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">
                Connected since{' '}
                {integration?.connectedAt
                  ? new Date(integration.connectedAt).toLocaleDateString()
                  : 'unknown'}
              </div>
              {(integration?.scopes?.length ?? 0) > 0 && (
                <div className="text-xs text-muted-foreground">
                  Scopes: {integration?.scopes.join(', ')}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Click the button below to authorise ShipForge to access your GitHub account.
            </p>
          )}

          <GitHubConnectButton
            isConnected={isConnected}
            clientId={clientId}
            redirectUri={redirectUri}
          />
        </CardContent>
      </Card>

      {/* Capabilities info */}
      {!isConnected && (
        <Card>
          <CardHeader>
            <CardTitle>What you can do once connected</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Push generated configs to any of your repositories</li>
              <li>✓ Create new repositories pre-configured with your stack</li>
              <li>✓ Browse existing repos to add ShipForge config files</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
