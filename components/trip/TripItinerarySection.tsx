"use client";

import { useEffect, useState, useCallback } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { AddItineraryItemForm } from "./AddItineraryItemForm";
import { ItineraryItemCard } from "./ItineraryItemCard";

type ItineraryItem = {
  id: string;
  dayNumber: number;
  title: string;
  description: string | null;
  costEstimate: string | null;
  startTime: string | null;
  endTime: string | null;
  completedAt: string | null;
  addedBy: { id: string; name: string | null; profilePhoto: string | null };
  voteCount: number;
  userVoted: boolean;
  commentCount: number;
};

interface TripItinerarySectionProps {
  tripId: string;
  currentUserId: string;
  startDate: string;
  endDate: string;
}

export function TripItinerarySection({
  tripId,
  currentUserId,
  startDate,
  endDate,
}: TripItinerarySectionProps) {
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItinerary = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetch(`/api/trips/${tripId}/itinerary`, {
        credentials: "include",
      }).then((r) => r.json());
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    loadItinerary();
  }, [loadItinerary]);

  const maxDay = items.length
    ? Math.max(...items.map((i) => i.dayNumber), 1)
    : 1;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-600" />
          Shared itinerary
        </h3>
        <AddItineraryItemForm tripId={tripId} onAdded={loadItinerary} />
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center text-gray-500">
          <p>No activities yet.</p>
          <p className="text-sm mt-1">
            Add your first activity to start planning together.
          </p>
          <div className="mt-4">
            <AddItineraryItemForm tripId={tripId} defaultDay={1} onAdded={loadItinerary} />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from({ length: maxDay }, (_, i) => i + 1).map((day) => {
            const dayItems = items.filter((item) => item.dayNumber === day);
            if (dayItems.length === 0) return null;
            return (
              <div key={day}>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Day {day}
                </h4>
                <div className="space-y-3">
                  {dayItems.map((item) => (
                    <ItineraryItemCard
                      key={item.id}
                      tripId={tripId}
                      item={item}
                      currentUserId={currentUserId}
                      onUpdate={loadItinerary}
                    />
                  ))}
                  <div className="pl-4">
                    <AddItineraryItemForm
                      tripId={tripId}
                      defaultDay={day}
                      onAdded={loadItinerary}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Add to another day
            </h4>
            <AddItineraryItemForm
              tripId={tripId}
              defaultDay={maxDay + 1}
              onAdded={loadItinerary}
            />
          </div>
        </div>
      )}
    </div>
  );
}
