"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Plus, Search, SlidersHorizontal, XCircle } from "lucide-react";
import { Button } from "@/components/Button";
import { PageContainer, PageHeader } from "@/components/layout";
import { apiFetch } from "@/lib/api";
import { TRAVEL_STYLES } from "@/data/mockData";

type Trip = {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: string | null;
  travelStyle: string | null;
  description: string | null;
  status: string;
  host: { id: string; name: string | null; profilePhoto: string | null; location: string | null };
  _count: { members: number };
};

const DEFAULT_TRIP_IMAGE = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop";

function formatDates(start: string, end: string) {
  try {
    const s = new Date(start);
    const e = new Date(end);
    return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}`;
  } catch {
    return "—";
  }
}

export default function ExplorePage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    destination: "",
    style: "",
    budget: "",
    openOnly: true,
    startAfter: "",
    endBefore: "",
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const buildTripsUrl = useCallback((f: typeof filters) => {
    const params = new URLSearchParams();
    if (f.openOnly) params.set("status", "OPEN");
    if (f.destination.trim()) params.set("destination", f.destination.trim());
    if (f.style.trim()) params.set("style", f.style.trim());
    if (f.budget.trim()) params.set("budget", f.budget.trim());
    if (f.startAfter.trim()) params.set("startAfter", f.startAfter.trim());
    if (f.endBefore.trim()) params.set("endBefore", f.endBefore.trim());
    return `/api/trips?${params.toString()}`;
  }, []);

  const fetchTrips = useCallback(() => {
    setLoading(true);
    setError(null);
    apiFetch<Trip[]>(buildTripsUrl(appliedFilters))
      .then((data) => setTrips(Array.isArray(data) ? data : []))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load trips"))
      .finally(() => setLoading(false));
  }, [appliedFilters, buildTripsUrl]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const applyFilters = () => {
    setAppliedFilters(filters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const reset = {
      destination: "",
      style: "",
      budget: "",
      openOnly: true,
      startAfter: "",
      endBefore: "",
    };
    setFilters(reset);
    setAppliedFilters(reset);
  };

  const hasActiveFilters =
    appliedFilters.destination.trim() !== "" ||
    appliedFilters.style.trim() !== "" ||
    appliedFilters.budget.trim() !== "" ||
    appliedFilters.startAfter.trim() !== "" ||
    appliedFilters.endBefore.trim() !== "" ||
    !appliedFilters.openOnly;

  return (
    <PageContainer>
      <PageHeader
        title="Explore trips"
        description="Browse open trips and find your next adventure"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </Button>
            <Button to="/create" className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create trip
            </Button>
          </div>
        }
      />

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-2xl bg-white p-6 shadow-elevated border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Trip filters</h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm text-[#FF6B35] hover:underline"
              >
                <XCircle className="w-4 h-4" /> Clear all
              </button>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <input
                type="text"
                value={filters.destination}
                onChange={(e) => setFilters((f) => ({ ...f, destination: e.target.value }))}
                placeholder="e.g. Bali, Japan"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Travel style</label>
              <select
                value={filters.style}
                onChange={(e) => setFilters((f) => ({ ...f, style: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
              >
                <option value="">Any</option>
                {TRAVEL_STYLES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
              <input
                type="text"
                value={filters.budget}
                onChange={(e) => setFilters((f) => ({ ...f, budget: e.target.value }))}
                placeholder="e.g. $1,000"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filters.startAfter}
                  onChange={(e) => setFilters((f) => ({ ...f, startAfter: e.target.value }))}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400"
                  placeholder="From"
                />
                <input
                  type="date"
                  value={filters.endBefore}
                  onChange={(e) => setFilters((f) => ({ ...f, endBefore: e.target.value }))}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400"
                  placeholder="To"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                id="openOnly"
                checked={filters.openOnly}
                onChange={(e) => setFilters((f) => ({ ...f, openOnly: e.target.checked }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="openOnly" className="text-sm font-medium text-gray-700">
                Open trips only
              </label>
            </div>
          </div>
          <Button size="sm" className="mt-4" onClick={applyFilters}>
            Apply filters
          </Button>
        </motion.div>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="search"
          value={filters.destination}
          onChange={(e) => setFilters((f) => ({ ...f, destination: e.target.value }))}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          placeholder="Search by destination..."
          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/80 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 focus:bg-white transition-all"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl bg-gray-100 animate-pulse overflow-hidden">
              <div className="aspect-[16/10] bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 bg-gray-200 rounded" />
                <div className="h-4 w-1/2 bg-gray-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-600 mb-4">{error}</p>
          <Button variant="secondary" onClick={fetchTrips}>Try again</Button>
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-600 mb-2">No trips found.</p>
          <p className="text-sm text-gray-500 mb-6">
            {hasActiveFilters ? "Try different filters or create your own trip." : "Be the first to create a trip!"}
          </p>
          {hasActiveFilters && (
            <Button variant="secondary" onClick={clearFilters} className="mr-2">
              Clear filters
            </Button>
          )}
          <Button to="/create">Create trip</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((t) => (
            <Link key={t.id} href={`/trips/${t.id}`} className="min-w-0 block">
              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-2xl bg-white shadow-sm hover:shadow-md border border-gray-100 overflow-hidden transition-all duration-200 cursor-pointer h-full"
              >
                <div className="aspect-[16/10] relative">
                  <Image src={DEFAULT_TRIP_IMAGE} alt={t.destination} fill className="object-cover" unoptimized />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                    <h3 className="font-semibold text-white">{t.destination}</h3>
                    <p className="text-sm text-white/90">
                      {formatDates(t.startDate, t.endDate)} • {t.budget || "—"}
                    </p>
                  </div>
                </div>
                <div className="p-4 min-w-0">
                  {t.travelStyle && (
                    <span className="text-xs font-medium text-[#FF6B35] bg-primary-50 px-2 py-1 rounded-lg">
                      {t.travelStyle}
                    </span>
                  )}
                  <p className="text-gray-500 text-sm mt-2">
                    {t._count.members} {t._count.members === 1 ? "member" : "members"}
                  </p>
                  <span className="inline-flex items-center justify-center w-full mt-4 px-4 py-2 rounded-xl bg-primary-50 text-[#FF6B35] text-sm font-semibold">
                    View trip & join
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
