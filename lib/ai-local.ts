/**
 * Local AI via Ollama. 100% free, zero-cost inference.
 */

const OLLAMA_URL = process.env.OLLAMA_URL ?? "http://localhost:11434";
const LOCAL_AI_MODEL = process.env.LOCAL_AI_MODEL ?? "mistral";
// Default true for zero-cost AI. Set false to disable AI features.
const ENABLE_LOCAL_AI = process.env.ENABLE_LOCAL_AI !== "false";
const OLLAMA_TIMEOUT_MS = 45_000;

let activeRequests = 0;
const MAX_CONCURRENT = 3;

export function isLocalAIEnabled(): boolean {
  return !!ENABLE_LOCAL_AI;
}

async function acquireSlot(): Promise<void> {
  while (activeRequests >= MAX_CONCURRENT) {
    await new Promise((r) => setTimeout(r, 200));
  }
  activeRequests++;
}

function releaseSlot(): void {
  activeRequests = Math.max(0, activeRequests - 1);
}

/**
 * Extract JSON from response (handles markdown code blocks).
 */
function extractJson(text: string): string | null {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  return null;
}

/**
 * Call Ollama generate API. Returns raw text or null on failure.
 */
export async function callOllama(
  prompt: string,
  options?: { system?: string; maxTokens?: number }
): Promise<string | null> {
  if (!isLocalAIEnabled()) return null;

  await acquireSlot();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const fullPrompt = options?.system
      ? `${options.system}\n\nUser: ${prompt}`
      : prompt;

    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: LOCAL_AI_MODEL,
        prompt: fullPrompt,
        stream: false,
        options: {
          num_predict: options?.maxTokens ?? 600,
          temperature: 0.6,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      console.warn("[Ollama] Non-OK response:", res.status);
      return null;
    }

    const data = (await res.json()) as { response?: string };
    const content = data?.response?.trim();
    return content || null;
  } catch (e) {
    clearTimeout(timeout);
    if ((e as Error).name === "AbortError") {
      console.warn("[Ollama] Timeout");
    } else {
      console.warn("[Ollama] Error:", (e as Error).message);
    }
    return null;
  } finally {
    releaseSlot();
  }
}

/**
 * Call Ollama and return parsed JSON. Extracts JSON from response.
 */
export async function callOllamaJson<T>(
  prompt: string,
  fallback: T,
  options?: { system?: string; maxTokens?: number }
): Promise<T> {
  const raw = await callOllama(prompt, options);
  if (!raw) return fallback;

  const jsonStr = extractJson(raw);
  if (!jsonStr) return fallback;

  try {
    const parsed = JSON.parse(jsonStr) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}
