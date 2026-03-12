"use client";

import Link from "next/link";
import { Card } from "@/components/Card";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: { label: string; href: string };
  className?: string;
  /** Use for gradient/special cards */
  variant?: "default" | "highlight";
}

/**
 * Standard section card: header (title + optional subtitle), content, optional actions.
 * Uses space-y-4 inside for consistent spacing.
 */
export function SectionCard({
  title,
  subtitle,
  children,
  action,
  className = "",
  variant = "default",
}: SectionCardProps) {
  const isHighlight = variant === "highlight";

  return (
    <Card
      className={`p-6 ${isHighlight ? "bg-gradient-to-r from-[#FF6B35] to-[#FDBA3B] text-white border-0" : ""} ${className}`}
      hover={!isHighlight}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className={`text-lg font-semibold ${isHighlight ? "text-white" : "text-slate-900"}`}>
              {title}
            </h2>
            {subtitle && (
              <p className={`text-sm mt-0.5 ${isHighlight ? "text-white/90" : "text-slate-600"}`}>
                {subtitle}
              </p>
            )}
          </div>
          {action && (
            <Link
              href={action.href}
              className={`text-sm font-medium shrink-0 ${isHighlight ? "text-white hover:underline" : "text-[#FF6B35] hover:underline"}`}
            >
              {action.label}
            </Link>
          )}
        </div>
        <div>{children}</div>
      </div>
    </Card>
  );
}
