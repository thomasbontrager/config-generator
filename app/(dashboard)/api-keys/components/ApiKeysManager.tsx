'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Copy, Trash2, Plus } from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

interface ApiKeysManagerProps {
  initialKeys: ApiKey[];
}

export function ApiKeysManager({ initialKeys }: ApiKeysManagerProps) {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newKeyName.trim()) return;

    setIsCreating(true);

    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName.trim(),
          expiresInDays: expiresInDays ? parseInt(expiresInDays, 10) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to create API key');
      }

      setRevealedKey(data.rawKey as string);
      setKeys((prev) => [data.key as ApiKey, ...prev]);
      setShowCreate(false);
      setNewKeyName('');
      setExpiresInDays('');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevoke = async (id: string, name: string) => {
    if (!window.confirm(`Revoke "${name}"? Any integrations using this key will stop working.`)) {
      return;
    }

    setRevokingId(id);

    try {
      const response = await fetch(`/api/api-keys/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? 'Failed to revoke key');
      }

      setKeys((prev) => prev.filter((k) => k.id !== id));
      toast({ title: 'API key revoked', description: `"${name}" is no longer valid.` });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setRevokingId(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copied to clipboard' });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Could not copy',
        description: 'Please copy the key manually.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Revealed key banner */}
      {revealedKey && (
        <Card className="border-primary bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg text-primary">Save your API key now</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              This is the only time your full API key will be displayed. Copy it and store it
              securely.
            </p>
            <div className="flex gap-2">
              <code className="flex-1 font-mono text-sm bg-muted p-3 rounded-lg break-all">
                {revealedKey}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(revealedKey)}
                className="shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setRevealedKey(null)}>
              I&apos;ve saved it — dismiss
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create form */}
      {!showCreate ? (
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Create new API key
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>New API key</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="keyName">Name *</Label>
                <Input
                  id="keyName"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="e.g. CI/CD pipeline, Local dev"
                  maxLength={60}
                  required
                  disabled={isCreating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresInDays">
                  Expires in (days){' '}
                  <span className="text-muted-foreground font-normal">— leave blank for no expiry</span>
                </Label>
                <Input
                  id="expiresInDays"
                  type="number"
                  value={expiresInDays}
                  onChange={(e) => setExpiresInDays(e.target.value)}
                  placeholder="e.g. 90"
                  min="1"
                  max="365"
                  disabled={isCreating}
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" disabled={isCreating || !newKeyName.trim()}>
                  {isCreating ? 'Creating…' : 'Create key'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreate(false);
                    setNewKeyName('');
                    setExpiresInDays('');
                  }}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Key list */}
      {keys.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10 text-muted-foreground">
            No active API keys. Create one above.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <Card key={key.id}>
              <CardContent className="flex items-center justify-between py-4 px-5">
                <div className="space-y-1">
                  <div className="font-medium">{key.name}</div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span className="font-mono">{key.keyPrefix}…</span>
                    <span>Created {new Date(key.createdAt).toLocaleDateString()}</span>
                    {key.lastUsedAt && (
                      <span>Last used {new Date(key.lastUsedAt).toLocaleDateString()}</span>
                    )}
                    {key.expiresAt && (
                      <span
                        className={
                          new Date(key.expiresAt) < new Date()
                            ? 'text-red-400'
                            : 'text-muted-foreground'
                        }
                      >
                        {new Date(key.expiresAt) < new Date()
                          ? 'Expired'
                          : `Expires ${new Date(key.expiresAt).toLocaleDateString()}`}
                      </span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevoke(key.id, key.name)}
                  disabled={revokingId === key.id}
                  className="gap-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  {revokingId === key.id ? 'Revoking…' : 'Revoke'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
