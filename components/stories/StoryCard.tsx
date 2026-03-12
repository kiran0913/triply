"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop";
const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop";

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

interface StoryCardProps {
  story: Story;
  onLikeChange?: (storyId: string, liked: boolean, likesCount: number) => void;
}

export function StoryCard({ story, onLikeChange }: StoryCardProps) {
  const [liked, setLiked] = useState(story.userLiked);
  const [likesCount, setLikesCount] = useState(story.likesCount);
  const [loading, setLoading] = useState(false);

  const photos = Array.isArray(story.photos) ? story.photos : [];
  const mainPhoto = photos[0] || DEFAULT_IMG;

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await apiFetch<{ liked: boolean; likesCount: number }>(
        `/api/stories/${story.id}/like`,
        { method: "POST" }
      );
      setLiked(res.liked);
      setLikesCount(res.likesCount);
      onLikeChange?.(story.id, res.liked, res.likesCount);
    } finally {
      setLoading(false);
    }
  };

  return (
    <article className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/stories/${story.id}`}>
        <div className="aspect-[16/10] relative bg-gray-100">
          <Image
            src={mainPhoto}
            alt={story.title}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <h3 className="text-white font-semibold text-lg">{story.title}</h3>
            <p className="text-white/90 text-sm">{story.trip.destination}</p>
          </div>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Link href={`/profile/${story.author.id}`} className="flex items-center gap-2">
            <Image
              src={story.author.profilePhoto || DEFAULT_AVATAR}
              alt={story.author.name ?? "Traveler"}
              width={32}
              height={32}
              className="rounded-full object-cover"
              unoptimized
            />
            <span className="font-medium text-gray-900 text-sm">
              {story.author.name ?? "Traveler"}
            </span>
          </Link>
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{story.content}</p>
        {story.highlights && Array.isArray(story.highlights) && story.highlights.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {story.highlights.slice(0, 5).map((h, i) => (
              <span
                key={i}
                className="text-xs px-2 py-1 rounded-full bg-primary-50 text-primary-700"
              >
                {h}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-4 text-gray-500 text-sm">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleLike();
            }}
            className={`flex items-center gap-1 ${liked ? "text-red-500" : "hover:text-red-500"}`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
            )}
            {likesCount}
          </button>
          <Link
            href={`/stories/${story.id}`}
            className="flex items-center gap-1 hover:text-primary-600"
          >
            <MessageCircle className="w-4 h-4" />
            {story.commentsCount}
          </Link>
          {story.trip.slug && (
            <Link
              href={`/t/${story.trip.slug}`}
              className="text-primary-600 hover:underline"
            >
              View trip
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
