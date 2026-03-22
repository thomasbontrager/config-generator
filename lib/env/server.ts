/**
 * lib/env/server.ts
 *
 * Validated schema for server-only environment variables. This file must
 * NEVER be imported from client-side code (components, pages, or any module
 * that runs in the browser). Next.js will refuse to bundle it in client
 * chunks if the module is properly tree-shaken.
 *
 * Usage:
 *   import { serverEnv } from '@/lib/env/server';
 *   const key = serverEnv.STRIPE_SECRET_KEY;
 */

import { z } from 'zod';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Coerce "true" / "1" to true, everything else to false. */
const booleanEnv = z
  .string()
  .optional()
  .transform((v) => v === 'true' || v === '1');

/** Optional non-empty string. */
const optionalStr = z.string().min(1).optional();

// ─── Schema ───────────────────────────────────────────────────────────────────

const serverEnvSchema = z.object({
  // ── Core ──────────────────────────────────────────────────────────────────
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  /** Server-side base URL of the application, e.g. https://shipforge.dev.
   *  Use NEXT_PUBLIC_APP_URL (in lib/env/public.ts) when you need this URL
   *  in browser-side code. */
  APP_URL: z.string().url('APP_URL must be a valid URL'),

  // ── Database ──────────────────────────────────────────────────────────────
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  /** Optional Redis connection string (used for queues/cache). */
  REDIS_URL: optionalStr,

  // ── Auth ──────────────────────────────────────────────────────────────────
  /**
   * Secret used to sign sessions / JWTs.
   * NextAuth v4 also reads this as NEXTAUTH_SECRET — keep both aligned.
   */
  AUTH_SECRET: z
    .string()
    .min(32, 'AUTH_SECRET must be at least 32 characters'),

  /** Cookie domain override, e.g. ".shipforge.dev" for subdomain sharing. */
  COOKIE_DOMAIN: optionalStr,

  // ── Stripe ────────────────────────────────────────────────────────────────
  STRIPE_SECRET_KEY: z
    .string()
    .regex(/^sk_(live|test)_/, 'STRIPE_SECRET_KEY must start with sk_live_ or sk_test_'),

  STRIPE_WEBHOOK_SECRET: z
    .string()
    .min(1, 'STRIPE_WEBHOOK_SECRET is required'),

  STRIPE_PRICE_STARTER: z
    .string()
    .regex(/^price_/, 'STRIPE_PRICE_STARTER must be a Stripe price ID (price_...)'),

  STRIPE_PRICE_PRO: z
    .string()
    .regex(/^price_/, 'STRIPE_PRICE_PRO must be a Stripe price ID (price_...)'),

  STRIPE_PRICE_TEAM: z
    .string()
    .regex(/^price_/, 'STRIPE_PRICE_TEAM must be a Stripe price ID (price_...)'),

  STRIPE_PORTAL_RETURN_URL: z
    .string()
    .url('STRIPE_PORTAL_RETURN_URL must be a valid URL'),

  // ── GitHub ────────────────────────────────────────────────────────────────
  GITHUB_CLIENT_ID: optionalStr,
  GITHUB_CLIENT_SECRET: optionalStr,

  /** Numeric GitHub App ID, stored as a string in env. */
  GITHUB_APP_ID: optionalStr,

  /** PEM-encoded private key for the GitHub App. */
  GITHUB_APP_PRIVATE_KEY: optionalStr,

  GITHUB_WEBHOOK_SECRET: optionalStr,

  // ── AI / OpenAI ───────────────────────────────────────────────────────────
  OPENAI_API_KEY: optionalStr,

  /** Model name to use, e.g. "gpt-4o". Defaults to "gpt-4o-mini". */
  OPENAI_MODEL_DEFAULT: z.string().min(1).optional().default('gpt-4o-mini'),

  /** Which AI provider to use: "openai" | "anthropic" | "none". */
  AI_PROVIDER_DEFAULT: z
    .enum(['openai', 'anthropic', 'none'])
    .optional()
    .default('none'),

  // ── Email ─────────────────────────────────────────────────────────────────
  RESEND_API_KEY: optionalStr,
  MAILGUN_API_KEY: optionalStr,
  MAILGUN_DOMAIN: optionalStr,

  // ── Storage (S3-compatible) ───────────────────────────────────────────────
  S3_BUCKET: optionalStr,
  S3_REGION: optionalStr,
  S3_ACCESS_KEY_ID: optionalStr,
  S3_SECRET_ACCESS_KEY: optionalStr,
  /** Custom endpoint for S3-compatible providers (e.g. Cloudflare R2). */
  S3_ENDPOINT: optionalStr,

  // ── Observability ─────────────────────────────────────────────────────────
  SENTRY_DSN: optionalStr,
  PLAUSIBLE_DOMAIN: optionalStr,
  GA_MEASUREMENT_ID: optionalStr,

  // ── Feature flags ─────────────────────────────────────────────────────────
  FEATURE_ENABLE_DOCS: booleanEnv,
  FEATURE_ENABLE_TEAM_WORKSPACES: booleanEnv,
  FEATURE_ENABLE_ADMIN: booleanEnv,
});

// ─── Runtime validation ───────────────────────────────────────────────────────

const parsed = serverEnvSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors;
  const lines = Object.entries(errors)
    .map(([key, msgs]) => `  ${key}: ${(msgs ?? []).join(', ')}`)
    .join('\n');

  throw new Error(
    `\n❌ Invalid server environment variables:\n${lines}\n` +
      '\nSee .env.example for the full list of required variables.\n'
  );
}

/** Fully-typed, validated server-only environment object. */
export const serverEnv = parsed.data;

export type ServerEnv = typeof serverEnv;
