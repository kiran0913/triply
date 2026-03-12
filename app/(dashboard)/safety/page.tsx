"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, AlertTriangle } from "lucide-react";
import { Card } from "@/components/Card";
import { apiFetch } from "@/lib/api";

type VerificationStatus = {
  level: string;
  emailVerified: boolean;
  profileCompleted: boolean;
  photoVerified: boolean;
  trustedBadge: boolean;
};

export default function SafetyCenterPage() {
  const [verification, setVerification] = useState<VerificationStatus | null>(null);

  useEffect(() => {
    apiFetch<VerificationStatus>("/api/verification/status")
      .then(setVerification)
      .catch(() => setVerification(null));
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Safety Center</h1>
      <p className="text-gray-600">
        Your safety matters. Learn how we protect travelers and how you can stay safe.
      </p>

      {verification && (
        <Card>
          <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-500" /> My verification status
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {verification.trustedBadge
              ? "You have a verified badge. Other travelers can trust your profile."
              : "Complete verification to earn a trusted badge."}
          </p>
          <Link
            href="/verification"
            className="text-primary-600 font-medium text-sm hover:underline"
          >
            View verification center →
          </Link>
        </Card>
      )}

      <Card>
        <h2 className="font-semibold text-gray-900 mb-3">Community safety tips</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span>
            Meet in public places first. Share your itinerary with someone you trust.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span>
            Verify your match&apos;s profile and reviews before meeting.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span>
            Be cautious of anyone who asks for money or wants to move off the platform quickly.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 mt-0.5">•</span>
            Trust your instincts. If something feels wrong, it probably is.
          </li>
        </ul>
      </Card>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-3">How verification works</h2>
        <p className="text-sm text-gray-600 mb-3">
          We verify travelers through email, profile completion, and photo upload. Verified
          travelers show a green badge. This helps everyone find trustworthy travel buddies.
        </p>
        <Link href="/verification" className="text-primary-600 font-medium text-sm hover:underline">
          Complete verification →
        </Link>
      </Card>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-3">How to report a user</h2>
        <p className="text-sm text-gray-600 mb-3">
          If someone behaves inappropriately, sends suspicious messages, or violates our
          guidelines, report them from their profile. We take reports seriously and will review
          flagged accounts.
        </p>
        <Link href="/matches" className="text-primary-600 font-medium text-sm hover:underline">
          Go to matches →
        </Link>
      </Card>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-3">Trust badge explained</h2>
        <p className="text-sm text-gray-600">
          A green &quot;Verified&quot; badge means the user has completed email verification,
          profile details, and uploaded a photo. We use AI and rules to detect suspicious
          content and protect the community. Trusted travelers get more matches.
        </p>
      </Card>

      <Card className="bg-amber-50/80 border-amber-100">
        <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600" /> Emergency disclaimer
        </h2>
        <p className="text-sm text-gray-600">
          Travel Buddy is for connecting travelers. In an emergency, contact local authorities
          or emergency services. We are not responsible for meetings or activities outside our
          platform.
        </p>
      </Card>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-3">Contact & support</h2>
        <p className="text-sm text-gray-600">
          Questions about safety or need to report an issue? Email us at{" "}
          <span className="font-mono text-gray-800">support@travelbuddy.example.com</span> or
          use the report feature on user profiles. We typically respond within 24–48 hours.
        </p>
      </Card>
    </div>
  );
}
