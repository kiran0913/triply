"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  className?: string;
  to?: string;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  to,
  ...props
}: ButtonProps) {
  const base =
    "rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center";

  const variants = {
    primary:
      "bg-[#FF6B35] hover:bg-primary-700 text-white shadow-sm hover:shadow-md hover:-translate-y-px active:translate-y-0 focus:ring-primary-500/40",
    secondary:
      "border border-[#E5E7EB] bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-300 shadow-xs hover:shadow-sm focus:ring-gray-400/30",
    ghost:
      "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400/20",
    destructive:
      "bg-[#DC2626] hover:bg-red-700 text-white shadow-sm hover:shadow-md focus:ring-red-500/40",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (to) {
    return (
      <Link href={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <motion.div whileTap={{ scale: 0.98 }} className="inline-flex">
      <button type="button" className={classes} {...props}>
        {children}
      </button>
    </motion.div>
  );
}
