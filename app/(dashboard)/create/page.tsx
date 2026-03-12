"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/Button";
import { AITripPlannerModal } from "@/components/AITripPlannerModal";
import { apiFetch } from "@/lib/api";
import { TRAVEL_STYLES, INTERESTS } from "@/data/mockData";

export default function CreateTripPage() {
  const router = useRouter();
  const [showAIPlanner, setShowAIPlanner] = useState(false);
  const [form, setForm] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    style: [] as string[],
    interests: [] as string[],
    peopleWanted: "1",
    description: "",
    safetyNotes: "",
    accommodation: "Flexible",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof typeof form, v: string | string[]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k: "style" | "interests", v: string) =>
    setForm((f) => ({
      ...f,
      [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v],
    }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.destination.trim()) {
      setError("Destination is required");
      return;
    }
    if (!form.startDate || !form.endDate) {
      setError("Start and end dates are required");
      return;
    }

    const title =
      form.destination.trim().length > 0
        ? `Trip to ${form.destination.trim()}`
        : "My Trip";

    const descriptionParts = [
      form.description.trim(),
      form.peopleWanted
        ? `Looking for ${form.peopleWanted} travel ${form.peopleWanted === "1" ? "buddy" : "buddies"}.`
        : "",
      form.safetyNotes.trim()
        ? `Safety: ${form.safetyNotes.trim()}.`
        : "",
      form.accommodation ? `Accommodation: ${form.accommodation}.` : "",
    ]
      .filter(Boolean)
      .join(" ");

    const payload = {
      title,
      destination: form.destination.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      budget: form.budget.trim() || undefined,
      travelStyle:
        form.style.length > 0 ? form.style.join(", ") : undefined,
      description: descriptionParts.trim() || undefined,
      status: "OPEN" as const,
    };

    setSubmitting(true);
    try {
      await apiFetch("/api/trips", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      router.push("/explore");
      router.refresh();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create trip";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Create a trip
        </h1>
        <Button
          variant="secondary"
          onClick={() => setShowAIPlanner(true)}
          className="flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> Generate AI Trip Plan
        </Button>
      </div>
      <AITripPlannerModal isOpen={showAIPlanner} onClose={() => setShowAIPlanner(false)} />
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Destination *
          </label>
          <input
            type="text"
            value={form.destination}
            onChange={(e) => update("destination", e.target.value)}
            placeholder="e.g. Bali, Indonesia"
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start date *
            </label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => update("startDate", e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End date *
            </label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => update("endDate", e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated budget
          </label>
          <input
            type="text"
            value={form.budget}
            onChange={(e) => update("budget", e.target.value)}
            placeholder="e.g. $1,200"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Travel style
          </label>
          <div className="flex flex-wrap gap-2">
            {TRAVEL_STYLES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggle("style", s)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  form.style.includes(s)
                    ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-soft"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Interests
          </label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggle("interests", i)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  form.interests.includes(i)
                    ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-soft"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of travel buddies wanted
          </label>
          <select
            value={form.peopleWanted}
            onChange={(e) => update("peopleWanted", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
          >
            {[1, 2, 3, 4, "5+"].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            rows={4}
            placeholder="Describe your trip and what you're looking for"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Safety notes
          </label>
          <input
            type="text"
            value={form.safetyNotes}
            onChange={(e) => update("safetyNotes", e.target.value)}
            placeholder="Any safety preferences or requirements"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Accommodation preference
          </label>
          <select
            value={form.accommodation}
            onChange={(e) => update("accommodation", e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
          >
            {["Flexible", "Private room", "Shared room", "Hostel", "Hotel"].map(
              (o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              )
            )}
          </select>
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? "Creating..." : "Create trip"}
        </Button>
      </form>
    </div>
  );
}
