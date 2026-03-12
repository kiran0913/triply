"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/Card";
import { VerificationBadge } from "@/components/VerificationBadge";
import { Button } from "@/components/Button";
import { AITripPlannerModal } from "@/components/AITripPlannerModal";
import { PageContainer, PageHeader, SectionCard, ListItem } from "@/components/layout";
import { apiFetch } from "@/lib/api";
import { MOCK_DESTINATIONS } from "@/data/mockData";

type RecommendedTrip = {
  id: string;
  destination: string;
  title: string;
  startDate: string;
  endDate: string;
  budget: string | null;
  travelStyle: string | null;
  matchPercent: number;
  hostName: string | null;
  membersCount: number;
};

type DashboardData = {
  user: { id: string; name: string | null; email: string; profilePhoto: string | null };
  upcomingTrip: { destination: string; startDate: string; endDate: string } | null;
  matches: Array<{
    id: string;
    name: string | null;
    location: string | null;
    bio: string | null;
    verified: boolean;
    verificationStatus?: { level: string; trustedBadge?: boolean };
    matchPercent: number;
    image: string | null;
  }>;
  trips: Array<{
    id: string;
    destination: string;
    budget: string | null;
    style: string | null;
    travelers: number;
    image: string;
  }>;
  messages: Array<{
    id: string;
    from: string;
    preview: string;
    time: string;
    unread: boolean;
  }>;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recommendedTrips, setRecommendedTrips] = useState<RecommendedTrip[]>([]);
  const [showAIPlanner, setShowAIPlanner] = useState(false);

  useEffect(() => {
    apiFetch<DashboardData>("/api/dashboard")
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    apiFetch<RecommendedTrip[]>("/api/ai/recommend-trips")
      .then(setRecommendedTrips)
      .catch(() => setRecommendedTrips([]));
  }, []);

  if (loading) {
    return (
      <PageContainer>
        <div className="h-10 w-64 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-red-600">{error || "Failed to load dashboard"}</p>
          <Link href="/login" className="text-[#FF6B35] mt-4 inline-block font-medium">
            Try logging in again
          </Link>
        </div>
      </PageContainer>
    );
  }

  const userName = data.user?.name || "Traveler";
  const formatTripDates = (start: string, end: string) => {
    try {
      const s = new Date(start);
      const e = new Date(end);
      return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.toLocaleDateString("en-US", { day: "numeric", month: "short" })}`;
    } catch {
      return "—";
    }
  };
  const tripDates = data.upcomingTrip
    ? `${new Date(data.upcomingTrip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}–${new Date(data.upcomingTrip.endDate).toLocaleDateString("en-US", { day: "numeric", month: "short" })}`
    : null;

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome back, ${userName}`}
        description="Find your perfect travel buddy for your next adventure"
        actions={
          <Button onClick={() => setShowAIPlanner(true)} variant="secondary" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> AI Trip Planner
          </Button>
        }
      />
      <AITripPlannerModal isOpen={showAIPlanner} onClose={() => setShowAIPlanner(false)} />

      {/* Section 1: Upcoming trips */}
      {data.upcomingTrip && (
        <SectionCard
          title="Upcoming trip plans"
          subtitle={`${data.upcomingTrip.destination} — ${tripDates}`}
          variant="highlight"
        >
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 text-sm font-medium hover:underline text-white"
          >
            View details <ArrowRight className="w-4 h-4" />
          </Link>
        </SectionCard>
      )}

      {/* Section 2: Matches */}
      <SectionCard title="Suggested matches" action={{ label: "View all", href: "/matches" }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.matches.slice(0, 3).map((m) => (
            <motion.div
              key={m.id}
              whileHover={{ y: -2 }}
              className="rounded-2xl bg-white border border-[#E5E7EB] overflow-hidden transition-all duration-200 min-w-0 hover:shadow-md"
            >
              <div className="aspect-[4/3] bg-gray-200 relative flex-shrink-0">
                <Image
                  src={m.image || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop"}
                  alt={m.name || "User"}
                  fill
                  className="object-cover"
                  unoptimized={!!m.image?.startsWith("http")}
                />
                <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-sm font-semibold text-[#FF6B35] shadow-sm">
                  {m.matchPercent}% match
                </span>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{m.name}</h3>
                  {(m.verificationStatus?.trustedBadge ?? m.verified) && (
                    <VerificationBadge status={m.verificationStatus} size="sm" />
                  )}
                </div>
                <p className="text-sm text-slate-500 truncate">{m.location}</p>
                <Link
                  href={`/profile/${m.id}`}
                  className="inline-flex items-center gap-1 text-[#FF6B35] text-sm font-medium hover:underline"
                >
                  View profile <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionCard>

      {/* Section 3: Recent messages */}
      <SectionCard title="Recent messages" action={{ label: "View all", href: "/chat" }}>
        {data.messages.length === 0 ? (
          <p className="text-slate-500 py-4 text-center text-sm">
            No messages yet. Start a conversation from Matches!
          </p>
        ) : (
          <div className="space-y-1 -mx-2">
            {data.messages.map((msg) => (
              <ListItem
                key={msg.id}
                href="/chat"
                avatar={
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-semibold text-primary-700 text-sm">
                    {msg.from[0]}
                  </div>
                }
                main={msg.from}
                secondary={msg.preview}
                action={
                  msg.unread ? (
                    <span className="w-2 h-2 rounded-full bg-[#FF6B35] shrink-0" />
                  ) : undefined
                }
              />
            ))}
          </div>
        )}
      </SectionCard>

      {/* Section 4: Travel safety tips */}
      <Card className="bg-secondary-50/80 border-secondary-200 shadow-sm p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Travel safety tips</h2>
          <p className="text-sm text-slate-600">
            Always meet in public first. Share your itinerary with someone you trust. Verify your match&apos;s profile before meeting.
          </p>
        </div>
      </Card>

      {/* Secondary: Recommended trips */}
      {recommendedTrips.length > 0 && (
        <SectionCard
          title="Recommended trips for you"
          action={{ label: "View all", href: "/explore" }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendedTrips.slice(0, 3).map((t) => (
              <Link key={t.id} href={`/trips/${t.id}`} className="min-w-0 block">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="rounded-2xl overflow-hidden shadow-sm border border-[#E5E7EB] hover:shadow-md transition-all duration-200 bg-white h-full"
                >
                  <div className="relative h-32">
                    <Image
                      src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop"
                      alt={t.destination}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-[#FF6B35]">
                    {t.matchPercent}% match
                  </div>
                  <div className="p-4 space-y-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{t.title}</h3>
                    <p className="text-sm text-slate-500 truncate">{t.destination}</p>
                    <p className="text-xs text-slate-400">
                      {formatTripDates(t.startDate, t.endDate)} • {t.membersCount} travelers
                    </p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Secondary: Popular destinations */}
      <SectionCard title="Popular destinations">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MOCK_DESTINATIONS.map((d) => (
            <motion.div
              key={d.name}
              whileHover={{ y: -2 }}
              className="rounded-2xl overflow-hidden shadow-sm border border-[#E5E7EB] hover:shadow-md transition-all duration-200 min-w-0 relative"
            >
              <div className="relative h-32">
                <Image src={d.image} alt={d.name} fill className="object-cover" unoptimized />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-semibold">{d.name}</h3>
                <p className="text-sm text-white/90">{d.travelers} travelers</p>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionCard>
    </PageContainer>
  );
}
