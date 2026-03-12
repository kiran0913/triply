"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface ShareButtonProps {
  tripId: string;
  slug: string;
  title: string;
  destination: string;
}

export function ShareButton({ tripId, slug, title, destination }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/t/${slug}`
      : `https://travelbuddy.app/t/${slug}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      await apiFetch(`/api/trips/${tripId}/share`, {
        method: "POST",
        body: JSON.stringify({ shareSource: "copy_link" }),
      }).catch(() => {});
    } catch {
      setCopied(false);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} | ${destination}`,
          text: `Join ${title} - ${destination} on Travel Buddy`,
          url: shareUrl,
        });
        await apiFetch(`/api/trips/${tripId}/share`, {
          method: "POST",
          body: JSON.stringify({ shareSource: "other" }),
        }).catch(() => {});
      } catch {
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <button
      type="button"
      onClick={handleNativeShare}
      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-600" />
          Copied!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          Share
        </>
      )}
    </button>
  );
}
