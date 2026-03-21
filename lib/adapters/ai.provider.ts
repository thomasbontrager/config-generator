/**
 * lib/adapters/ai.provider.ts
 *
 * Clean adapter interface for AI-powered stack artifact generation.
 */

import type { StackConfig } from '@/types/stack-config';

export interface AiGenerationProvider {
  /**
   * Generate stack artifacts for a given configuration.
   * Returns a structured JSON output and an optional plain-text log string.
   */
  generateStackArtifacts(input: {
    organizationId: string;
    stackProjectId: string;
    generationId: string;
    config: StackConfig;
  }): Promise<{ outputJson: unknown; logsText?: string }>;
}
