/**
 * lib/adapters/ai.adapter.ts
 *
 * Concrete OpenAI implementation of AiGenerationProvider.
 * Uses the existing lib/ai stub, routing to OPENAI_API_KEY when present.
 */

import { generateText, logAIUsage } from '@/lib/ai';
import { prisma } from '@/lib/prisma';
import type { StackConfig } from '@/types/stack-config';
import type { AiGenerationProvider } from './ai.provider';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the userId of the OWNER member of the given organization.
 */
async function resolveOrgOwnerUserId(organizationId: string): Promise<string> {
  const ownerMember = await prisma.organizationMember.findFirst({
    where: { organizationId, role: 'OWNER' },
    select: { userId: true },
  });
  if (!ownerMember) {
    throw new Error(`Organization ${organizationId} not found or has no owner`);
  }
  return ownerMember.userId;
}

/**
 * Build a natural-language prompt that asks the AI to produce a JSON
 * artifact description for the given StackConfig.
 */
function buildPrompt(config: StackConfig, stackProjectId: string, generationId: string): string {
  return [
    `You are ShipForge, an expert full-stack project generator.`,
    `Generate a detailed JSON artifact specification for a project with the following configuration:`,
    ``,
    `Stack project ID: ${stackProjectId}`,
    `Generation ID:    ${generationId}`,
    `Project name:     ${config.projectName}`,
    `Slug:             ${config.slug}`,
    `Frontend:         ${config.frontend}`,
    `Backend:          ${config.backend}`,
    `Database:         ${config.database} (ORM: ${config.orm})`,
    `Auth methods:     ${config.auth.join(', ') || 'none'}`,
    `Billing:          ${config.billing}`,
    `AI providers:     ${config.aiProviders.join(', ') || 'none'}`,
    `Email:            ${config.email}`,
    `Storage:          ${config.storage}`,
    `Deployment:       ${config.deployment}`,
    `Modules:          ${config.modules.join(', ') || 'none'}`,
    ``,
    `Respond with valid JSON only — no markdown fences, no prose.`,
    `The JSON must have the shape: { "files": [{ "path": string, "description": string }], "envVars": string[], "setupSteps": string[] }`,
  ].join('\n');
}

// ─── Adapter ──────────────────────────────────────────────────────────────────

export class OpenAiGenerationAdapter implements AiGenerationProvider {
  async generateStackArtifacts(input: {
    organizationId: string;
    stackProjectId: string;
    generationId: string;
    config: StackConfig;
  }): Promise<{ outputJson: unknown; logsText?: string }> {
    const userId = await resolveOrgOwnerUserId(input.organizationId);

    const prompt = buildPrompt(input.config, input.stackProjectId, input.generationId);

    const logs: string[] = [
      `[${new Date().toISOString()}] Starting AI generation for stack project ${input.stackProjectId} (generation ${input.generationId})`,
    ];

    const result = await generateText({ prompt, maxTokens: 2048 });

    logs.push(`[${new Date().toISOString()}] Provider: ${result.provider}, tokens used: ${result.tokensUsed}`);

    await logAIUsage(userId, result.provider, result.tokensUsed, 'generateStackArtifacts');

    let outputJson: unknown;
    try {
      outputJson = JSON.parse(result.text);
      logs.push(`[${new Date().toISOString()}] Output parsed successfully`);
    } catch {
      // AI returned non-JSON (e.g. stub provider); wrap as a raw object
      logs.push(`[${new Date().toISOString()}] Output is not valid JSON — storing as raw text`);
      outputJson = { raw: result.text };
    }

    return { outputJson, logsText: logs.join('\n') };
  }
}
