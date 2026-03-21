'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { StackConfig } from '@/types/stack-config';

// ─── Option definitions ───────────────────────────────────────────────────────

const FRONTEND_OPTIONS: { value: StackConfig['frontend']; label: string }[] = [
  { value: 'vite-react', label: 'Vite + React' },
  { value: 'nextjs', label: 'Next.js' },
];

const BACKEND_OPTIONS: { value: StackConfig['backend']; label: string }[] = [
  { value: 'express', label: 'Express.js' },
  { value: 'fastapi', label: 'FastAPI' },
  { value: 'none', label: 'None' },
];

const DATABASE_OPTIONS: { value: StackConfig['database']; label: string }[] = [
  { value: 'postgres', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'sqlite', label: 'SQLite' },
  { value: 'none', label: 'None' },
];

const ORM_OPTIONS: { value: StackConfig['orm']; label: string }[] = [
  { value: 'prisma', label: 'Prisma' },
  { value: 'drizzle', label: 'Drizzle' },
  { value: 'none', label: 'None' },
];

const AUTH_OPTIONS: { value: StackConfig['auth'][number]; label: string }[] = [
  { value: 'email-password', label: 'Email / Password' },
  { value: 'magic-link', label: 'Magic Link' },
  { value: 'google', label: 'Google' },
  { value: 'github', label: 'GitHub' },
];

const BILLING_OPTIONS: { value: StackConfig['billing']; label: string }[] = [
  { value: 'stripe', label: 'Stripe' },
  { value: 'lemon-squeezy', label: 'Lemon Squeezy' },
  { value: 'none', label: 'None' },
];

const AI_OPTIONS: { value: StackConfig['aiProviders'][number]; label: string }[] = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic' },
  { value: 'replicate', label: 'Replicate' },
];

const EMAIL_OPTIONS: { value: StackConfig['email']; label: string }[] = [
  { value: 'resend', label: 'Resend' },
  { value: 'mailgun', label: 'Mailgun' },
  { value: 'none', label: 'None' },
];

const STORAGE_OPTIONS: { value: StackConfig['storage']; label: string }[] = [
  { value: 's3', label: 'AWS S3' },
  { value: 'cloudflare-r2', label: 'Cloudflare R2' },
  { value: 'local', label: 'Local' },
  { value: 'none', label: 'None' },
];

const DEPLOYMENT_OPTIONS: { value: StackConfig['deployment']; label: string }[] = [
  { value: 'docker', label: 'Docker' },
  { value: 'coolify', label: 'Coolify' },
  { value: 'railway', label: 'Railway' },
  { value: 'manual', label: 'Manual' },
];

const MODULE_OPTIONS: { value: StackConfig['modules'][number]; label: string }[] = [
  { value: 'teams', label: 'Teams' },
  { value: 'admin', label: 'Admin' },
  { value: 'api-keys', label: 'API Keys' },
  { value: 'webhooks', label: 'Webhooks' },
  { value: 'docs', label: 'Docs' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'queues', label: 'Queues' },
  { value: 'cron', label: 'Cron' },
  { value: 'observability', label: 'Observability' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function RadioGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              value === opt.value
                ? 'border-primary bg-primary/10 font-medium'
                : 'border-border hover:border-primary/50 bg-card'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckboxGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T[];
  onChange: (v: T[]) => void;
}) {
  const toggle = (v: T) => {
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">{label}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
              value.includes(opt.value)
                ? 'border-primary bg-primary/10 font-medium'
                : 'border-border hover:border-primary/50 bg-card'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GeneratorPage() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const [projectName, setProjectName] = useState('');
  const [slug, setSlug] = useState('');
  const [frontend, setFrontend] = useState<StackConfig['frontend']>('vite-react');
  const [backend, setBackend] = useState<StackConfig['backend']>('express');
  const [database, setDatabase] = useState<StackConfig['database']>('postgres');
  const [orm, setOrm] = useState<StackConfig['orm']>('prisma');
  const [auth, setAuth] = useState<StackConfig['auth']>(['email-password']);
  const [billing, setBilling] = useState<StackConfig['billing']>('none');
  const [aiProviders, setAiProviders] = useState<StackConfig['aiProviders']>([]);
  const [email, setEmail] = useState<StackConfig['email']>('none');
  const [storage, setStorage] = useState<StackConfig['storage']>('none');
  const [deployment, setDeployment] = useState<StackConfig['deployment']>('docker');
  const [modules, setModules] = useState<StackConfig['modules']>([]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setProjectName(name);
    setSlug(toSlug(name));
  };

  const handleGenerate = async () => {
    if (!projectName.trim()) {
      toast({ variant: 'destructive', title: 'Project name required', description: 'Enter a project name to continue.' });
      return;
    }
    if (!slug) {
      toast({ variant: 'destructive', title: 'Slug required', description: 'The slug cannot be empty.' });
      return;
    }

    setIsGenerating(true);
    try {
      const config: StackConfig = {
        projectName: projectName.trim(),
        slug,
        frontend,
        backend,
        database,
        orm,
        auth,
        billing,
        aiProviders,
        email,
        storage,
        deployment,
        modules,
      };

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const contentType = response.headers.get('content-type') ?? '';

      if (!response.ok) {
        let errorMessage = 'Generation failed';
        try {
          if (contentType.includes('application/json')) {
            const errorData = await response.json();
            if (typeof errorData?.error === 'string') errorMessage = errorData.error;
          } else {
            const text = await response.text();
            if (text) errorMessage = text;
          }
        } catch { /* ignore */ }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${slug}.zip`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast({ title: 'Success!', description: 'Your project scaffold has been generated.' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">Config Generator</h1>
        <p className="text-muted-foreground mt-2">
          Configure your stack and download a ready-to-use project scaffold.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project name *</Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={handleNameChange}
                placeholder="My Awesome App"
                maxLength={80}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder="my-awesome-app"
                maxLength={80}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stack</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup label="Frontend" options={FRONTEND_OPTIONS} value={frontend} onChange={setFrontend} />
          <RadioGroup label="Backend" options={BACKEND_OPTIONS} value={backend} onChange={setBackend} />
          <RadioGroup label="Database" options={DATABASE_OPTIONS} value={database} onChange={setDatabase} />
          <RadioGroup label="ORM" options={ORM_OPTIONS} value={orm} onChange={setOrm} />
          <RadioGroup label="Deployment" options={DEPLOYMENT_OPTIONS} value={deployment} onChange={setDeployment} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Auth, Billing & Integrations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <CheckboxGroup label="Auth methods" options={AUTH_OPTIONS} value={auth} onChange={setAuth} />
          <RadioGroup label="Billing" options={BILLING_OPTIONS} value={billing} onChange={setBilling} />
          <RadioGroup label="Email" options={EMAIL_OPTIONS} value={email} onChange={setEmail} />
          <RadioGroup label="Storage" options={STORAGE_OPTIONS} value={storage} onChange={setStorage} />
          <CheckboxGroup label="AI providers" options={AI_OPTIONS} value={aiProviders} onChange={setAiProviders} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Modules</CardTitle>
        </CardHeader>
        <CardContent>
          <CheckboxGroup label="Include modules" options={MODULE_OPTIONS} value={modules} onChange={setModules} />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !projectName.trim() || !slug}
          size="lg"
        >
          {isGenerating ? 'Generating…' : 'Generate & Download ZIP'}
        </Button>
      </div>
    </div>
  );
}
