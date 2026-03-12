"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bookmark, MessageCircle, SlidersHorizontal, Grid, List, XCircle } from "lucide-react";
import { Button } from "@/components/Button";
import { PageContainer, PageHeader } from "@/components/layout";
import { VerificationBadge } from "@/components/VerificationBadge";
import { apiFetch } from "@/lib/api";
import { TRAVEL_STYLES, INTERESTS, BUDGET_OPTIONS } from "@/data/mockData";

type MatchUser = {
  id: string;
  name: string | null;
  profilePhoto: string | null;
  location: string | null;
  bio: string | null;
  travelStyle: string[] | null;
  interests: string[] | null;
  verified: boolean;
  budgetRange: string | null;
  matchPercent: number;
  image: string | null;
  matchReasons?: string[];
  verificationStatus?: { level: string; trustedBadge?: boolean };
};

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [view, setView] = useState<"cards" | "list">("cards");
  const [showFilters, setShowFilters] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    destination: "",
    travelStyle: "",
    interests: "",
    budgetRange: "",
    verified: false,
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const buildMatchesUrl = useCallback((f: typeof filters) => {
    const params = new URLSearchParams();
    params.set("discover", "1");
    if (f.destination.trim()) params.set("destination", f.destination.trim());
    if (f.travelStyle.trim()) params.set("travelStyle", f.travelStyle.trim());
    if (f.interests.trim()) params.set("interests", f.interests.trim());
    if (f.budgetRange.trim()) params.set("budgetRange", f.budgetRange.trim());
    if (f.verified) params.set("verified", "1");
    return `/api/matches?${params.toString()}`;
  }, []);

  const fetchMatches = useCallback(() => {
    setLoading(true);
    setError(null);
    apiFetch<MatchUser[]>(buildMatchesUrl(appliedFilters))
      .then((data) => {
        setMatches(Array.isArray(data) ? data : []);
        setCurrent(0);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load matches")
      )
      .finally(() => setLoading(false));
  }, [appliedFilters, buildMatchesUrl]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const applyFilters = () => {
    setAppliedFilters(filters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    const reset = {
      destination: "",
      travelStyle: "",
      interests: "",
      budgetRange: "",
      verified: false,
    };
    setFilters(reset);
    setAppliedFilters(reset);
  };

  const hasActiveFilters = Object.values(appliedFilters).some((v) =>
    typeof v === "string" ? v.trim() !== "" : v === true
  );

  const currentMatch = matches[current];

  const pass = () => {
    if (current < matches.length - 1) setCurrent(current + 1);
  };

  const handleSave = async (userId: string) => {
    if (savingId) return;
    setSavingId(userId);
    try {
      await apiFetch(`/api/users/${userId}/save`, { method: "POST" });
      setSavedIds((prev) => new Set(prev).add(userId));
      if (current < matches.length - 1) setCurrent(current + 1);
    } catch {
      setError("Failed to save profile");
    } finally {
      setSavingId(null);
    }
  };

  const imageUrl = (m: MatchUser) =>
    m.image || m.profilePhoto || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop";
  const travelStyles = (m: MatchUser) => (Array.isArray(m.travelStyle) ? m.travelStyle : []);
  const interests = (m: MatchUser) => (Array.isArray(m.interests) ? m.interests : []);

  if (loading) {
    return (
      <PageContainer>
      <div className="space-y-6">
        <div className="h-10 w-72 bg-gray-200 rounded animate-pulse" />
        <div className="flex justify-center">
          <div className="w-full max-w-md aspect-[3/4] rounded-3xl bg-gray-100 animate-pulse" />
        </div>
        <div className="flex justify-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gray-200 animate-pulse" />
          <div className="w-14 h-14 rounded-2xl bg-gray-200 animate-pulse" />
          <div className="w-14 h-14 rounded-2xl bg-gray-200 animate-pulse" />
        </div>
      </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Find Your Perfect Travel Match" />
        <div className="text-center py-16">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchMatches} variant="secondary">
            Try again
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (matches.length === 0) {
    return (
      <PageContainer>
        <PageHeader
          title="Find Your Perfect Travel Match"
          actions={hasActiveFilters ? <Button variant="secondary" size="sm" onClick={clearFilters}>Clear filters</Button> : undefined}
        />
        <div className="text-center py-16">
          <div className="max-w-sm mx-auto">
            <p className="text-gray-600 mb-2">
              {hasActiveFilters ? "No matches match your filters." : "No more potential matches right now."}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              {hasActiveFilters ? "Try different filters." : "Check back later or complete your profile to find better matches."}
            </p>
            {hasActiveFilters ? (
              <Button variant="secondary" onClick={clearFilters}>Clear filters</Button>
            ) : (
              <Link href="/profile">
                <Button variant="secondary">Complete your profile</Button>
              </Link>
            )}
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="Find Your Perfect Travel Match"
        description="Browse potential travel companions and connect"
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
            <div className="flex rounded-xl border border-[#E5E7EB] overflow-hidden">
              <button
                type="button"
                onClick={() => setView("cards")}
                className={`p-2 ${view === "cards" ? "bg-primary-50 text-[#FF6B35]" : "text-slate-500"}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setView("list")}
                className={`p-2 ${view === "list" ? "bg-primary-50 text-[#FF6B35]" : "text-slate-500"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        }
      />

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md border border-gray-100 transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filters</h3>
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
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination / Location</label>
              <input
                type="text"
                value={filters.destination}
                onChange={(e) => setFilters((f) => ({ ...f, destination: e.target.value }))}
                placeholder="e.g. Bali, Tokyo"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Travel style</label>
              <select
                value={filters.travelStyle}
                onChange={(e) => setFilters((f) => ({ ...f, travelStyle: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
              >
                <option value="">Any</option>
                {TRAVEL_STYLES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Interests</label>
              <select
                value={filters.interests}
                onChange={(e) => setFilters((f) => ({ ...f, interests: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
              >
                <option value="">Any</option>
                {INTERESTS.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget range</label>
              <select
                value={filters.budgetRange}
                onChange={(e) => setFilters((f) => ({ ...f, budgetRange: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
              >
                <option value="">Any</option>
                {BUDGET_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
              <input
                type="checkbox"
                id="verified"
                checked={filters.verified}
                onChange={(e) => setFilters((f) => ({ ...f, verified: e.target.checked }))}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="verified" className="text-sm font-medium text-gray-700">
                Verified only
              </label>
            </div>
          </div>
          <Button size="sm" className="mt-4" onClick={applyFilters}>
            Apply filters
          </Button>
        </motion.div>
      )}

      {view === "cards" ? (
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md aspect-[3/4] relative">
            <AnimatePresence mode="wait">
              {currentMatch && (
                <motion.div
                  key={currentMatch.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="absolute inset-0 rounded-3xl overflow-hidden shadow-md bg-white border border-gray-100"
                >
                  <div className="relative h-full">
                    <Image
                      src={imageUrl(currentMatch)}
                      alt={currentMatch.name || "Match"}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-bold">
                          {currentMatch.name || "Traveler"}
                        </h2>
                        <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full font-semibold">
                          {currentMatch.matchPercent}% match
                        </span>
                      </div>
                      {(currentMatch.verificationStatus?.trustedBadge ?? currentMatch.verified) && (
                        <span className="inline-block mt-1">
                          <VerificationBadge
                            status={currentMatch.verificationStatus}
                            size="sm"
                            variant="dark"
                          />
                        </span>
                      )}
                      <p className="text-white/90 mt-2">
                        {currentMatch.location || "—"} •{" "}
                        {currentMatch.budgetRange || "—"}
                      </p>
                      {travelStyles(currentMatch).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {travelStyles(currentMatch).map((s) => (
                            <span
                              key={s}
                              className="bg-white/20 px-2 py-1 rounded-lg text-xs"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                      {currentMatch.bio && (
                        <p className="mt-3 text-sm text-white/90 line-clamp-2">
                          {currentMatch.bio}
                        </p>
                      )}
                      {interests(currentMatch).length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {interests(currentMatch).map((i) => (
                            <span
                              key={i}
                              className="bg-white/10 px-2 py-0.5 rounded text-xs"
                            >
                              {i}
                            </span>
                          ))}
                        </div>
                      )}
                      {currentMatch.matchReasons && currentMatch.matchReasons.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-white/20">
                          <p className="text-xs font-medium text-white/90 mb-1">Why you match</p>
                          <ul className="space-y-0.5">
                            {currentMatch.matchReasons.map((r, i) => (
                              <li key={i} className="text-xs text-white/80 flex items-center gap-1.5">
                                <span className="text-primary-300">•</span> {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="flex items-center justify-center gap-5 mt-8">
            <button
              type="button"
              onClick={pass}
              className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-all shadow-sm"
              disabled={matches.length <= 1}
            >
              <X className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={() => handleSave(currentMatch!.id)}
              disabled={savingId === currentMatch?.id || savedIds.has(currentMatch?.id ?? "")}
              className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 transition-all shadow-sm disabled:opacity-50"
              title="Save profile"
            >
              {savedIds.has(currentMatch?.id ?? "") ? (
                <span className="text-sm font-semibold">✓</span>
              ) : (
                <Bookmark className="w-6 h-6" />
              )}
            </button>
            {currentMatch && (
              <Button
                to={`/profile/${currentMatch.id}`}
                className="w-14 h-14 rounded-2xl !p-0 flex items-center justify-center"
                title="Connect"
              >
                <MessageCircle className="w-6 h-6" />
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            {current + 1} of {matches.length}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((m) => (
            <motion.div
              key={m.id}
              whileHover={{ y: -2 }}
              className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-200 min-w-0"
            >
              <div className="aspect-[4/3] relative">
                <Image
                  src={imageUrl(m)}
                  alt={m.name || "Match"}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl text-sm font-semibold text-[#FF6B35] shadow-sm">
                  {m.matchPercent}% match
                </span>
              </div>
              <div className="p-4 min-w-0">
                <div className="flex items-center justify-between gap-2 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {m.name || "Traveler"}
                  </h3>
                  {(m.verificationStatus?.trustedBadge ?? m.verified) && (
                    <VerificationBadge status={m.verificationStatus} size="sm" />
                  )}
                </div>
                <p className="text-sm text-slate-500 truncate">
                  {m.location || "—"} • {m.budgetRange || "—"}
                </p>
                {m.matchReasons && m.matchReasons.length > 0 && (
                  <p className="text-xs text-primary-600 mt-2">
                    {m.matchReasons.slice(0, 2).join(" • ")}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button variant="ghost" size="sm" className="flex-1">
                    Pass
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleSave(m.id)}
                    disabled={savingId === m.id || savedIds.has(m.id)}
                  >
                    {savedIds.has(m.id) ? "Saved" : "Save"}
                  </Button>
                  <Button to={`/profile/${m.id}`} size="sm" className="flex-1">
                    Connect
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
