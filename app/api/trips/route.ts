import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { createTripSchema } from "@/lib/validations";
import { ruleBasedTripCheck } from "@/lib/safety";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateTripSlug, ensureUniqueSlug } from "@/lib/slug";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const destination = searchParams.get("destination")?.trim();
    const style = searchParams.get("style")?.trim();
    const budget = searchParams.get("budget")?.trim();
    const startAfter = searchParams.get("startAfter")?.trim();
    const endBefore = searchParams.get("endBefore")?.trim();

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status as "DRAFT" | "OPEN" | "CLOSED";
    }
    if (destination) {
      where.destination = { contains: destination, mode: "insensitive" };
    }
    if (style) {
      where.travelStyle = { contains: style, mode: "insensitive" };
    }
    if (budget) {
      where.budget = { contains: budget, mode: "insensitive" };
    }
    if (startAfter) {
      const d = new Date(startAfter);
      if (!isNaN(d.getTime())) {
        where.startDate = { gte: d };
      }
    }
    if (endBefore) {
      const d = new Date(endBefore);
      if (!isNaN(d.getTime())) {
        where.endDate = { lte: d };
      }
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        host: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            location: true,
          },
        },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(trips);
  } catch (e) {
    console.error("List trips error:", e);
    return NextResponse.json({ error: "Failed to list trips" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const rateLimitRes = checkRateLimit(request, "trips-post", 5, 60);
  if (rateLimitRes) return rateLimitRes;

  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createTripSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { title, destination, startDate, endDate, budget, travelStyle, description, status } =
      parsed.data;

    const tripSafety = ruleBasedTripCheck(description ?? null);
    if (tripSafety.status === "high_risk") {
      return NextResponse.json(
        { error: "Trip description contains content that may violate our guidelines. Please revise." },
        { status: 400 }
      );
    }

    const baseSlug = generateTripSlug(title, destination, startDate);
    const slug = await ensureUniqueSlug(baseSlug, async (s) => {
      const t = await prisma.trip.findUnique({ where: { slug: s } });
      return !!t;
    });

    const trip = await prisma.trip.create({
      data: {
        title,
        destination,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        budget: budget ?? null,
        travelStyle: travelStyle ?? null,
        description: description ?? null,
        status: (status as "DRAFT" | "OPEN" | "CLOSED") ?? "DRAFT",
        hostUserId: userId,
        slug,
        isPublic: status === "OPEN",
        members: {
          create: { userId, role: "HOST" },
        },
      },
      include: {
        host: {
          select: { id: true, name: true, profilePhoto: true },
        },
        _count: { select: { members: true } },
      },
    });
    return NextResponse.json(trip, { status: 201 });
  } catch (e) {
    console.error("Create trip error:", e);
    return NextResponse.json({ error: "Failed to create trip" }, { status: 500 });
  }
}
