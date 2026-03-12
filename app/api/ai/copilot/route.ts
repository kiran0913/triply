import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { isTripMember } from "@/lib/trip-helpers";
import { parseAIJson } from "@/lib/ai";
import { callOllama, isLocalAIEnabled } from "@/lib/ai-local";
import { copilotMessageSchema } from "@/lib/validations";
import { checkRateLimit, checkAiRateLimit } from "@/lib/rate-limit";
import { getAICache, setAICache, buildRequestHash } from "@/lib/ai-cache";
import { createHash } from "crypto";
import { ruleBasedMessageCheck } from "@/lib/safety";

export interface CopilotSuggestedActivity {
  dayNumber?: number;
  title: string;
  description?: string;
  time?: string;
  costEstimate?: string;
}

export interface CopilotItineraryUpdate {
  dayNumber: number;
  title: string;
  description?: string;
  time?: string;
  costEstimate?: string;
}

export interface CopilotResponse {
  reply: string;
  suggestedActivities?: CopilotSuggestedActivity[];
  itineraryUpdates?: CopilotItineraryUpdate[];
}

const COPILOT_CACHE_HOURS = 2;

function hashMessage(msg: string): string {
  return createHash("sha256").update(msg).digest("hex").slice(0, 16);
}

function extractJson(text: string): string | null {
  const match = text.trim().match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get("tripId");
    if (!tripId) {
      return NextResponse.json({ error: "tripId is required" }, { status: 400 });
    }

    const member = await isTripMember(tripId, userId);
    if (!member) {
      return NextResponse.json({ error: "Not a trip member" }, { status: 403 });
    }

    const messages = await prisma.tripCopilotMessage.findMany({
      where: { tripId },
      orderBy: { createdAt: "asc" },
      take: 50,
      select: { id: true, role: true, message: true, createdAt: true, userId: true },
    });

    return NextResponse.json(messages);
  } catch (e) {
    console.error("[AI Copilot GET] error:", e);
    return NextResponse.json({ error: "Failed to load Copilot history" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const rateLimitRes = checkRateLimit(request, "ai", 15, 60);
  if (rateLimitRes) return rateLimitRes;

  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const aiLimitRes = checkAiRateLimit(userId);
    if (aiLimitRes) return aiLimitRes;

    const body = await request.json();
    const parsed = copilotMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { tripId, message } = parsed.data;

    const member = await isTripMember(tripId, userId);
    if (!member) {
      return NextResponse.json({ error: "Not a trip member" }, { status: 403 });
    }

    const safety = ruleBasedMessageCheck(message);
    if (safety.flagged) {
      return NextResponse.json(
        { error: "Message contains content that cannot be processed" },
        { status: 400 }
      );
    }

    if (!isLocalAIEnabled()) {
      return NextResponse.json({
        reply: "Trip Copilot is not available. Enable Ollama (ENABLE_LOCAL_AI=true) and run: ollama pull mistral",
        suggestedActivities: [],
        itineraryUpdates: [],
      });
    }

    const [trip, membersWithUsers, itineraryItems, recentMessages] = await Promise.all([
      prisma.trip.findUnique({
        where: { id: tripId },
        select: { title: true, destination: true, startDate: true, endDate: true, budget: true, travelStyle: true, description: true },
      }),
      prisma.tripMember.findMany({
        where: { tripId },
        include: {
          user: { select: { name: true, interests: true, travelStyle: true, budgetRange: true } },
        },
      }),
      prisma.itineraryItem.findMany({
        where: { tripId },
        orderBy: [{ dayNumber: "asc" }, { position: "asc" }],
        select: { dayNumber: true, title: true, description: true, startTime: true, costEstimate: true },
      }),
      prisma.tripCopilotMessage.findMany({
        where: { tripId },
        orderBy: { createdAt: "desc" },
        take: 12,
        select: { role: true, message: true },
      }),
    ]);

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const messageHash = hashMessage(message);
    const requestPayload = { tripId, message, messageHash };
    const requestHash = buildRequestHash(requestPayload);
    const cacheKey = `copilot:${tripId}:${messageHash}`;

    const cached = await getAICache<CopilotResponse>(requestHash, "copilot");
    if (cached?.reply) {
      return NextResponse.json(cached);
    }

    const membersContext = membersWithUsers
      .map(
        (m) =>
          `- ${m.user.name ?? "Traveler"}: interests ${JSON.stringify(m.user.interests)}, style ${JSON.stringify(m.user.travelStyle)}, budget ${m.user.budgetRange ?? "flexible"}`
      )
      .join("\n");

    const itineraryContext =
      itineraryItems.length > 0
        ? itineraryItems
            .map(
              (i) =>
                `Day ${i.dayNumber}: ${i.title}${i.startTime ? ` (${i.startTime})` : ""}${i.costEstimate ? ` ~${i.costEstimate}` : ""}${i.description ? ` - ${i.description}` : ""}`
            )
            .join("\n")
        : "No activities planned yet.";

    const chatHistory = [...recentMessages].reverse();
    const historyBlock =
      chatHistory.length > 0
        ? "Recent conversation:\n" +
          chatHistory.map((m) => `${m.role}: ${m.message}`).join("\n")
        : "";

    const systemPrompt = `You are a Trip Copilot helping a group plan their trip to ${trip.destination}.
Trip: ${trip.title}
Dates: ${trip.startDate.toISOString().slice(0, 10)} - ${trip.endDate.toISOString().slice(0, 10)}
Budget: ${trip.budget ?? "flexible"}
Travel style: ${trip.travelStyle ?? "general"}
Description: ${trip.description ?? "—"}

Members and their preferences:
${membersContext}

Current itinerary:
${itineraryContext}

${historyBlock}

Answer the user's question helpfully. When relevant, return structured JSON with:
- reply: your main text response
- suggestedActivities: optional array of { dayNumber?, title, description?, time?, costEstimate? }
- itineraryUpdates: optional array of { dayNumber, title, description?, time?, costEstimate? } for full-day or multi-day suggestions

If the user asks for planning, budget estimation, activity suggestions, or optimization, include suggestedActivities or itineraryUpdates.
Return JSON when you have structured suggestions; otherwise return plain text in the reply field only.`;

    const fullPrompt = `${systemPrompt}\n\nUser: ${message}\n\nRespond with valid JSON: {"reply":"...","suggestedActivities":[...],"itineraryUpdates":[...]}`;

    const raw = await callOllama(fullPrompt, { maxTokens: 800 });

    const defaultResponse: CopilotResponse = {
      reply: raw && raw.length > 0 ? raw : "I couldn't generate a response. Please try again.",
      suggestedActivities: [],
      itineraryUpdates: [],
    };

    if (!raw) {
      return NextResponse.json(defaultResponse);
    }

    const jsonStr = extractJson(raw);
    let result: CopilotResponse = defaultResponse;
    if (jsonStr) {
      const parsed = parseAIJson<{
        reply?: string;
        suggestedActivities?: CopilotSuggestedActivity[];
        itineraryUpdates?: CopilotItineraryUpdate[];
      }>(jsonStr, {});
      result = {
        reply: parsed.reply ?? (raw.length > 0 ? raw : defaultResponse.reply),
        suggestedActivities: Array.isArray(parsed.suggestedActivities) ? parsed.suggestedActivities.slice(0, 10) : [],
        itineraryUpdates: Array.isArray(parsed.itineraryUpdates) ? parsed.itineraryUpdates.slice(0, 10) : [],
      };
    } else {
      result = { reply: raw, suggestedActivities: [], itineraryUpdates: [] };
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + COPILOT_CACHE_HOURS);
    await setAICache(requestHash, cacheKey, "copilot", result, expiresAt);

    await prisma.tripCopilotMessage.createMany({
      data: [
        { tripId, userId, message, role: "user" },
        { tripId, userId, message: result.reply, role: "assistant" },
      ],
    });

    return NextResponse.json(result);
  } catch (e) {
    console.error("[AI Copilot] error:", e);
    return NextResponse.json(
      {
        reply: "Something went wrong. Please try again.",
        suggestedActivities: [],
        itineraryUpdates: [],
      },
      { status: 500 }
    );
  }
}
