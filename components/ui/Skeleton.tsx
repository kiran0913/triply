"use client";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  shimmer?: boolean;
}

export function Skeleton({
  className = "",
  shimmer = false,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={`rounded-lg bg-slate-200 animate-pulse ${shimmer ? "skeleton-shimmer" : ""} ${className}`}
      aria-hidden
      {...props}
    />
  );
}
