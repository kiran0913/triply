"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Wallet,
  User,
  Loader2,
  AlertCircle,
  LogIn,
  LogOut,
  MessageCircle,
  Star,
} from "lucide-react";
import { TripItinerarySection } from "@/components/trip/TripItinerarySection";
import { TripCopilotPanel } from "@/components/trip/TripCopilotPanel";
import { ShareButton } from "@/components/trip/ShareButton";
import { CreateStoryForm } from "@/components/stories/CreateStoryForm";
import { Button } from "@/components/Button";
import { PageContainer } from "@/components/layout";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const DEFAULT_TRIP_IMAGE =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop";
const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop";

type TripDetail = {
  id: string;
  slug?: string | null;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string | null;
  travelStyle: string | null;
  description: string | null;
  status: string;
  host: {
    id: string;
    name: string | null;
    profilePhoto: string | null;
    location: string | null;
    bio: string | null;
  };
  members: Array<{
    userId: string;
    role: string;
    user: {
      id: string;
      name: string | null;
      profilePhoto: string | null;
      location: string | null;
    };
  }>;
};

function formatDates(start: string, end: string) {
  try {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} – ${e.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })}`;
  } catch {
    return "—";
  }
}

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const id = params?.id as string;

  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [itineraryKey, setItineraryKey] = useState(0);

  const loadTrip = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<TripDetail>(`/api/trips/${id}`);
      setTrip(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load trip");
      setTrip(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTrip();
  }, [loadTrip]);

  const isMember = trip?.members.some((m) => m.userId === currentUser?.id);
  const isHost = trip?.host.id === currentUser?.id;
  const tripEnded = trip
    ? trip.status === "CLOSED" || new Date(trip.endDate) < new Date()
    : false;

  const handleJoin = async () => {
    if (!id || joinLoading || !currentUser) return;
    setJoinLoading(true);
    try {
      const updated = await apiFetch<TripDetail>(`/api/trips/${id}/join`, {
        method: "POST",
      });
      setTrip(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to join trip");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!id || leaveLoading || !currentUser) return;
    setLeaveLoading(true);
    try {
      await apiFetch(`/api/trips/${id}/leave`, { method: "POST" });
      await loadTrip();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to leave trip");
    } finally {
      setLeaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[300px] gap-4">
        <Loader2 className="w-12 h-12 text-[#FF6B35] animate-spin" />
        <p className="text-gray-500">Loading trip...</p>
      </div>
    );
  }

  if (error && !trip) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[300px] gap-4 p-6">
        <AlertCircle className="w-12 h-12 text-amber-500" />
        <p className="text-gray-700 font-medium">{error}</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => router.back()}>
            Go back
          </Button>
          <Button variant="primary" onClick={loadTrip}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[300px] gap-4">
        <p className="text-gray-500">Trip not found.</p>
        <Link href="/explore" className="text-primary-600 font-medium hover:underline">
          Explore trips
        </Link>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[300px] gap-4">
        <LogIn className="w-12 h-12 text-[#FF6B35]" />
        <p className="text-gray-600">Log in to view trip details and join.</p>
        <Link href="/login">
          <Button>Log in</Button>
        </Link>
      </div>
    );
  }

  return (
    <PageContainer>
    <div className="w-full max-w-2xl mx-auto space-y-8 min-w-0">
      {error && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-3 text-amber-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-amber-600 hover:underline text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

        <div className="rounded-3xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 bg-white transition-shadow min-w-0">
        <div className="aspect-[16/10] relative">
          <Image
            src={DEFAULT_TRIP_IMAGE}
            alt={trip.destination}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                trip.status === "OPEN"
                  ? "bg-primary-500/90 text-white"
                  : "bg-gray-500/90 text-white"
              }`}
            >
              {trip.status}
            </span>
            <h1 className="text-2xl font-bold text-white mt-2">{trip.title}</h1>
            <p className="text-white/90">{trip.destination}</p>
            <p className="text-sm text-white/80 mt-1">
              {formatDates(trip.startDate, trip.endDate)}
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[#FF6B35]" />
              <div>
                <p className="text-sm font-medium text-gray-900">Destination</p>
                <p className="text-gray-500">{trip.destination}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#FF6B35]" />
              <div>
                <p className="text-sm font-medium text-gray-900">Dates</p>
                <p className="text-gray-500">
                  {formatDates(trip.startDate, trip.endDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-[#FF6B35]" />
              <div>
                <p className="text-sm font-medium text-gray-900">Budget</p>
                <p className="text-gray-500">{trip.budget ?? "—"}</p>
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
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Description
              </h3>
              <p className="text-gray-600 whitespace-pre-wrap">{trip.description}</p>
            </div>
          )}

          {isMember && currentUser && tripEnded && (
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Share your story</h3>
              <p className="text-sm text-gray-600 mb-3">
                Tell others about your experience. Add photos and highlights.
              </p>
              <CreateStoryForm
                tripId={trip.id}
                tripTitle={trip.title}
                tripDestination={trip.destination}
                onCreated={() => {}}
              />
            </div>
          )}

          {isMember && currentUser && (
            <>
              <TripCopilotPanel
                tripId={trip.id}
                onItineraryRefresh={() => setItineraryKey((k) => k + 1)}
              />
                <div className="p-4 rounded-xl bg-primary-50/50 border border-primary-100">
                <TripItinerarySection
                  key={itineraryKey}
                  tripId={trip.id}
                  currentUserId={currentUser.id}
                  startDate={trip.startDate}
                  endDate={trip.endDate}
                />
              </div>
            </>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Trip members ({trip.members.length})
            </h3>
            <div className="space-y-3">
              {trip.members.map((m) => (
                <div
                  key={m.userId}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <Image
                    src={m.user.profilePhoto || DEFAULT_AVATAR}
                    alt={m.user.name ?? "Member"}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover"
                    unoptimized
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 truncate">
                        {m.user.name ?? "Traveler"}
                      </p>
                      {m.role === "HOST" && (
                        <span className="text-xs bg-primary-100 text-[#FF6B35] px-2 py-0.5 rounded-full">
                          Host
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">
                      {m.user.location ?? "—"}
                    </p>
                  </div>
                  {currentUser?.id !== m.userId && (
                    <div className="flex items-center gap-1">
                      <Button
                        to={`/profile/${m.userId}`}
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <MessageCircle className="w-4 h-4" /> Chat
                      </Button>
                      {isMember && tripEnded && (
                        <Button
                          to={`/profile/${m.userId}?tripId=${trip.id}`}
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-1 text-amber-600 hover:text-amber-700"
                        >
                          <Star className="w-4 h-4" /> Review
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100 items-center">
            {trip.slug && trip.status === "OPEN" && (
              <ShareButton
                tripId={trip.id}
                slug={trip.slug}
                title={trip.title}
                destination={trip.destination}
              />
            )}
            {isHost ? (
              <p className="text-gray-500 text-sm">You are the host of this trip.</p>
            ) : isMember ? (
              <Button
                variant="secondary"
                onClick={handleLeave}
                disabled={leaveLoading}
                className="flex items-center gap-2"
              >
                {leaveLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogOut className="w-4 h-4" />
                )}{" "}
                Leave trip
              </Button>
            ) : trip.status === "OPEN" ? (
              <Button
                onClick={handleJoin}
                disabled={joinLoading}
                className="flex items-center gap-2"
              >
                {joinLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <User className="w-4 h-4" />
                )}{" "}
                Join trip
              </Button>
            ) : (
              <p className="text-gray-500 text-sm">
                This trip is not open for new members.
              </p>
            )}
            {!isHost && trip.host && (
              <Button
                to={`/profile/${trip.host.id}`}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> Message host
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <Link href="/explore" className="text-[#FF6B35] font-medium hover:underline text-sm">
          ← Back to explore
        </Link>
      </div>
    </div>
    </PageContainer>
  );
}
