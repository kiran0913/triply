import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth-helpers";
import { createTripSchema } from "@/lib/validations";
import { generateTripSlug, ensureUniqueSlug } from "@/lib/slug";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            profilePhoto: true,
            location: true,
            bio: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profilePhoto: true,
                location: true,
              },
            },
          },
        },
      },
    });
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    return NextResponse.json(trip);
  } catch (e) {
    console.error("Get trip error:", e);
    return NextResponse.json({ error: "Failed to get trip" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    if (trip.hostUserId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createTripSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (updateData.startDate)
      updateData.startDate = new Date(updateData.startDate as string);
    if (updateData.endDate)
      updateData.endDate = new Date(updateData.endDate as string);

    if (parsed.data.status === "OPEN") {
      updateData.isPublic = true;
      if (!trip.slug) {
        const baseSlug = generateTripSlug(
          trip.title,
          trip.destination,
          trip.startDate
        );
        const slug = await ensureUniqueSlug(baseSlug, async (s) => {
          const t = await prisma.trip.findUnique({ where: { slug: s } });
          return !!t;
        });
        updateData.slug = slug;
      }
    }

    const updated = await prisma.trip.update({
      where: { id },
      data: updateData,
      include: {
        host: { select: { id: true, name: true, profilePhoto: true } },
        _count: { select: { members: true } },
      },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error("Update trip error:", e);
    return NextResponse.json({ error: "Failed to update trip" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getCurrentUserId(_request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const trip = await prisma.trip.findUnique({ where: { id } });
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    if (trip.hostUserId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.trip.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  } catch (e) {
    console.error("Delete trip error:", e);
    return NextResponse.json({ error: "Failed to delete trip" }, { status: 500 });
  }
}
