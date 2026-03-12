/**
 * AI utility module for Travel Buddy app.
 * Uses 100% local Ollama - zero AI cost.
 */

import { isLocalAIEnabled } from "./ai-local";

export function isAIAvailable(): boolean {
  return isLocalAIEnabled();
}

/**
 * Parse JSON from AI response. Extracts JSON block if wrapped in markdown.
 */
export function parseAIJson<T>(content: string, fallback: T): T {
  const trimmed = content?.trim();
  if (!trimmed) return fallback;
  try {
    const parsed = JSON.parse(trimmed) as T;
    return parsed ?? fallback;
  } catch {
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as T;
        return parsed ?? fallback;
      } catch {
        /* fall through */
      }
    }
    return fallback;
  }
}
