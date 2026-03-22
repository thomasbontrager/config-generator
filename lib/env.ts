/**
 * lib/env.ts
 *
 * Single source of truth for every environment variable used by ShipForge.
 * This module re-exports validated env objects from the split files:
 *   - lib/env/server.ts — server-only variables
 *   - lib/env/public.ts — NEXT_PUBLIC_* variables safe for the browser
 *
 * Importing this file triggers validation of all variables (server + public).
 * It is imported at server startup via instrumentation.ts so the process
 * exits early on missing or malformed variables.
 *
 * Usage:
 *   import { env } from '@/lib/env';
 *   const key = env.STRIPE_SECRET_KEY;          // server-only
 *   const url = env.NEXT_PUBLIC_APP_URL;         // public
 */

import { serverEnv } from './env/server';
import { publicEnv } from './env/public';

/** Fully-typed, validated environment object (server + public vars). */
export const env = { ...serverEnv, ...publicEnv };

export type Env = typeof env;
