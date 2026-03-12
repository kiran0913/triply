"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/Button";
import { apiFetch } from "@/lib/api";

interface AddItineraryItemFormProps {
  tripId: string;
  defaultDay?: number;
  onAdded: () => void;
}

export function AddItineraryItemForm({
  tripId,
  defaultDay = 1,
  onAdded,
}: AddItineraryItemFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dayNumber, setDayNumber] = useState(defaultDay);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [costEstimate, setCostEstimate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch(`/api/trips/${tripId}/itinerary`, {
        method: "POST",
        body: JSON.stringify({
          dayNumber,
          title: title.trim(),
          description: description.trim() || undefined,
          costEstimate: costEstimate.trim() || undefined,
          startTime: startTime.trim() || undefined,
          endTime: endTime.trim() || undefined,
        }),
      });
      setTitle("");
      setDescription("");
      setCostEstimate("");
      setStartTime("");
      setEndTime("");
      setOpen(false);
      onAdded();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add";
      setError(typeof msg === "string" ? msg : "Failed to add");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
      >
        <Plus className="w-4 h-4" /> Add activity
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
          <input
            type="number"
            min={1}
            value={dayNumber}
            onChange={(e) => setDayNumber(parseInt(e.target.value, 10) || 1)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Visit Kyoto temples"
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details"
          rows={2}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none"
        />
      </div>
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cost estimate</label>
          <input
            type="text"
            value={costEstimate}
            onChange={(e) => setCostEstimate(e.target.value)}
            placeholder="e.g. $20"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
          <input
            type="text"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder="09:00"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
          <input
            type="text"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            placeholder="12:00"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading || !title.trim()}>
          Add activity
        </Button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
