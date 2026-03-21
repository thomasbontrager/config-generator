'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Trash2 } from 'lucide-react';

interface ConfigsActionsProps {
  configId: string;
  /** The stored configTypes array, used to re-generate the ZIP on download. */
  configTypes: string[];
  /** When true, only the Download button is rendered (no Delete). */
  downloadOnly?: boolean;
}

export function ConfigsActions({ configId, configTypes, downloadOnly = false }: ConfigsActionsProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDownload = async () => {
    if (configTypes.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Cannot re-download',
        description: 'This configuration has no stored types to regenerate.',
      });
      return;
    }

    setIsDownloading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configTypes }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? 'Download failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shipforge-${configTypes.join('-')}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this configuration? This cannot be undone.')) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/configs/${configId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? 'Delete failed');
      }

      toast({ title: 'Deleted', description: 'Configuration removed.' });
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
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={isDownloading || configTypes.length === 0}
        className="gap-1"
      >
        <Download className="h-4 w-4" />
        {isDownloading ? 'Downloading…' : 'Download'}
      </Button>
      {!downloadOnly && (
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
      )}
    </div>
  );
}
