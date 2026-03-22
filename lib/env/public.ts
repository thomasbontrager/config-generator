/**
 * lib/env/public.ts
 *
 * Validated schema for environment variables that are safe to expose to the
 * browser (NEXT_PUBLIC_* prefix). Import this in both server and client code.
 *
 * Usage:
 *   import { publicEnv } from '@/lib/env/public';
 *   const url = publicEnv.NEXT_PUBLIC_APP_URL;
 */

import { z } from 'zod';

const publicEnvSchema = z.object({
  /** Public base URL exposed to the browser, e.g. https://shipforge.dev */
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),
});

const parsed = publicEnvSchema.safeParse(process.env);

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors;
  const lines = Object.entries(errors)
    .map(([key, msgs]) => `  ${key}: ${(msgs ?? []).join(', ')}`)
    .join('\n');

  throw new Error(
    `\n❌ Invalid public environment variables:\n${lines}\n` +
      '\nSee .env.example for the full list of required variables.\n'
  );
}

/** Validated public (browser-safe) environment variables. */
export const publicEnv = parsed.data;

export type PublicEnv = typeof publicEnv;
