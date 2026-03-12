"use client";

import { ShieldCheck, Mail, User, Camera, FileCheck } from "lucide-react";

export type VerificationStatus = {
  level: "basic" | "verified" | "trusted";
  emailVerified: boolean;
  profileCompleted: boolean;
  photoVerified: boolean;
  idSubmitted?: boolean;
  trustedBadge?: boolean;
};

interface VerificationBadgeProps {
  status: VerificationStatus | { level?: string; trustedBadge?: boolean } | null | undefined;
  size?: "sm" | "md";
  variant?: "light" | "dark";
}

export function VerificationBadge({ status, size = "sm", variant = "light" }: VerificationBadgeProps) {
  if (!status) return null;

  const isTrusted = status.trustedBadge ?? (status.level === "verified" || status.level === "trusted");
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const style =
    variant === "dark"
      ? isTrusted
        ? "bg-primary-500/90 text-white"
        : "bg-white/20 text-white"
      : isTrusted
        ? "bg-primary-100 text-primary-700"
        : "bg-gray-100 text-gray-600";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${style} ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"
      }`}
      title={
        isTrusted
          ? "Verified traveler"
          : "Basic account"
      }
    >
      <ShieldCheck className={iconSize} />
      {isTrusted ? "Verified" : "Basic"}
    </span>
  );
}

export function VerificationStatusList({
  status,
  compact = false,
}: {
  status: VerificationStatus | null | undefined;
  compact?: boolean;
}) {
  if (!status) return null;

  const items = [
    { done: status.emailVerified, label: "Email verified", icon: Mail },
    { done: status.profileCompleted, label: "Profile completed", icon: User },
    { done: status.photoVerified, label: "Photo uploaded", icon: Camera },
    { done: status.idSubmitted, label: "ID submitted", icon: FileCheck },
  ];

  return (
    <div className={compact ? "flex flex-wrap gap-2" : "space-y-2"}>
      {items.map(({ done, label, icon: Icon }) => (
        <div
          key={label}
          className={`flex items-center gap-2 ${compact ? "text-sm" : ""}`}
        >
          {done ? (
            <span className="text-primary-600 font-medium">✓</span>
          ) : (
            <span className="text-gray-400">○</span>
          )}
          <Icon className="w-4 h-4 text-gray-500" />
          <span className={done ? "text-gray-800" : "text-gray-500"}>
            {label}
            {!done && label === "ID submitted" && " ⏳"}
          </span>
        </div>
      ))}
    </div>
  );
}
