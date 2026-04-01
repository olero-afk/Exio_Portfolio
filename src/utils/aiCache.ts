const cache = new Map<string, { response: unknown; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCacheKey(params: Record<string, unknown>): string {
  return JSON.stringify(params);
}

export function getCachedResponse(params: Record<string, unknown>): unknown | null {
  const key = getCacheKey(params);
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.response;
}

export function setCachedResponse(params: Record<string, unknown>, response: unknown): void {
  const key = getCacheKey(params);
  cache.set(key, { response, timestamp: Date.now() });
}
