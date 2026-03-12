"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Result = "loading" | "success" | "expired" | "invalid";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [result, setResult] = useState<Result>("loading");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setResult("invalid");
      return;
    }

    fetch(`/api/verification/confirm?token=${encodeURIComponent(token)}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setResult("success");
        else if (data.error === "expired") setResult("expired");
        else setResult("invalid");
      })
      .catch(() => setResult("invalid"));
  }, [searchParams]);

  if (result === "loading") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {result === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Email verified</h1>
            <p className="text-gray-600 mt-2">
              Your email has been verified. You can now complete your profile to earn your verified
              badge.
            </p>
            <Link
              href="/verification"
              className="mt-6 inline-block px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
            >
              Go to Verification Center
            </Link>
          </>
        )}

        {result === "expired" && (
          <>
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Link expired</h1>
            <p className="text-gray-600 mt-2">
              This verification link has expired. Request a new one from the Verification Center.
            </p>
            <Link
              href="/verification"
              className="mt-6 inline-block px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
            >
              Request new link
            </Link>
          </>
        )}

        {result === "invalid" && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Invalid link</h1>
            <p className="text-gray-600 mt-2">
              This verification link is invalid or has already been used. Request a new one from the
              Verification Center.
            </p>
            <Link
              href="/verification"
              className="mt-6 inline-block px-6 py-3 rounded-xl bg-primary-600 text-white font-semibold hover:bg-primary-700 transition-colors"
            >
              Go to Verification Center
            </Link>
          </>
        )}

        <Link href="/dashboard" className="block mt-4 text-gray-500 text-sm hover:underline">
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
