"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldCheck, Mail, User, Camera, FileCheck, Loader2 } from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { apiFetch } from "@/lib/api";

type StatusResponse = {
  level: string;
  emailVerified: boolean;
  profileCompleted: boolean;
  photoVerified: boolean;
  idSubmitted?: boolean;
  trustedBadge: boolean;
};

export default function VerificationCenterPage() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<StatusResponse>("/api/verification/status")
      .then(setStatus)
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, []);

  const handleResend = async () => {
    setSending(true);
    setSendSuccess(false);
    setSendError(null);
    try {
      const res = await apiFetch<{ sent: boolean; message?: string }>("/api/verification/send-email", {
        method: "POST",
      });
      if (res.sent) {
        setSendSuccess(true);
        setTimeout(() => setSendSuccess(false), 4000);
      } else {
        setSendError(res.message ?? "Could not send");
      }
    } catch (e) {
      setSendError(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const isTrusted = status?.trustedBadge ?? false;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Verification Center</h1>
      <p className="text-gray-600">
        Build trust with other travelers. Complete these steps to earn your verified badge.
      </p>

      <Card className={isTrusted ? "border-green-200 bg-green-50/30" : ""}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isTrusted ? "bg-green-100 text-green-700" : "bg-primary-100 text-primary-600"
            }`}
          >
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              {isTrusted ? "Verified Traveler" : "Verification Status"}
            </h2>
            <p className="text-sm text-gray-600">
              {isTrusted
                ? "You've completed verification. Your profile shows a trusted badge."
                : "Complete the steps below to earn your verified badge."}
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-6">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {status?.emailVerified ? (
                <span className="text-green-600 text-lg">✓</span>
              ) : (
                <span className="text-gray-300 text-lg">○</span>
              )}
              <Mail className="w-5 h-5 text-gray-500" />
              <span className={status?.emailVerified ? "text-gray-900" : "text-gray-500"}>
                Email verified
              </span>
            </div>
            {status?.emailVerified ? (
              <span className="text-sm text-green-600 font-medium">Done</span>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                {sendSuccess && (
                  <span className="text-sm text-green-600">Check your inbox</span>
                )}
                {sendError && (
                  <span className="text-sm text-red-600">{sendError}</span>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleResend}
                  disabled={sending}
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send verification email"}
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {status?.profileCompleted ? (
                <span className="text-green-600 text-lg">✓</span>
              ) : (
                <span className="text-gray-300 text-lg">○</span>
              )}
              <User className="w-5 h-5 text-gray-500" />
              <span className={status?.profileCompleted ? "text-gray-900" : "text-gray-500"}>
                Profile completed
              </span>
            </div>
            {status?.profileCompleted ? (
              <span className="text-sm text-green-600 font-medium">Done</span>
            ) : (
              <Link href="/profile" className="text-sm text-primary-600 font-medium hover:underline">
                Complete
              </Link>
            )}
          </div>

          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              {status?.photoVerified ? (
                <span className="text-green-600 text-lg">✓</span>
              ) : (
                <span className="text-gray-300 text-lg">○</span>
              )}
              <Camera className="w-5 h-5 text-gray-500" />
              <span className={status?.photoVerified ? "text-gray-900" : "text-gray-500"}>
                Photo uploaded
              </span>
            </div>
            {status?.photoVerified ? (
              <span className="text-sm text-green-600 font-medium">Done</span>
            ) : (
              <Link href="/profile" className="text-sm text-primary-600 font-medium hover:underline">
                Add photo
              </Link>
            )}
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="text-gray-300 text-lg">○</span>
              <FileCheck className="w-5 h-5 text-gray-400" />
              <span className="text-gray-500">ID submitted</span>
            </div>
            <span className="text-sm text-gray-400">Coming soon</span>
          </div>
        </div>
      </Card>

      <Card className="bg-amber-50/80 border-amber-100">
        <h3 className="font-semibold text-gray-900">Why verification matters</h3>
        <p className="text-sm text-gray-600 mt-2">
          Verified travelers get more matches and build trust faster. Complete your profile with a
          photo and bio to show you&apos;re a real traveler looking for genuine connections.
        </p>
      </Card>
    </div>
  );
}
