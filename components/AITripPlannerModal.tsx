"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Sparkles, Loader2, Save, Calendar } from "lucide-react";
import { Button } from "@/components/Button";
import { apiFetch } from "@/lib/api";
import { TRAVEL_STYLES, INTERESTS } from "@/data/mockData";
import type { TripPlanResponse } from "@/app/api/ai/trip-plan/route";

interface AITripPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AITripPlannerModal({ isOpen, onClose }: AITripPlannerModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "result">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<TripPlanResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    travelStyle: "",
    interests: [] as string[],
  });

  const update = (k: keyof typeof form, v: string | string[]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const toggleInterest = (v: string) =>
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(v) ? f.interests.filter((x) => x !== v) : [...f.interests, v],
    }));

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.destination.trim() || !form.startDate || !form.endDate) {
      setError("Destination and dates are required");
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch<TripPlanResponse>("/api/ai/trip-plan", {
        method: "POST",
        body: JSON.stringify({
          destination: form.destination.trim(),
          startDate: form.startDate,
          endDate: form.endDate,
          budget: form.budget.trim() || undefined,
          travelStyle: form.travelStyle.trim() || undefined,
          interests: form.interests.length > 0 ? form.interests : undefined,
        }),
      });
      setPlan(res);
      setStep("result");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsTrip = async () => {
    if (!plan) return;
    setSaving(true);
    setError(null);
    try {
      const startDate = form.startDate || plan.dates.split(" to ")[0]?.trim();
      const endDate = form.endDate || plan.dates.split(" to ")[1]?.trim();
      if (!startDate || !endDate) {
        setError("Could not parse dates. Please try generating again.");
        setSaving(false);
        return;
      }
      const description = plan.days
        .map(
          (d) =>
            `Day ${d.day}: ${d.title}\n${d.activities.map((a) => `- ${a.title}: ${a.description || ""}`).join("\n")}`
        )
        .join("\n\n");
      await apiFetch("/api/trips", {
        method: "POST",
        body: JSON.stringify({
          title: `AI Trip: ${plan.destination}`,
          destination: plan.destination,
          startDate,
          endDate,
          budget: plan.totalEstimatedCost || form.budget || undefined,
          travelStyle: form.travelStyle || undefined,
          description: description.slice(0, 2000),
          status: "OPEN",
        }),
      });
      onClose();
      router.push("/explore");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save trip");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setStep("form");
    setPlan(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF6B35]" /> AI Trip Planner
          </h2>
          <button
            type="button"
            onClick={() => { onClose(); handleReset(); }}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === "form" ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
                <input
                  type="text"
                  value={form.destination}
                  onChange={(e) => update("destination", e.target.value)}
                  placeholder="e.g. Bali, Japan"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start date *</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => update("startDate", e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End date *</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => update("endDate", e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                <input
                  type="text"
                  value={form.budget}
                  onChange={(e) => update("budget", e.target.value)}
                  placeholder="e.g. $1,500"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Travel style</label>
                <select
                  value={form.travelStyle}
                  onChange={(e) => update("travelStyle", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/30"
                >
                  <option value="">Any</option>
                  {TRAVEL_STYLES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggleInterest(i)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        form.interests.includes(i)
                          ? "bg-[#FF6B35] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Generate itinerary
                    </>
                  )}
                </Button>
                <Button type="button" variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              {plan && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{plan.destination}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-4 h-4" /> {plan.dates}
                      </p>
                      {plan.totalEstimatedCost && (
                        <p className="text-sm text-primary-600 font-medium mt-1">
                          Est. total: {plan.totalEstimatedCost}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={handleReset}>
                        New plan
                      </Button>
                      <Button size="sm" onClick={handleSaveAsTrip} disabled={saving}>
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{" "}
                        Save as trip
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {plan.days.map((day) => (
                      <div
                        key={day.day}
                        className="rounded-xl border border-gray-100 bg-gray-50/50 p-4"
                      >
                        <h4 className="font-semibold text-gray-900">
                          Day {day.day}: {day.title}
                        </h4>
                        <ul className="mt-3 space-y-2">
                          {day.activities?.map((a, i) => (
                            <li key={i} className="flex gap-3 text-sm">
                              {a.time && (
                                <span className="text-gray-500 font-mono w-12 flex-shrink-0">
                                  {a.time}
                                </span>
                              )}
                              <div>
                                <span className="font-medium text-gray-800">{a.title}</span>
                                {a.description && (
                                  <p className="text-gray-600 mt-0.5">{a.description}</p>
                                )}
                                {a.estimatedCost && (
                                  <span className="text-primary-600 text-xs">{a.estimatedCost}</span>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
