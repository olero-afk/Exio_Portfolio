const MAX_AI_REQUESTS_PER_SESSION = 20;
let requestCount = 0;

export function canMakeAIRequest(): boolean {
  return requestCount < MAX_AI_REQUESTS_PER_SESSION;
}

export function incrementAIRequestCount(): void {
  requestCount++;
}

export function getRemainingAIRequests(): number {
  return MAX_AI_REQUESTS_PER_SESSION - requestCount;
}

export function getAIRequestCount(): number {
  return requestCount;
}
