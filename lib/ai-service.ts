/**
 * AI service: 100% local via Ollama. Cache → Ollama.
 */

import { callOllama, callOllamaJson, isLocalAIEnabled } from "./ai-local";
import { parseAIJson } from "./ai";
import { getAICache, setAICache, buildRequestHash } from "./ai-cache";

// ---------- Trip Plan ----------

export interface TripPlanParams {
  destination: string;
  startDate: string;
  endDate: string;
  budget?: string;
  travelStyle?: string;
  interests?: string[];
}

export interface TripPlanResponse {
  destination: string;
  dates: string;
  days: Array<{
    day: number;
    title: string;
    activities?: Array<{
      time?: string;
      title: string;
      description?: string;
      estimatedCost?: string;
    }>;
  }>;
  totalEstimatedCost?: string;
}

const TRIP_PLAN_CACHE_DAYS = 7;

const tripPlanLocalPrompt = (p: TripPlanParams, dateRange: string) =>
  `Create a trip plan. Destination: ${p.destination}. Dates: ${dateRange}. Budget: ${p.budget || "flexible"}. Style: ${p.travelStyle || "general"}. Interests: ${Array.isArray(p.interests) && p.interests.length ? p.interests.join(", ") : "exploration"}

Return ONLY valid JSON, no markdown:
{"destination":"${p.destination}","dates":"${dateRange}","days":[{"day":1,"title":"Day title","activities":[{"time":"09:00","title":"Activity","description":"Brief","estimatedCost":"$20"}]}],"totalEstimatedCost":"$X"}
1-4 activities per day.`;

export async function generateTripPlan(
  params: TripPlanParams
): Promise<{ plan: TripPlanResponse; source: "cache" | "local" }> {
  const dateRange = `${params.startDate} to ${params.endDate}`;
  const requestPayload = {
    destination: params.destination,
    startDate: params.startDate,
    endDate: params.endDate,
    budget: params.budget ?? "",
    travelStyle: params.travelStyle ?? "",
    interests: Array.isArray(params.interests) ? [...params.interests].sort() : [],
  };
  const requestHash = buildRequestHash(requestPayload);
  const cacheKey = `trip-plan:${params.destination}:${dateRange}`;

  const cached = await getAICache<TripPlanResponse>(requestHash, "trip-plan");
  if (cached && Array.isArray(cached.days) && cached.days.length > 0) {
    return { plan: cached, source: "cache" };
  }

  const fallbackPlan: TripPlanResponse = {
    destination: params.destination,
    dates: dateRange,
    days: [],
  };

  if (!isLocalAIEnabled()) {
    return { plan: fallbackPlan, source: "local" };
  }

  const localPlan = await callOllamaJson<TripPlanResponse>(
    tripPlanLocalPrompt(params, dateRange),
    fallbackPlan,
    { maxTokens: 600 }
  );
  if (localPlan.days && localPlan.days.length > 0) {
    const plan: TripPlanResponse = {
      destination: localPlan.destination ?? params.destination,
      dates: localPlan.dates ?? dateRange,
      days: localPlan.days,
      totalEstimatedCost: localPlan.totalEstimatedCost,
    };
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + TRIP_PLAN_CACHE_DAYS);
    await setAICache(requestHash, cacheKey, "trip-plan", plan, expiresAt);
    return { plan, source: "local" };
  }

  return { plan: fallbackPlan, source: "local" };
}

// ---------- Recommendations ----------

export interface RecommendParams {
  userProfile: string;
  tripsSummary: string;
}

const RECOMMEND_CACHE_DAYS = 1;

const recommendLocalPrompt = (p: RecommendParams) =>
  `Rank trips by relevance. User: ${p.userProfile}
Trips: ${p.tripsSummary}
Return JSON only: {"trips":[{"id":"trip-id","matchPercent":90},...]} IDs from list, best first.`;

function extractJson(text: string): string | null {
  const match = text.trim().match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

export async function generateRecommendations(
  params: RecommendParams,
  cacheKey: string,
  requestHash: string
): Promise<{
  content: string | null;
  cachedOutput?: unknown;
  source: "cache" | "local";
}> {
  const cached = await getAICache<{ content: string } | unknown[]>(requestHash, "recommend-trips");
  if (cached) {
    if (Array.isArray(cached)) {
      return { content: null, cachedOutput: cached, source: "cache" };
    }
    if (cached && typeof cached === "object" && "content" in cached && (cached as { content: string }).content) {
      return { content: (cached as { content: string }).content, source: "cache" };
    }
  }

  if (!isLocalAIEnabled()) {
    return { content: null, source: "local" };
  }

  const raw = await callOllama(recommendLocalPrompt(params), { maxTokens: 500 });
  if (raw && extractJson(raw)) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + RECOMMEND_CACHE_DAYS);
    await setAICache(requestHash, cacheKey, "recommend-trips", { content: raw }, expiresAt);
    return { content: raw, source: "local" };
  }

  return { content: null, source: "local" };
}

// ---------- Assistant ----------

export async function generateAssistantResponse(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>
): Promise<{ content: string | null; source: "local" }> {
  const fullPrompt = messages
    .map((m) => (m.role === "system" ? `System: ${m.content}` : `${m.role}: ${m.content}`))
    .join("\n\n");

  if (!isLocalAIEnabled()) {
    return { content: null, source: "local" };
  }

  const raw = await callOllama(fullPrompt, { maxTokens: 600 });
  if (raw && extractJson(raw)) {
    return { content: raw, source: "local" };
  }
  if (raw) {
    return { content: raw, source: "local" };
  }

  return { content: null, source: "local" };
}
