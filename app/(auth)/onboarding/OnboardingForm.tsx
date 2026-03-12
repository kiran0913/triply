"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Camera } from "lucide-react";
import { Button } from "@/components/Button";
import { TRAVEL_STYLES, INTERESTS } from "@/data/mockData";

const GENDERS = ["Prefer not to say", "Male", "Female", "Non-binary", "Other"];
const ROOM_OPTIONS = ["Private room", "Shared room", "Flexible"];
const DEFAULT_AVATAR =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop";

function isValidImageUrl(url: string): boolean {
  if (!url.trim()) return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const joinTripId = searchParams.get("joinTrip");
  const [step, setStep] = useState(1);
  const [photoLoadError, setPhotoLoadError] = useState(false);
  const [form, setForm] = useState({
    name: "",
    ageRange: "25-34",
    gender: "",
    location: "",
    bio: "",
    profilePhoto: "",
    destinations: "",
    dates: "",
    budget: "Medium",
    travelStyle: [] as string[],
    interests: [] as string[],
    groupSize: "2",
    smoking: "No",
    drinking: "Social",
    safety: "Standard",
    roomShare: "Flexible",
    language: "English",
  });

  const progress = (step / 3) * 100;
  const totalSteps = 3;

  const update = (k: keyof typeof form, v: string | string[]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const toggle = (k: "travelStyle" | "interests", v: string) =>
    setForm((f) => ({
      ...f,
      [k]: f[k].includes(v) ? f[k].filter((x) => x !== v) : [...f[k], v],
    }));

  const next = async () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      try {
        const me = await fetch("/api/auth/me", { credentials: "include" }).then(
          (r) => r.json()
        );
        if (me.id) {
          await fetch(`/api/users/${me.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              name: form.name || undefined,
              bio: form.bio || undefined,
              location: form.location || undefined,
              profilePhoto: form.profilePhoto.trim() || undefined,
              budgetRange: form.budget || undefined,
              travelStyle: form.travelStyle.length ? form.travelStyle : undefined,
              interests: form.interests.length ? form.interests : undefined,
              languages: form.language
                ? form.language.split(",").map((s) => s.trim()).filter(Boolean)
                : undefined,
            }),
          });
        }
      } catch {
        // ignore
      }
      if (joinTripId) {
        try {
          await fetch(`/api/trips/${joinTripId}/join`, {
            method: "POST",
            credentials: "include",
          });
          router.push(redirect || `/trips/${joinTripId}`);
        } catch {
          router.push(redirect || "/dashboard");
        }
      } else {
        router.push(redirect || "/dashboard");
      }
      router.refresh();
    }
  };
  const prev = () => step > 1 && setStep(step - 1);

  return (
    <div className="min-h-screen bg-gradient-mesh py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-10">
          <div className="h-2 rounded-full bg-gray-200/80 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-primary-600 to-primary-500 rounded-full"
            />
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Step {step} of {totalSteps}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-900">
                Tell us about you
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age range
                </label>
                <select
                  value={form.ageRange}
                  onChange={(e) => update("ageRange", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                >
                  {["18-24", "25-34", "35-44", "45-54", "55+"].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender (optional)
                </label>
                <select
                  value={form.gender}
                  onChange={(e) => update("gender", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                >
                  {GENDERS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="San Francisco, CA"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => update("bio", e.target.value)}
                  rows={3}
                  placeholder="A few words about you and your travel style"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile photo (optional)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  Paste an image URL to add a profile photo
                </p>
                <div className="flex gap-4 items-start">
                  <div className="w-24 h-24 rounded-2xl border-2 border-gray-200 bg-gray-50/50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {isValidImageUrl(form.profilePhoto) && !photoLoadError ? (
                      <Image
                        src={form.profilePhoto.trim()}
                        alt="Preview"
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                        unoptimized
                        onError={() => setPhotoLoadError(true)}
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      type="url"
                      value={form.profilePhoto}
                      onChange={(e) => {
                      update("profilePhoto", e.target.value);
                      setPhotoLoadError(false);
                    }}
                      placeholder="https://example.com/your-photo.jpg"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-400 text-sm"
                    />
                    {form.profilePhoto.trim() && !isValidImageUrl(form.profilePhoto) && (
                      <p className="mt-1 text-xs text-amber-600">
                        Enter a valid URL (e.g. https://...)
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-900">
                Trip details
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred destinations
                </label>
                <input
                  type="text"
                  value={form.destinations}
                  onChange={(e) => update("destinations", e.target.value)}
                  placeholder="e.g. Bali, Tokyo, Barcelona"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Travel dates
                </label>
                <input
                  type="text"
                  value={form.dates}
                  onChange={(e) => update("dates", e.target.value)}
                  placeholder="e.g. Dec 2024 - Jan 2025"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget range
                </label>
                <select
                  value={form.budget}
                  onChange={(e) => update("budget", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                >
                  {["Budget", "Medium", "Luxury"].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Travel style
                </label>
                <div className="flex flex-wrap gap-2">
                  {TRAVEL_STYLES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggle("travelStyle", s)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        form.travelStyle.includes(s)
                          ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-soft"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-900">
                Preferences
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS.map((i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggle("interests", i)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        form.interests.includes(i)
                          ? "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-soft"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred group size
                </label>
                <select
                  value={form.groupSize}
                  onChange={(e) => update("groupSize", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                >
                  {["1-2", "2", "3-4", "5+"].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Smoking
                  </label>
                  <select
                    value={form.smoking}
                    onChange={(e) => update("smoking", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200"
                  >
                    {["No", "Yes", "Occasionally"].map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Drinking
                  </label>
                  <select
                    value={form.drinking}
                    onChange={(e) => update("drinking", e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200"
                  >
                    {["No", "Social", "Yes"].map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Safety preferences
                </label>
                <select
                  value={form.safety}
                  onChange={(e) => update("safety", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                >
                  {["Standard", "Extra cautious", "Flexible"].map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room sharing
                </label>
                <select
                  value={form.roomShare}
                  onChange={(e) => update("roomShare", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200"
                >
                  {ROOM_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Languages spoken
                </label>
                <input
                  type="text"
                  value={form.language}
                  onChange={(e) => update("language", e.target.value)}
                  placeholder="e.g. English, Spanish"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="p-5 rounded-2xl bg-primary-50/80 border border-primary-100 shadow-soft">
                <p className="text-sm text-primary-800 font-medium">
                  Verification badge
                </p>
                <p className="text-xs text-primary-600 mt-1">
                  Verify your identity for added trust. You can do this later.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10 flex justify-between">
          <Button
            variant="ghost"
            onClick={prev}
            disabled={step === 1}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <Button onClick={next} className="flex items-center gap-2">
            {step === totalSteps ? "Complete" : "Next"}{" "}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
