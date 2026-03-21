'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type VerifyState = 'loading' | 'success' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams?.get('token') ?? '';
  const email = searchParams?.get('email') ?? '';

  const [state, setState] = useState<VerifyState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const verifyEmail = useCallback(async () => {
    if (!token || !email) {
      setState('error');
      setErrorMessage('Verification link is incomplete. Please use the link from your email.');
      return;
    }

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState('error');
        setErrorMessage(data.error ?? 'Verification failed.');
        return;
      }

      setState('success');

      // Redirect to dashboard after a short delay
      setTimeout(() => router.push('/dashboard'), 2500);
    } catch {
      setState('error');
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
  }, [token, email, router]);

  useEffect(() => {
    verifyEmail();
  }, [verifyEmail]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="text-4xl">⚡</div>
        </div>
        <CardTitle className="text-2xl text-center">Email verification</CardTitle>
        <CardDescription className="text-center">
          {state === 'loading' && 'Verifying your email address…'}
          {state === 'success' && 'Your email has been verified!'}
          {state === 'error' && 'Verification failed'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        {state === 'loading' && (
          <div className="flex justify-center py-6">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}

        {state === 'success' && (
          <>
            <div className="py-4 text-5xl">✅</div>
            <p className="text-muted-foreground">
              Your email has been verified. Redirecting you to the dashboard…
            </p>
            <Link href="/dashboard">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="py-4 text-5xl">❌</div>
            <p className="text-sm text-destructive font-medium">{errorMessage}</p>
            <div className="space-y-2 pt-2">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f0f1e] to-[#16213e] p-4">
      <Suspense
        fallback={
          <Card className="w-full max-w-md">
            <CardContent className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </CardContent>
          </Card>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
