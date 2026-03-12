"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Send } from "lucide-react";
import { Button } from "@/components/Button";
import { apiFetch } from "@/lib/api";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string | null; profilePhoto: string | null };
};

interface ItineraryCommentsProps {
  tripId: string;
  itemId: string;
  onUpdate: () => void;
}

export function ItineraryComments({
  tripId,
  itemId,
  onUpdate,
}: ItineraryCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<Comment[]>(
        `/api/trips/${tripId}/itinerary/${itemId}/comments`
      );
      setComments(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, [tripId, itemId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitLoading(true);
    try {
      const newComment = await apiFetch<Comment>(
        `/api/trips/${tripId}/itinerary/${itemId}/comments`,
        {
          method: "POST",
          body: JSON.stringify({ content: content.trim() }),
        }
      );
      setComments((prev) => [...prev, newComment]);
      setContent("");
      onUpdate();
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
        />
        <Button
          type="submit"
          size="sm"
          disabled={submitLoading || !content.trim()}
          className="flex items-center gap-1"
        >
          <Send className="w-4 h-4" /> Send
        </Button>
      </form>
      {loading ? (
        <p className="text-sm text-gray-500">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-500">No comments yet.</p>
      ) : (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-3">
              <Image
                src={c.user.profilePhoto || DEFAULT_AVATAR}
                alt={c.user.name ?? "User"}
                width={32}
                height={32}
                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                unoptimized
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {c.user.name ?? "Traveler"}
                </p>
                <p className="text-sm text-gray-600">{c.content}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(c.createdAt).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
