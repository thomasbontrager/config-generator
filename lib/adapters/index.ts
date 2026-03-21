/**
 * lib/adapters/index.ts
 * Public surface for the adapters layer.
 */
export type { GitHubProvider } from './github.provider';
export { GitHubAdapter } from './github.adapter';

export type { BillingProviderAdapter } from './billing.provider';
export { StripeBillingAdapter } from './billing.adapter';

export type { AiGenerationProvider } from './ai.provider';
export { OpenAiGenerationAdapter } from './ai.adapter';
