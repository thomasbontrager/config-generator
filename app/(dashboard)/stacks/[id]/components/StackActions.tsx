'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

interface StackActionsProps {
  stackId: string;
}

export function StackActions({ stackId }: StackActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Delete this stack? Generated configs will not be affected.')) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/stacks/${stackId}`, { method: 'DELETE' });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? 'Delete failed');
      }

      toast({ title: 'Stack deleted' });
      router.push('/dashboard/stacks');
      router.refresh();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="gap-1 text-destructive hover:text-destructive"
    >
      <Trash2 className="h-4 w-4" />
      {isDeleting ? 'Deleting…' : 'Delete'}
    </Button>
  );
}
