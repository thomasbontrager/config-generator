'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const CONFIG_TYPES = [
  { id: 'vite-react', label: 'Vite + React', description: 'Lightning-fast SPA with HMR' },
  { id: 'vue3', label: 'Vue 3', description: 'Progressive JS framework' },
  { id: 'next', label: 'Next.js', description: 'Full-stack React framework' },
  { id: 'express', label: 'Express API', description: 'Node.js REST API' },
  { id: 'django', label: 'Django', description: 'Python web framework' },
  { id: 'docker', label: 'Docker', description: 'Containerization setup' },
  { id: 'k8s', label: 'Kubernetes', description: 'Container orchestration' },
  { id: 'github-actions', label: 'GitHub Actions', description: 'CI/CD workflows' },
] as const;

type ConfigType = (typeof CONFIG_TYPES)[number]['id'];

export default function NewStackPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<Set<ConfigType>>(new Set());
  const [isPublic, setIsPublic] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleType = (id: ConfigType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTypes.size === 0) {
      toast({
        variant: 'destructive',
        title: 'No config types selected',
        description: 'Select at least one config type for your stack.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/stacks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          configTypes: Array.from(selectedTypes),
          isPublic,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to create stack');
      }

      toast({ title: 'Stack created', description: `"${name}" is ready to generate.` });
      router.push(`/dashboard/stacks/${data.stack.id}`);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/stacks">
          <Button variant="ghost" size="sm">← Back</Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">New Stack</h1>
          <p className="text-muted-foreground mt-1">
            Save a set of config types you want to generate together
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Stack details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Full-Stack Setup"
                required
                maxLength={80}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description of this stack"
                maxLength={500}
                disabled={isLoading}
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                id="isPublic"
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                disabled={isLoading}
                className="h-4 w-4 rounded border border-input"
              />
              <Label htmlFor="isPublic" className="cursor-pointer">
                Make this stack public (shareable link)
              </Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Config types *</CardTitle>
            <CardDescription>
              Select the configuration files to include when this stack is generated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {CONFIG_TYPES.map(({ id, label, description: desc }) => {
                const checked = selectedTypes.has(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => toggleType(id)}
                    disabled={isLoading}
                    className={`text-left p-4 rounded-lg border transition-colors ${
                      checked
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/40 bg-card'
                    }`}
                  >
                    <div className="font-medium text-sm">{label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading || !name.trim() || selectedTypes.size === 0}>
            {isLoading ? 'Creating…' : 'Create Stack'}
          </Button>
          <Link href="/dashboard/stacks">
            <Button type="button" variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
