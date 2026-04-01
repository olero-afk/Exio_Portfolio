import { getCachedResponse, setCachedResponse } from './aiCache.ts';
import { canMakeAIRequest, incrementAIRequestCount } from './aiRateLimit.ts';

interface AIMessage {
  role: string;
  content: string;
}

interface AIRequestParams {
  model?: string;
  max_tokens?: number;
  messages: AIMessage[];
  system?: string;
}

interface AIResponse {
  content: Array<{ type: string; text: string }>;
  [key: string]: unknown;
}

const RATE_LIMIT_RESPONSE: AIResponse = {
  content: [{
    type: 'text',
    text: 'AI-grensen er nådd for denne økten (maks 20 forespørsler). Last inn siden på nytt for å fortsette.',
  }],
};

export async function callExioAI(apiKey: string, params: AIRequestParams): Promise<AIResponse> {
  // 1. Check cache
  const cacheKey = { model: params.model, messages: params.messages, system: params.system };
  const cached = getCachedResponse(cacheKey);
  if (cached) return cached as AIResponse;

  // 2. Check rate limit
  if (!canMakeAIRequest()) {
    return RATE_LIMIT_RESPONSE;
  }

  // 3. Make API call with capped tokens
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: params.model ?? 'claude-sonnet-4-20250514',
      max_tokens: Math.min(params.max_tokens ?? 500, 500),
      messages: params.messages,
      ...(params.system && { system: params.system }),
    }),
  });

  if (!response.ok) throw new Error(`API ${response.status}`);

  const data: AIResponse = await response.json();

  // 4. Cache + count
  setCachedResponse(cacheKey, data);
  incrementAIRequestCount();

  return data;
}
