"use client";

import { useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/Button";
import { apiFetch } from "@/lib/api";

interface CreateStoryFormProps {
  tripId: string;
  tripTitle: string;
  tripDestination: string;
  onCreated: () => void;
}

export function CreateStoryForm({
  tripId,
  tripTitle,
  tripDestination,
  onCreated,
}: CreateStoryFormProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [photosInput, setPhotosInput] = useState("");
  const [highlightsInput, setHighlightsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const photos = photosInput
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && s.startsWith("http"));
      const highlights = highlightsInput
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const story = await apiFetch<{ id: string }>("/api/stories", {
        method: "POST",
        body: JSON.stringify({
          tripId,
          title: title.trim(),
          content: content.trim(),
          photos: photos.length > 0 ? photos : undefined,
          highlights: highlights.length > 0 ? highlights : undefined,
        }),
      });
      setOpen(false);
      setTitle("");
      setContent("");
      setPhotosInput("");
      setHighlightsInput("");
      onCreated();
      window.location.href = `/stories/${story.id}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create story");
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-50 text-primary-700 font-medium hover:bg-primary-100 transition-colors"
      >
        <BookOpen className="w-4 h-4" />
        Share your story
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
      <h3 className="font-semibold text-gray-900">Share your trip story</h3>
      <p className="text-sm text-gray-500">
        {tripTitle} – {tripDestination}
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Japan Trip – October 2025"
          maxLength={120}
          required
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your story *</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share highlights, recommendations, favorite spots..."
          rows={4}
          maxLength={5000}
          required
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Photo URLs (one per line)</label>
        <textarea
          value={photosInput}
          onChange={(e) => setPhotosInput(e.target.value)}
          placeholder="https://..."
          rows={2}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Highlights (one per line)</label>
        <textarea
          value={highlightsInput}
          onChange={(e) => setHighlightsInput(e.target.value)}
          placeholder="Best ramen\nFavorite temple\nHidden places"
          rows={3}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading || !title.trim() || !content.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish story"}
        </Button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="px-4 py-2 text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
