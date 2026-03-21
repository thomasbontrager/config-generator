/**
 * lib/integrations — integration provider domain constants.
 */
export const IntegrationProvider = {
  GITHUB: 'GITHUB',
  GITLAB: 'GITLAB',
  VERCEL: 'VERCEL',
  NETLIFY: 'NETLIFY',
} as const;
export type IntegrationProviderType = (typeof IntegrationProvider)[keyof typeof IntegrationProvider];

export function isIntegrationActive(revokedAt: Date | null | undefined): boolean {
  return !revokedAt;
}
