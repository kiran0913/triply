"use client";

import { Plus } from "lucide-react";
import { apiFetch } from "@/lib/api";

export interface SuggestedActivity {
  dayNumber?: number;
  title: string;
  description?: string;
  time?: string;
  costEstimate?: string;
}

interface CopilotSuggestionCardsProps {
  tripId: string;
  activities: SuggestedActivity[];
  onAdded?: () => void;
}

export function CopilotSuggestionCards({
  tripId,
  activities,
  onAdded,
}: CopilotSuggestionCardsProps) {
  if (!activities || activities.length === 0) return null;

  const handleAdd = async (a: SuggestedActivity) => {
    try {
      await apiFetch(`/api/trips/${tripId}/itinerary`, {
        method: "POST",
        body: JSON.stringify({
          dayNumber: a.dayNumber ?? 1,
          title: a.title,
          description: a.description,
          startTime: a.time,
          costEstimate: a.costEstimate,
        }),
      });
      onAdded?.();
    } catch {
      // Error handled by apiFetch
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
        Suggested activities
      </p>
      <div className="flex flex-wrap gap-2">
        {activities.map((a, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-2 p-3 rounded-xl bg-primary-50/80 border border-primary-100"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 truncate">{a.title}</p>
              {a.description && (
                <p className="text-sm text-gray-600 line-clamp-1">{a.description}</p>
              )}
              <div className="flex gap-2 mt-1 text-xs text-gray-500">
                {a.dayNumber != null && <span>Day {a.dayNumber}</span>}
                {a.time && <span>{a.time}</span>}
                {a.costEstimate && <span>{a.costEstimate}</span>}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleAdd(a)}
              className="flex-shrink-0 p-2 rounded-lg text-primary-600 hover:bg-primary-100 transition-colors"
              title="Add to itinerary"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
