"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { StoryCard } from "@/components/stories/StoryCard";

type Story = {
  id: string;
  title: string;
  content: string;
  photos: string[] | null;
  highlights: string[] | null;
  likesCount: number;
  commentsCount: number;
  userLiked: boolean;
  author: { id: string; name: string | null; profilePhoto: string | null };
  trip: { id: string; title: string; destination: string; slug: string | null };
};

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStories = () => {
    apiFetch<Story[]>("/api/stories")
      .then((data) => setStories(Array.isArray(data) ? data : []))
      .catch(() => setStories([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStories();
  }, []);

  const handleLikeChange = (storyId: string, liked: boolean, likesCount: number) => {
    setStories((prev) =>
      prev.map((s) =>
        s.id === storyId ? { ...s, userLiked: liked, likesCount } : s
      )
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Travel Stories</h1>
        <p className="text-gray-500 text-sm">
          See what travelers shared after their trips
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        </div>
      ) : stories.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-500">
          <p className="font-medium">No stories yet</p>
          <p className="text-sm mt-1">
            Complete a trip and share your experience to see stories here.
          </p>
          <Link
            href="/explore"
            className="inline-block mt-4 text-primary-600 font-medium hover:underline"
          >
            Explore trips →
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stories.map((s) => (
            <StoryCard
              key={s.id}
              story={s}
              onLikeChange={handleLikeChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
