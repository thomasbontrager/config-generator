'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface GitHubConnectButtonProps {
  isConnected: boolean;
  clientId: string;
  redirectUri: string;
}

export function GitHubConnectButton({
  isConnected,
  clientId,
  redirectUri,
}: GitHubConnectButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleConnect = () => {
    if (!clientId) {
      toast({
        variant: 'destructive',
        title: 'GitHub integration not configured',
        description: 'Ask the site administrator to set GITHUB_OAUTH_CLIENT_ID.',
      });
      return;
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'read:user repo',
    });

    window.location.href = `https://github.com/login/oauth/authorize?${params.toString()}`;
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect GitHub? You can reconnect at any time.')) return;

    setIsDisconnecting(true);

    try {
      const response = await fetch('/api/integrations/github', { method: 'DELETE' });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? 'Disconnect failed');
      }

      toast({ title: 'GitHub disconnected' });
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isConnected) {
    return (
      <Button
        variant="destructive"
        onClick={handleDisconnect}
        disabled={isDisconnecting}
      >
        {isDisconnecting ? 'Disconnecting…' : 'Disconnect GitHub'}
      </Button>
    );
  }

  return (
    <Button onClick={handleConnect} className="gap-2">
      🐙 Connect GitHub
    </Button>
  );
}
