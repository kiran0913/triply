import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PublicTripPage } from "./PublicTripPage";

const BASE_URL = process.env.APP_BASE_URL || process.env.NEXTAUTH_URL || "https://travelbuddy.app";

async function getTripBySlug(slug: string) {
  const trip = await prisma.trip.findUnique({
    where: { slug, isPublic: true, status: "OPEN" },
    include: {
      host: {
        select: { id: true, name: true, profilePhoto: true, location: true, bio: true },
      },
      _count: { select: { members: true } },
      itineraryItems: {
        orderBy: [{ dayNumber: "asc" }, { position: "asc" }],
        take: 20,
        select: { dayNumber: true, title: true, description: true, startTime: true, costEstimate: true },
      },
    },
  });
  if (!trip) return null;
  return {
    ...trip,
    startDate: trip.startDate.toISOString(),
    endDate: trip.endDate.toISOString(),
    memberCount: trip._count.members,
    itineraryItems: trip.itineraryItems,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);
  if (!trip) return { title: "Trip not found" };

  const title = `${trip.title} | ${trip.destination} | Travel Buddy`;
  const description =
    trip.description?.slice(0, 160) ||
    `Join ${trip.title} - ${trip.destination}. ${trip.memberCount} travelers. ${formatDateRange(trip.startDate, trip.endDate)}.`;
  const ogImage = trip.shareImage || "https://images.unsplash.com/photo-1488646953014-85cb40e25828?w=1200&h=630&fit=crop";
  const canonical = `${BASE_URL}/t/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Travel Buddy",
      images: [{ url: ogImage, width: 1200, height: 630, alt: trip.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

function formatDateRange(start: string, end: string): string {
  try {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} – ${e.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  } catch {
    return "";
  }
}

export default async function PublicTripRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);
  if (!trip) notFound();
  const tripWithSlug = { ...trip, slug: trip.slug ?? slug };
  return <PublicTripPage trip={tripWithSlug} slug={slug} />;
}
