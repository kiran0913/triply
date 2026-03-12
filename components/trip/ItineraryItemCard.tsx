"use client";

import { useState } from "react";
import Image from "next/image";
import { ThumbsUp, MessageCircle, Check, User, Wallet } from "lucide-react";
import { Button } from "@/components/Button";
import { apiFetch } from "@/lib/api";
import { ItineraryComments } from "./ItineraryComments";

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop";

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

interface ItineraryItemCardProps {
  tripId: string;
  item: ItineraryItem;
  currentUserId: string;
  onUpdate: () => void;
}

export function ItineraryItemCard({
  tripId,
  item,
  currentUserId,
  onUpdate,
}: ItineraryItemCardProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [voteCount, setVoteCount] = useState(item.voteCount);
  const [userVoted, setUserVoted] = useState(item.userVoted);
  const [completedAt, setCompletedAt] = useState(item.completedAt);

  const handleVote = async () => {
    setVoteLoading(true);
    try {
      const res = await apiFetch<{ voted: boolean }>(
        `/api/trips/${tripId}/itinerary/${item.id}/vote`,
        { method: "POST" }
      );
      setUserVoted(res.voted);
      setVoteCount((c) => (res.voted ? c + 1 : c - 1));
    } finally {
      setVoteLoading(false);
    }
  };

  const handleComplete = async () => {
    setCompleteLoading(true);
    try {
      await apiFetch(`/api/trips/${tripId}/itinerary/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: !!completedAt ? false : true }),
      });
      setCompletedAt(completedAt ? null : new Date().toISOString());
      onUpdate();
    } finally {
      setCompleteLoading(false);
    }
  };

  const timeRange =
    item.startTime || item.endTime
      ? [item.startTime, item.endTime].filter(Boolean).join(" – ")
      : null;

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        completedAt
          ? "bg-gray-50 border-gray-100"
          : "bg-white border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded">
              Day {item.dayNumber}
            </span>
            {timeRange && (
              <span className="text-xs text-gray-500">{timeRange}</span>
            )}
            {completedAt && (
              <span className="text-xs text-green-600 font-medium">Completed</span>
            )}
          </div>
          <h4
            className={`font-semibold text-gray-900 mt-1 ${
              completedAt ? "line-through text-gray-500" : ""
            }`}
          >
            {item.title}
          </h4>
          {item.description && (
            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
              {item.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            {item.costEstimate && (
              <span className="flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" /> {item.costEstimate}
              </span>
            )}
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" /> Added by{" "}
              {item.addedBy.name ?? "Traveler"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={handleVote}
            disabled={voteLoading}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm transition-colors ${
              userVoted
                ? "bg-primary-100 text-primary-700"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <ThumbsUp className="w-4 h-4" /> {voteCount}
          </button>
          <button
            type="button"
            onClick={() => setCommentsOpen(!commentsOpen)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm transition-colors ${
              commentsOpen ? "bg-primary-100 text-primary-700" : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <MessageCircle className="w-4 h-4" /> {item.commentCount}
          </button>
          <button
            type="button"
            onClick={handleComplete}
            disabled={completeLoading}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
              completedAt
                ? "bg-green-100 text-green-700"
                : "hover:bg-gray-100 text-gray-500"
            }`}
            title={completedAt ? "Mark incomplete" : "Mark complete"}
          >
            <Check className="w-5 h-5" />
          </button>
        </div>
      </div>

      {commentsOpen && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <ItineraryComments
            tripId={tripId}
            itemId={item.id}
            onUpdate={onUpdate}
          />
        </div>
      )}
    </div>
  );
}
