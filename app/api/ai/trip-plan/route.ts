import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { isLocalAIEnabled } from "@/lib/ai-local";
import { aiTripPlanSchema } from "@/lib/validations";
import { checkRateLimit, checkAiRateLimit } from "@/lib/rate-limit";
import { generateTripPlan } from "@/lib/ai-service";

export interface TripPlanDay {
  day: number;
  title: string;
  activities: Array<{
    time?: string;
    title: string;
    description?: string;
    estimatedCost?: string;
  }>;
}

export interface TripPlanResponse {
  destination: string;
  dates: string;
  days: TripPlanDay[];
  totalEstimatedCost?: string;
}

export async function POST(request: NextRequest) {
  const rateLimitRes = checkRateLimit(request, "ai", 10, 60);
  if (rateLimitRes) return rateLimitRes;

  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const aiLimitRes = checkAiRateLimit(userId);
    if (aiLimitRes) return aiLimitRes;

    const body = await request.json();
    const parsed = aiTripPlanSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { destination, startDate, endDate, budget, travelStyle, interests } = parsed.data;

    if (!isLocalAIEnabled()) {
      return NextResponse.json(
        { error: "AI trip planner is not available. Enable Ollama (ENABLE_LOCAL_AI=true) and run: ollama pull mistral" },
        { status: 503 }
      );
    }

    const { plan, source } = await generateTripPlan({
      destination,
      startDate,
      endDate,
      budget,
      travelStyle,
      interests,
    });

    if (!Array.isArray(plan.days) || plan.days.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate trip plan" },
        { status: 500 }
      );
    }

    return NextResponse.json(plan);
  } catch (e) {
    console.error("[AI Trip Plan] error:", e);
    return NextResponse.json(
      { error: "Failed to generate trip plan" },
      { status: 500 }
    );
  }
}
