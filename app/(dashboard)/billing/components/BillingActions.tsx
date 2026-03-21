'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface BillingActionsProps {
  subscriptionStatus: string;
  showUpgradeOnly?: boolean;
}

export function BillingActions({ subscriptionStatus, showUpgradeOnly = false }: BillingActionsProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to start checkout');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Checkout error',
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleManage = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to open billing portal');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Portal error',
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (showUpgradeOnly) {
    return (
      <Button className="w-full" onClick={handleUpgrade} disabled={isLoading}>
        {isLoading ? 'Redirecting...' : 'Upgrade to Pro — $29/mo'}
      </Button>
    );
  }

  if (subscriptionStatus === 'ACTIVE') {
    return (
      <Button variant="outline" onClick={handleManage} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Manage Subscription'}
      </Button>
    );
  }

  if (subscriptionStatus === 'TRIAL' || subscriptionStatus === 'FREE') {
    return (
      <Button size="lg" onClick={handleUpgrade} disabled={isLoading}>
        {isLoading ? 'Redirecting...' : 'Upgrade to Pro — $29/mo'}
      </Button>
    );
  }

  return null;
}
