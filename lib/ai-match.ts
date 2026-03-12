/**
 * AI-powered compatibility scoring between users.
 * Uses local Ollama when available; falls back to rule-based scoring.
 */

import { callOllamaJson, isLocalAIEnabled } from "./ai-local";

export interface UserProfileForMatch {
  travelStyle: unknown;
  interests: unknown;
  budgetRange: string | null;
  languages?: unknown;
  bio?: string | null;
  location?: string | null;
}

export interface MatchResult {
  score: number;
  reasons?: string[];
}

/**
 * Rule-based scoring (fallback when Ollama unavailable).
 */
export function ruleBasedMatchScore(
  me: UserProfileForMatch,
  other: UserProfileForMatch
): MatchResult {
  let score = 50;
  const myStyles = (me.travelStyle as string[]) || [];
  const otherStyles = (other.travelStyle as string[]) || [];
  const myInterests = (me.interests as string[]) || [];
  const otherInterests = (other.interests as string[]) || [];
  const myLangs = (me.languages as string[]) || [];
  const otherLangs = (other.languages as string[]) || [];

  const styleOverlap = myStyles.filter((s) => otherStyles.includes(s)).length;
  const interestOverlap = myInterests.filter((i) => otherInterests.includes(i)).length;
  const langOverlap = myLangs.filter((l) => otherLangs.includes(l)).length;

  score += Math.min(styleOverlap * 8, 20);
  score += Math.min(interestOverlap * 5, 25);
  if (me.budgetRange && other.budgetRange && me.budgetRange === other.budgetRange) {
    score += 5;
  }
  if (langOverlap > 0) score += 3;

  const reasons: string[] = [];
  if (styleOverlap > 0) reasons.push(`Same travel style: ${myStyles.filter((s) => otherStyles.includes(s)).join(", ")}`);
  if (interestOverlap > 0) reasons.push(`Shared interests: ${myInterests.filter((i) => otherInterests.includes(i)).join(", ")}`);
  if (me.budgetRange && other.budgetRange && me.budgetRange === other.budgetRange) {
    reasons.push("Similar budget");
  }
  if (langOverlap > 0) reasons.push("Common languages");

  return {
    score: Math.min(100, Math.max(0, Math.round(score))),
    reasons: reasons.slice(0, 4),
  };
}

/**
 * AI-powered scoring via Ollama. Returns score 0-100 and reasons (match explanation).
 */
export async function aiMatchScore(
  me: UserProfileForMatch & { name?: string | null },
  other: UserProfileForMatch & { name?: string | null }
): Promise<MatchResult> {
  if (!isLocalAIEnabled()) {
    return ruleBasedMatchScore(me, other);
  }

  const prompt = `You are a travel buddy compatibility analyzer. Given two user profiles, compute a compatibility score 0-100 and 2-4 short reasons why they would make good travel buddies.

User A: travelStyle=${JSON.stringify(me.travelStyle)}, interests=${JSON.stringify(me.interests)}, budget=${me.budgetRange ?? "?"}, languages=${JSON.stringify(me.languages)}, bio=${(me.bio ?? "").slice(0, 100)}

User B: travelStyle=${JSON.stringify(other.travelStyle)}, interests=${JSON.stringify(other.interests)}, budget=${other.budgetRange ?? "?"}, languages=${JSON.stringify(other.languages)}, bio=${(other.bio ?? "").slice(0, 100)}

Respond with JSON only: { "score": number, "reasons": string[] }
Example: {"score":92,"reasons":["Both like hiking","Same travel style","Similar budget"]}`;

  try {
    const parsed = await callOllamaJson<{ score?: number; reasons?: string[] }>(
      prompt,
      {},
      { maxTokens: 300 }
    );
    const ruleResult = ruleBasedMatchScore(me, other);
    const score =
      typeof parsed.score === "number"
        ? Math.min(100, Math.max(0, Math.round(parsed.score)))
        : ruleResult.score;
    const reasons = Array.isArray(parsed.reasons) ? parsed.reasons : ruleResult.reasons;
    return { score, reasons };
  } catch {
    return ruleBasedMatchScore(me, other);
  }
}
