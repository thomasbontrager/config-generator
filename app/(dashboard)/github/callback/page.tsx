'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function CallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams?.get('code');
  const error = searchParams?.get('error');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const handleCallback = useCallback(async () => {
    if (error) {
      setStatus('error');
      setMessage(error === 'access_denied' ? 'Authorization was cancelled.' : `GitHub error: ${error}`);
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('Invalid callback: no code received from GitHub.');
      return;
    }

    try {
      const response = await fetch('/api/integrations/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to connect GitHub');
      }

      setStatus('success');
      setTimeout(() => router.push('/dashboard/github'), 1500);
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Failed to connect GitHub');
    }
  }, [code, error, router]);

  useEffect(() => {
    handleCallback();
  }, [handleCallback]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">
          {status === 'loading' && 'Connecting GitHub…'}
          {status === 'success' && '🐙 GitHub Connected!'}
          {status === 'error' && 'Connection Failed'}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {status === 'loading' && (
          <div className="flex justify-center py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}
        {status === 'success' && (
          <>
            <p className="text-muted-foreground">Your GitHub account has been connected. Redirecting…</p>
            <Link href="/dashboard/github">
              <Button className="w-full">Go to GitHub settings</Button>
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <p className="text-sm text-destructive">{message}</p>
            <Link href="/dashboard/github">
              <Button variant="outline" className="w-full">Back to GitHub settings</Button>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function GitHubCallbackPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Suspense
        fallback={
          <Card className="w-full max-w-md">
            <CardContent className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </CardContent>
          </Card>
        }
      >
        <CallbackContent />
      </Suspense>
    </div>
  );
}
