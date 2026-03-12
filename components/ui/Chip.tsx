"use client";

interface ChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: "default" | "primary" | "success" | "warning";
  size?: "sm" | "md";
}

export function Chip({
  children,
  variant = "default",
  size = "sm",
  className = "",
  ...props
}: ChipProps) {
  const variants = {
    default: "bg-slate-100 text-slate-700 border-slate-200/80",
    primary: "bg-primary-50 text-primary-700 border-primary-200/80",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    warning: "bg-amber-50 text-amber-700 border-amber-200/80",
  };

  const sizes = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg font-medium border ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
