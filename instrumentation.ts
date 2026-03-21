/**
 * instrumentation.ts
 *
 * Next.js instrumentation hook — runs once at server startup before any
 * request is handled. Used here to validate required environment variables
 * early, so the process exits with a clear error rather than a cryptic
 * runtime failure deep inside a request handler.
 *
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Importing lib/env triggers Zod validation of process.env.
  // If any required variable is missing or malformed the import throws,
  // which prevents the server from starting.
  await import('./lib/env');
}
