import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { parseAIJson } from "@/lib/ai";
import { isLocalAIEnabled } from "@/lib/ai-local";
import { assistantMessageSchema } from "@/lib/validations";
import { checkRateLimit, checkAiRateLimit } from "@/lib/rate-limit";
import { generateAssistantResponse } from "@/lib/ai-service";

export interface AssistantItinerarySuggestion {
  destination?: string;
  dates?: string;
  days?: Array<{
    day: number;
    title: string;
    activities?: Array<{ time?: string; title: string; description?: string }>;
  }>;
  totalEstimatedCost?: string;
}

export interface AssistantTripRecommendation {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface AssistantResponse {
  text: string;
  itinerarySuggestions?: AssistantItinerarySuggestion[];
  tripRecommendations?: AssistantTripRecommendation[];
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
    const parsed = assistantMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    if (!isLocalAIEnabled()) {
      return NextResponse.json({
        text: "I'm sorry, the AI assistant is not available. Enable Ollama (ENABLE_LOCAL_AI=true) and run: ollama pull mistral",
        itinerarySuggestions: [],
        tripRecommendations: [],
      });
    }

    const [user, pastTrips, openTrips, matchCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          interests: true,
          travelStyle: true,
          budgetRange: true,
          languages: true,
          location: true,
        },
      }),
      prisma.tripMember.findMany({
        where: { userId },
        include: {
          trip: {
            select: {
              destination: true,
              startDate: true,
              endDate: true,
              title: true,
            },
          },
        },
        orderBy: { trip: { startDate: "desc" } },
        take: 5,
      }),
      prisma.trip.findMany({
        where: { status: "OPEN" },
        include: {
          host: { select: { id: true, name: true } },
          _count: { select: { members: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 15,
      }),
      prisma.match.count({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
      }),
    ]);

    const userContext = user
      ? `Name: ${user.name ?? "Traveler"}\nInterests: ${JSON.stringify(user.interests ?? [])}\nTravel style: ${JSON.stringify(user.travelStyle ?? [])}\nBudget: ${user.budgetRange ?? "flexible"}\nLanguages: ${JSON.stringify(user.languages ?? [])}\nLocation: ${user.location ?? "Not specified"}`
      : "No profile data";

    const pastTripsSummary =
      pastTrips.length > 0
        ? pastTrips
            .map(
              (m) =>
                `- ${m.trip.title} (${m.trip.destination}) ${m.trip.startDate.toISOString().slice(0, 10)} - ${m.trip.endDate.toISOString().slice(0, 10)}`
            )
            .join("\n")
        : "None";

    const openTripsData = openTrips.map((t) => ({
      id: t.id,
      title: t.title,
      destination: t.destination,
      startDate: t.startDate.toISOString().slice(0, 10),
      endDate: t.endDate.toISOString().slice(0, 10),
      budget: t.budget,
      travelStyle: t.travelStyle,
      hostName: t.host.name,
      membersCount: t._count.members,
    }));

    const systemPrompt = `You are a travel assistant for Travel Buddy Finder. User context: ${userContext}. Past trips: ${pastTripsSummary}. Open trips: ${JSON.stringify(openTripsData)}. User has ${matchCount} matches. Suggest destinations, recommend trips (use trip IDs from list), generate itineraries. Respond ONLY with JSON: {"text":"...","itinerarySuggestions":[...],"tripRecommendations":[{"id":"...","title":"...","destination":"...","startDate":"...","endDate":"...","reason":"..."}]}. Omit itinerarySuggestions/tripRecommendations if not relevant.`;

    const messages: Array<{ role: "user" | "assistant" | "system"; content: string }> = [
      { role: "system", content: systemPrompt },
      ...(parsed.data.messages ?? []).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: parsed.data.message },
    ];

    const { content, source } = await generateAssistantResponse(messages);

    const defaultResponse: AssistantResponse = {
      text: "I couldn't generate a response. Please try again.",
      itinerarySuggestions: [],
      tripRecommendations: [],
    };

    if (!content) {
      return NextResponse.json(defaultResponse);
    }

    const parsedResponse = parseAIJson<{
      text?: string;
      itinerarySuggestions?: AssistantItinerarySuggestion[];
      tripRecommendations?: AssistantTripRecommendation[];
    }>(content, {});

    const text = parsedResponse.text ?? (content.trim().length > 0 ? content.trim() : defaultResponse.text);
    const itinerarySuggestions = Array.isArray(parsedResponse.itinerarySuggestions)
      ? parsedResponse.itinerarySuggestions.filter(
          (s) => s && typeof s === "object" && (s.destination || s.days)
        )
      : [];
    let tripRecommendations = Array.isArray(parsedResponse.tripRecommendations)
      ? parsedResponse.tripRecommendations
      : [];

    const validTripIds = new Set(openTrips.map((t) => t.id));
    tripRecommendations = tripRecommendations.filter(
      (r) => r?.id && validTripIds.has(r.id)
    );
    tripRecommendations = tripRecommendations.map((r) => {
      const t = openTrips.find((x) => x.id === r.id);
      return {
        id: r.id,
        title: t?.title ?? r.title ?? "",
        destination: t?.destination ?? r.destination ?? "",
        startDate: t?.startDate.toISOString().slice(0, 10) ?? r.startDate ?? "",
        endDate: t?.endDate.toISOString().slice(0, 10) ?? r.endDate ?? "",
        reason: r.reason,
      };
    });

    return NextResponse.json({
      text,
      itinerarySuggestions,
      tripRecommendations,
    });
  } catch (e) {
    console.error("[AI Assistant] error:", e);
    return NextResponse.json(
      {
        text: "Something went wrong. Please try again.",
        itinerarySuggestions: [],
        tripRecommendations: [],
      },
      { status: 500 }
    );
  }
}
