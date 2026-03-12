"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageCircle, Bookmark, Flag, MapPin, ShieldCheck, Loader2, AlertCircle, Camera, Star } from "lucide-react";
import { VerificationBadge } from "@/components/VerificationBadge";
import { Button } from "@/components/Button";
import { PageContainer } from "@/components/layout";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

type ApiUser = {
  id: string;
  name: string | null;
  profilePhoto: string | null;
  bio: string | null;
  location: string | null;
  languages: string[] | null;
  travelStyle: string[] | null;
  budgetRange: string | null;
  interests: string[] | null;
  verified: boolean;
  verificationStatus?: { level: string; trustedBadge?: boolean };
  createdAt?: string;
};

const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop";

type ReviewItem = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: { id: string; name: string | null; profilePhoto: string | null };
  trip: { id: string; destination: string; startDate: string; endDate: string } | null;
};

export function ProfilePageContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: currentUser, mutate } = useAuth();
  const id = params?.id as string;
  const tripIdFromUrl = searchParams.get("tripId");

  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoSuccess, setPhotoSuccess] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoPreviewError, setPhotoPreviewError] = useState(false);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const isOwnProfile = currentUser?.id === id;
  const showPhotoPreview = photoUrl.trim().startsWith("http") && !photoPreviewError;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetch(`/api/users/${id}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) throw new Error("User not found");
          throw new Error("Failed to load profile");
        }
        return res.json();
      })
      .then((data) => {
        setUser({
          ...data,
          travelStyle: Array.isArray(data.travelStyle) ? data.travelStyle : [],
          interests: Array.isArray(data.interests) ? data.interests : [],
          languages: Array.isArray(data.languages) ? data.languages : [],
        });
        setPhotoUrl(data.profilePhoto ?? "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Something went wrong"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setReviewsLoading(true);
    fetch(`/api/users/${id}/reviews`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [id]);

  const loadReviews = () => {
    if (!id) return;
    fetch(`/api/users/${id}/reviews`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => {});
  };

  const handleLeaveReview = async () => {
    if (!id || reviewLoading || !currentUser || isOwnProfile) return;
    setReviewLoading(true);
    setReviewError(null);
    try {
      await apiFetch("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          reviewedUserId: id,
          rating: reviewRating,
          comment: reviewComment.trim() || undefined,
          tripId: tripIdFromUrl || undefined,
        }),
      });
      setReviewComment("");
      setReviewRating(5);
      loadReviews();
    } catch (e) {
      setReviewError(e instanceof Error ? e.message : "Failed to submit review");
    } finally {
      setReviewLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id || saveLoading) return;
    setSaveLoading(true);
    setSaveSuccess(false);
    try {
      await apiFetch(`/api/users/${id}/save`, { method: "POST" });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleReport = async () => {
    if (!id || reportLoading) return;
    const reason = window.prompt("Reason for report (optional):") ?? undefined;
    setReportLoading(true);
    setReportSuccess(false);
    try {
      await apiFetch("/api/reports", {
        method: "POST",
        body: JSON.stringify({ reportedUserId: id, reason }),
      });
      setReportSuccess(true);
      setTimeout(() => setReportSuccess(false), 2000);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to report");
    } finally {
      setReportLoading(false);
    }
  };

  const handleSavePhoto = async () => {
    if (!id || photoLoading || !isOwnProfile) return;
    const url = photoUrl.trim();
    if (!url) {
      setPhotoError("Enter an image URL");
      return;
    }
    try {
      const u = new URL(url);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        setPhotoError("URL must start with http:// or https://");
        return;
      }
    } catch {
      setPhotoError("Enter a valid URL");
      return;
    }
    setPhotoLoading(true);
    setPhotoError(null);
    setPhotoSuccess(false);
    try {
      const updated = await apiFetch<ApiUser>(`/api/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ profilePhoto: url }),
      });
      setUser(updated);
      setPhotoSuccess(true);
      setTimeout(() => setPhotoSuccess(false), 2000);
      mutate();
    } catch (e) {
      setPhotoError(e instanceof Error ? e.message : "Failed to save photo");
    } finally {
      setPhotoLoading(false);
    }
  };

  const handleMessage = async () => {
    if (!id || messageLoading) return;
    if (!currentUser) {
      router.push("/login");
      return;
    }
    if (currentUser.id === id) return;
    setMessageLoading(true);
    try {
      const conv = await apiFetch<{ id: string }>("/api/conversations", {
        method: "POST",
        body: JSON.stringify({ otherUserId: id }),
      });
      router.push(`/chat?conversationId=${conv.id}`);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "Failed to start conversation");
    } finally {
      setMessageLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[300px] gap-4">
        <Loader2 className="w-12 h-12 text-[#FF6B35] animate-spin" />
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[300px] gap-4 p-6">
        <AlertCircle className="w-12 h-12 text-amber-500" />
        <p className="text-gray-700 font-medium">{error}</p>
        <Button variant="secondary" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[300px] gap-4">
        <p className="text-gray-500">Profile not found.</p>
        <Link href="/explore" className="text-[#FF6B35] font-medium hover:underline">
          Explore travelers
        </Link>
      </div>
    );
  }

  const imageUrl = user.profilePhoto || DEFAULT_AVATAR;
  const travelStyle = user.travelStyle ?? [];
  const interests = user.interests ?? [];

  return (
    <PageContainer>
      <div className="max-w-2xl mx-auto w-full space-y-8 min-w-0">
      {error && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-3 text-amber-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-amber-600 hover:underline text-sm"
          >
            Dismiss
          </button>
        </div>
      )}

      {isOwnProfile && (
        <>
        <Link
          href="/verification"
          className="block rounded-2xl bg-white p-4 shadow-sm hover:shadow-md border border-gray-100 transition-all mb-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#FF6B35]" />
              <span className="font-medium text-gray-900">Verification Center</span>
            </div>
            <span className="text-[#FF6B35] text-sm">View status →</span>
          </div>
        </Link>
        <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Profile photo</h3>
          <p className="text-sm text-gray-500 mb-3">
            Paste an image URL to update your profile photo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-20 h-20 rounded-xl border-2 border-gray-200 bg-gray-50 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
              {showPhotoPreview ? (
                <Image
                  src={photoUrl.trim()}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                  onError={() => setPhotoPreviewError(true)}
                />
              ) : (
                <Camera className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1 w-full min-w-0">
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => {
                  setPhotoUrl(e.target.value);
                  setPhotoError(null);
                  setPhotoPreviewError(false);
                }}
                placeholder="https://example.com/your-photo.jpg"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 text-sm"
              />
              {photoError && (
                <p className="mt-1 text-sm text-amber-600">{photoError}</p>
              )}
              <Button
                variant="secondary"
                size="sm"
                className="mt-3"
                onClick={handleSavePhoto}
                disabled={photoLoading || !photoUrl.trim()}
              >
                {photoLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : photoSuccess ? (
                  "Saved!"
                ) : (
                  "Save photo"
                )}
              </Button>
            </div>
          </div>
        </div>
        </>
      )}

      <div className="rounded-3xl overflow-hidden shadow-sm hover:shadow-md border border-gray-100 bg-white transition-shadow">
        <div className="aspect-[4/3] relative">
          <Image
            src={imageUrl}
            alt={user.name ?? "Profile"}
            fill
            className="object-cover"
            unoptimized={imageUrl.startsWith("http")}
          />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h1 className="text-2xl font-bold">
              {user.name ?? "Traveler"}
            </h1>
            <p className="flex items-center gap-1 text-white/90">
              <MapPin className="w-4 h-4" /> {user.location ?? "Location not set"}
            </p>
            {(user.verificationStatus?.trustedBadge ?? user.verified) && (
              <VerificationBadge status={user.verificationStatus} size="md" />
            )}
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-600">{user.bio ?? "No bio yet."}</p>
          {travelStyle.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-900">Travel style</h3>
              <div className="flex flex-wrap gap-2 mt-2">
                {travelStyle.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1 rounded-xl bg-primary-50 text-[#FF6B35] text-sm font-medium"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Budget</span>
              <p className="font-medium">{user.budgetRange ?? "—"}</p>
            </div>
            <div>
              <span className="text-gray-500">Interests</span>
              <p className="font-medium">
                {interests.length > 0 ? interests.join(", ") : "—"}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              onClick={handleMessage}
              disabled={messageLoading || currentUser?.id === id}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {messageLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <MessageCircle className="w-4 h-4" />
              )}{" "}
              Message
            </Button>
            <Button
              variant="secondary"
              onClick={handleSave}
              disabled={saveLoading || currentUser?.id === id}
              className="flex items-center gap-2"
            >
              {saveLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}{" "}
              {saveSuccess ? "Saved!" : "Save Profile"}
            </Button>
            <Button
              variant="ghost"
              className="text-gray-500 flex items-center gap-2"
              onClick={handleReport}
              disabled={reportLoading || currentUser?.id === id}
            >
              {reportLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Flag className="w-4 h-4" />
              )}{" "}
              {reportSuccess ? "Reported" : "Report"}
            </Button>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm hover:shadow-md border border-gray-100 transition-all duration-200 mt-8">
        <h3 className="font-semibold text-gray-900">Reviews & references</h3>

        {!isOwnProfile && currentUser && (
          <div className="mt-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-3">Leave a review</p>
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReviewRating(r)}
                  className="p-1"
                  aria-label={`${r} star${r > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`w-6 h-6 ${
                      r <= reviewRating ? "text-amber-400 fill-amber-400" : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your experience (optional)"
              rows={2}
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 text-sm"
            />
            {tripIdFromUrl && (
              <p className="text-xs text-gray-500 mt-2">Review will be linked to this trip</p>
            )}
            {reviewError && <p className="text-sm text-amber-600 mt-2">{reviewError}</p>}
            <Button
              variant="secondary"
              size="sm"
              className="mt-3"
              onClick={handleLeaveReview}
              disabled={reviewLoading}
            >
              {reviewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit review"}
            </Button>
          </div>
        )}

        {reviewsLoading ? (
          <div className="mt-4 flex justify-center py-6">
            <Loader2 className="w-6 h-6 text-primary-500 animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500 text-sm mt-4">
            No reviews yet.
            {!isOwnProfile && currentUser
              ? " Be the first to leave a reference!"
              : " Connect to leave a reference after your trip."}
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {reviews.map((r) => (
              <div
                key={r.id}
                className="p-4 rounded-xl border border-gray-100 bg-gray-50/50"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700">
                      {r.reviewer.name?.[0] ?? "?"}
                    </div>
                    <span className="font-medium text-gray-900">
                      {r.reviewer.name ?? "Traveler"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          s <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-gray-600 text-sm mt-2">{r.comment}</p>}
                {r.trip && (
                  <p className="text-xs text-gray-500 mt-2">
                    Trip to {r.trip.destination}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
      </div>
    </PageContainer>
  );
}
