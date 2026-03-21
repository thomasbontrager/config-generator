/**
 * lib/ai — AI provider abstraction.
 * Stub implementation; wire up OpenAI/Anthropic via env vars.
 */

export type AIProvider = 'openai' | 'anthropic' | 'none';

export interface GenerationRequest { prompt: string; maxTokens?: number; }
export interface GenerationResult { text: string; tokensUsed: number; provider: AIProvider; }

export async function generateText(request: GenerationRequest): Promise<GenerationResult> {
  // TODO: route to OpenAI (OPENAI_API_KEY) or Anthropic (ANTHROPIC_API_KEY)
  if (process.env.NODE_ENV === 'development') {
    console.debug('[ai] generateText (stub)', request.prompt.slice(0, 50));
  }
  return { text: `[AI not configured] ${request.prompt.slice(0, 100)}`, tokensUsed: 0, provider: 'none' };
}

export async function logAIUsage(userId: string, provider: AIProvider, tokensUsed: number, requestType: string): Promise<void> {
  // TODO: persist usage to database
  if (process.env.NODE_ENV === 'development') {
    console.debug('[ai usage]', { userId, provider, tokensUsed, requestType });
  }
}
