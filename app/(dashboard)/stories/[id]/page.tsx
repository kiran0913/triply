"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/Button";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

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
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: { id: string; name: string | null; profilePhoto: string | null };
  }>;
};

export default function StoryDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const loadStory = () => {
    if (!id) return;
    apiFetch<Story>(`/api/stories/${id}`)
      .then(setStory)
      .catch(() => setStory(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStory();
  }, [id]);

  const handleLike = async () => {
    if (!story || likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await apiFetch<{ liked: boolean; likesCount: number }>(
        `/api/stories/${story.id}/like`,
        { method: "POST" }
      );
      setStory((s) =>
        s ? { ...s, userLiked: res.liked, likesCount: res.likesCount } : s
      );
    } finally {
      setLikeLoading(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!story || !comment.trim() || commentLoading || !user) return;
    setCommentLoading(true);
    try {
      const newComment = await apiFetch<Story["comments"][0]>(
        `/api/stories/${story.id}/comment`,
        {
          method: "POST",
          body: JSON.stringify({ content: comment.trim() }),
        }
      );
      setStory((s) =>
        s
          ? {
              ...s,
              comments: [...s.comments, newComment],
              commentsCount: s.commentsCount + 1,
            }
          : s
      );
      setComment("");
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!story) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Story not found.</p>
        <Link href="/stories" className="text-primary-600 hover:underline mt-2 inline-block">
          Back to Stories
        </Link>
      </div>
    );
  }

  const photos = Array.isArray(story.photos) ? story.photos : [];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm">
        <div className="aspect-[16/9] relative bg-gray-100">
          <Image
            src={photos[0] || DEFAULT_IMG}
            alt={story.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">{story.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Link
              href={`/profile/${story.author.id}`}
              className="flex items-center gap-2 text-gray-600 hover:text-primary-600"
            >
              <Image
                src={story.author.profilePhoto || DEFAULT_AVATAR}
                alt=""
                width={32}
                height={32}
                className="rounded-full object-cover"
                unoptimized
              />
              {story.author.name ?? "Traveler"}
            </Link>
            <span className="text-gray-400">·</span>
            <Link
              href={story.trip.slug ? `/t/${story.trip.slug}` : `/trips/${story.trip.id}`}
              className="text-primary-600 hover:underline"
            >
              {story.trip.destination}
            </Link>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <button
              type="button"
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center gap-1 ${story.userLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"}`}
            >
              {likeLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Heart className={`w-5 h-5 ${story.userLiked ? "fill-current" : ""}`} />
              )}
              {story.likesCount}
            </button>
            <span className="flex items-center gap-1 text-gray-500">
              <MessageCircle className="w-5 h-5" />
              {story.commentsCount}
            </span>
          </div>
          <p className="mt-4 text-gray-700 whitespace-pre-wrap">{story.content}</p>
          {story.highlights && Array.isArray(story.highlights) && story.highlights.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Highlights</h3>
              <ul className="space-y-1">
                {story.highlights.map((h, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600">
                    <span className="text-primary-500">•</span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-gray-900 mb-3">Comments</h3>
        {user ? (
          <form onSubmit={handleComment} className="mb-4">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              rows={2}
              maxLength={1000}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 resize-none"
            />
            <Button
              type="submit"
              disabled={!comment.trim() || commentLoading}
              size="sm"
              className="mt-2"
            >
              {commentLoading ? "Posting..." : "Post comment"}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-gray-500 mb-4">
            <Link href="/login" className="text-primary-600 hover:underline">
              Log in
            </Link>{" "}
            to comment.
          </p>
        )}
        <div className="space-y-3">
          {story.comments.map((c) => (
            <div key={c.id} className="flex gap-3 p-3 rounded-xl bg-gray-50">
              <Image
                src={c.user.profilePhoto || DEFAULT_AVATAR}
                alt=""
                width={36}
                height={36}
                className="rounded-full object-cover flex-shrink-0"
                unoptimized
              />
              <div>
                <Link
                  href={`/profile/${c.user.id}`}
                  className="font-medium text-gray-900 text-sm hover:underline"
                >
                  {c.user.name ?? "Traveler"}
                </Link>
                <p className="text-gray-600 text-sm mt-0.5">{c.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Link href="/stories" className="text-primary-600 font-medium hover:underline">
          ← Back to Stories
        </Link>
      </div>
    </div>
  );
}
