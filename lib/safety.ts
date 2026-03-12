/**
 * AI Safety & rule-based risk detection.
 * Server-side only. Used for profiles, trips, messages.
 * Uses local Ollama when available.
 */

import { callOllamaJson, isLocalAIEnabled } from "./ai-local";

export type SafetyStatus = "low_risk" | "medium_risk" | "high_risk";

export interface SafetyResult {
  score: number;
  status: SafetyStatus;
  reasons: string[];
  flagged: boolean;
}

const RISKY_PATTERNS = [
  /\b(wire\s+transfer|send\s+money|crypto|bitcoin|ethereum|paypal)\b/i,
  /\b(whatsapp|telegram|wechat|move\s+to\s+chat)\b/i,
  /\b(click\s+here|free\s+money|lottery|winner)\b/i,
  /\b(urgent|asap|act\s+now|limited\s+time)\b/i,
  /\b(account\s+locked|verify\s+now|suspicious\s+activity)\b/i,
  /(https?:\/\/[^\s]+)/g,
  /\b(sexy|hot\s+single|hookup|casual)\b/i,
  /\b(kill|hurt|threat|blackmail)\b/i,
];

export function ruleBasedProfileCheck(bio: string | null): SafetyResult {
  const reasons: string[] = [];
  const text = (bio ?? "").trim();
  if (text.length > 2000) reasons.push("Bio excessively long");
  if (RISKY_PATTERNS.some((p) => p.test(text))) {
    reasons.push("Suspicious wording detected");
  }
  const spamWords = text.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
  const unique = new Set(spamWords);
  if (spamWords.length > 50 && unique.size / spamWords.length < 0.3) {
    reasons.push("Repetitive or spam-like content");
  }
  const score = Math.max(0, 100 - reasons.length * 25);
  const status: SafetyStatus =
    score >= 75 ? "low_risk" : score >= 40 ? "medium_risk" : "high_risk";
  return { score, status, reasons, flagged: reasons.length > 0 };
}

export function ruleBasedMessageCheck(content: string): SafetyResult {
  const reasons: string[] = [];
  if (content.length > 2000) reasons.push("Message too long");
  RISKY_PATTERNS.forEach((p) => {
    if (p.test(content)) reasons.push("Suspicious or unsafe content");
  });
  const score = Math.max(0, 100 - reasons.length * 30);
  const status: SafetyStatus =
    score >= 75 ? "low_risk" : score >= 40 ? "medium_risk" : "high_risk";
  return { score, status, reasons: Array.from(new Set(reasons)), flagged: reasons.length > 0 };
}

export function ruleBasedTripCheck(description: string | null): SafetyResult {
  const reasons: string[] = [];
  const text = (description ?? "").trim();
  if (text.length > 5000) reasons.push("Description excessively long");
  if (RISKY_PATTERNS.some((p) => p.test(text))) {
    reasons.push("Suspicious wording in trip description");
  }
  if (/\$\d{1,3}(,\d{3})*(\.\d{2})?/.test(text) && /\b(free|no\s+cost)\b/i.test(text)) {
    reasons.push("Unrealistic offer (free + money mention)");
  }
  const score = Math.max(0, 100 - reasons.length * 25);
  const status: SafetyStatus =
    score >= 75 ? "low_risk" : score >= 40 ? "medium_risk" : "high_risk";
  return { score, status, reasons, flagged: reasons.length > 0 };
}

export async function aiProfileSafetyCheck(bio: string | null): Promise<SafetyResult> {
  const rule = ruleBasedProfileCheck(bio);
  if (!isLocalAIEnabled() || !bio?.trim()) return rule;

  const prompt = `Analyze this user profile bio for safety risk. Look for: spam, scam, harassment, fake content, off-platform redirects.
Bio: "${(bio ?? "").slice(0, 500)}"
Respond JSON only: {"score":0-100,"status":"low_risk|medium_risk|high_risk","reasons":["reason1"]}
If safe, score 80+. If suspicious, add reasons.`;

  try {
    const parsed = await callOllamaJson<{ score?: number; status?: string; reasons?: string[] }>(
      prompt,
      {},
      { maxTokens: 200 }
    );
    const score = Math.min(100, Math.max(0, Number(parsed.score) ?? rule.score));
    const status = (parsed.status as SafetyStatus) ?? rule.status;
    const reasons = Array.isArray(parsed.reasons) ? parsed.reasons : rule.reasons;
    return {
      score,
      status,
      reasons,
      flagged: status !== "low_risk" || reasons.length > 0,
    };
  } catch {
    return rule;
  }
}

export async function aiMessageSafetyCheck(content: string): Promise<SafetyResult> {
  const rule = ruleBasedMessageCheck(content);
  if (!isLocalAIEnabled() || !content?.trim()) return rule;

  const prompt = `Analyze this chat message for safety. Look for: harassment, threats, scam, moving off-platform, inappropriate content.
Message: "${content.slice(0, 400)}"
Respond JSON only: {"score":0-100,"status":"low_risk|medium_risk|high_risk","reasons":["reason1"]}
If safe, score 80+. If concerning, add reasons.`;

  try {
    const parsed = await callOllamaJson<{ score?: number; status?: string; reasons?: string[] }>(
      prompt,
      {},
      { maxTokens: 200 }
    );
    const score = Math.min(100, Math.max(0, Number(parsed.score) ?? rule.score));
    const status = (parsed.status as SafetyStatus) ?? rule.status;
    const reasons = Array.isArray(parsed.reasons) ? parsed.reasons : rule.reasons;
    return {
      score,
      status,
      reasons,
      flagged: status !== "low_risk" || reasons.length > 0,
    };
  } catch {
    return rule;
  }
}
