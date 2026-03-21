import { z } from 'zod';

// ─── Zod schema ───────────────────────────────────────────────────────────────

export const stackConfigSchema = z.object({
  projectName: z.string().min(1, 'Project name is required').max(80),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only'),
  frontend: z.enum(['vite-react', 'nextjs']),
  backend: z.enum(['express', 'fastapi', 'none']),
  database: z.enum(['postgres', 'mysql', 'sqlite', 'none']),
  orm: z.enum(['prisma', 'drizzle', 'none']),
  auth: z.array(z.enum(['email-password', 'magic-link', 'google', 'github'])),
  billing: z.enum(['stripe', 'lemon-squeezy', 'none']),
  aiProviders: z.array(z.enum(['openai', 'anthropic', 'replicate'])),
  email: z.enum(['resend', 'mailgun', 'none']),
  storage: z.enum(['s3', 'cloudflare-r2', 'local', 'none']),
  deployment: z.enum(['docker', 'coolify', 'railway', 'manual']),
  modules: z.array(
    z.enum([
      'teams',
      'admin',
      'api-keys',
      'webhooks',
      'docs',
      'analytics',
      'queues',
      'cron',
      'observability',
    ])
  ),
});

// ─── TypeScript type (inferred from schema) ───────────────────────────────────

export type StackConfig = z.infer<typeof stackConfigSchema>;
