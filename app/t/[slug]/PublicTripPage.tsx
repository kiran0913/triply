"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  Wallet,
  User,
  Loader2,
  LogIn,
  Share2,
  Check,
  Users,
} from "lucide-react";
import { Button } from "@/components/Button";
import { ShareButton } from "@/components/trip/ShareButton";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";

const DEFAULT_TRIP_IMAGE =
  "https://images.unsplash.com/photo-1488646953014-85cb40e25828?w=600&h=400&fit=crop";
const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop";

type PublicTrip = {
  id: string;
  slug: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string | null;
  travelStyle: string | null;
  description: string | null;
  shareImage: string | null;
  host: { id: string; name: string | null; profilePhoto: string | null; location: string | null; bio: string | null };
  memberCount: number;
  itineraryItems: Array<{
    dayNumber: number;
    title: string;
    description: string | null;
    startTime: string | null;
    costEstimate: string | null;
  }>;
};

function formatDates(start: string, end: string) {
  try {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}`;
  } catch {
    return "—";
  }
}

export function PublicTripPage({ trip, slug }: { trip: PublicTrip; slug: string }) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [joinLoading, setJoinLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  const tripEnded = new Date(trip.endDate) < new Date();

  const handleJoin = async () => {
    if (!currentUser) {
      const returnUrl = `/t/${slug}`;
      router.push(`/signup?redirect=${encodeURIComponent(returnUrl)}&joinTrip=${trip.id}`);
      return;
    }
    if (joinLoading || joined) return;
    setJoinLoading(true);
    try {
      await apiFetch(`/api/trips/${trip.id}/join`, { method: "POST" });
      setJoined(true);
      router.push(`/trips/${trip.id}`);
      router.refresh();
    } catch {
      setJoinLoading(false);
    }
  };

  const activityHighlights = trip.itineraryItems.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary-600">
            Travel Buddy
          </Link>
          <div className="flex items-center gap-2">
            <ShareButton tripId={trip.id} slug={slug} title={trip.title} destination={trip.destination} />
            {currentUser ? (
              <Link href="/dashboard">
                <Button variant="secondary" size="sm">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href={`/login?redirect=${encodeURIComponent(`/t/${slug}`)}`}>
                <Button variant="secondary" size="sm" className="flex items-center gap-1">
                  <LogIn className="w-4 h-4" /> Log in
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="rounded-3xl overflow-hidden shadow-elevated border border-gray-100 bg-white">
          <div className="aspect-[16/10] relative">
            <Image
              src={trip.shareImage || DEFAULT_TRIP_IMAGE}
              alt={trip.destination}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <h1 className="text-2xl font-bold text-white">{trip.title}</h1>
              <p className="text-white/90">{trip.destination}</p>
              <p className="text-sm text-white/80 mt-1">{formatDates(trip.startDate, trip.endDate)}</p>
              <div className="flex items-center gap-2 mt-2 text-white/90">
                <Users className="w-4 h-4" />
                <span>{trip.memberCount} traveler{trip.memberCount !== 1 ? "s" : ""}</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Destination</p>
                  <p className="text-gray-500">{trip.destination}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Dates</p>
                  <p className="text-gray-500">{formatDates(trip.startDate, trip.endDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Wallet className="w-5 h-5 text-primary-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Budget</p>
                  <p className="text-gray-500">{trip.budget ?? "Flexible"}</p>
                </div>
              </div>
              {trip.travelStyle && (
                <div>
                  <p className="text-sm font-medium text-gray-900">Travel style</p>
                  <p className="text-gray-500">{trip.travelStyle}</p>
                </div>
              )}
            </div>

            {trip.description && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">About this trip</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{trip.description}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Host</h3>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <Image
                  src={trip.host.profilePhoto || DEFAULT_AVATAR}
                  alt={trip.host.name ?? "Host"}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover"
                  unoptimized
                />
                <div>
                  <p className="font-medium text-gray-900">{trip.host.name ?? "Traveler"}</p>
                  {trip.host.location && (
                    <p className="text-sm text-gray-500">{trip.host.location}</p>
                  )}
                </div>
              </div>
            </div>

            {activityHighlights.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Itinerary preview</h3>
                <div className="space-y-2">
                  {activityHighlights.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 py-2 px-3 rounded-lg bg-gray-50"
                    >
                      <span className="text-xs font-medium text-primary-600">
                        Day {item.dayNumber}
                      </span>
                      <span className="text-gray-900">{item.title}</span>
                      {item.startTime && (
                        <span className="text-xs text-gray-500">{item.startTime}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!tripEnded && (
              <div className="pt-4 border-t border-gray-100">
                <Button
                  onClick={handleJoin}
                  disabled={joinLoading}
                  className="w-full flex items-center justify-center gap-2 py-4"
                >
                  {joinLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : joined ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}{" "}
                  {joinLoading ? "Joining..." : joined ? "Joined!" : "Join this trip"}
                </Button>
                {!currentUser && (
                  <p className="text-center text-sm text-gray-500 mt-3">
                    Sign up free to join and connect with the host
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-primary-600 font-medium hover:underline text-sm">
            ← Back to Travel Buddy
          </Link>
        </div>
      </main>
    </div>
  );
}
