"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Calendar, Users } from "lucide-react";

type PublicTrip = {
  id: string;
  slug: string | null;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string | null;
  memberCount: number;
  host: { id: string; name: string | null; profilePhoto: string | null };
};

const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1488646953014-85cb40e25828?w=400&h=300&fit=crop";

function formatDates(start: string, end: string) {
  try {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}`;
  } catch {
    return "—";
  }
}

export default function PublicTripsPage() {
  const [trips, setTrips] = useState<PublicTrip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trips/public")
      .then((r) => r.json())
      .then((data) => setTrips(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link href="/" className="text-xl font-bold text-primary-600">
            Travel Buddy
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Discover public trips
          </h1>
          <p className="mt-1 text-gray-600">
            Browse open trips and find your next adventure
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl bg-gray-200 animate-pulse h-48" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            No public trips yet. Create one and share it!
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map((t) => (
              <Link
                key={t.id}
                href={t.slug ? `/t/${t.slug}` : "#"}
                className="block rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-[4/3] relative bg-gray-100">
                  <Image
                    src={DEFAULT_IMG}
                    alt={t.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-white font-medium truncate">{t.title}</p>
                    <p className="text-white/90 text-sm">{t.destination}</p>
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    {formatDates(t.startDate, t.endDate)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    {t.memberCount} traveler{t.memberCount !== 1 ? "s" : ""}
                  </div>
                  {t.budget && (
                    <p className="text-sm text-gray-500">{t.budget}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-primary-600 font-medium hover:underline">
            ← Back to Travel Buddy
          </Link>
        </div>
      </main>
    </div>
  );
}
