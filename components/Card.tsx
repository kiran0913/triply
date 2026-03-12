"use client";

import { motion } from "framer-motion";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  /** No border, softer look */
  flat?: boolean;
}

export function Card({
  children,
  className = "",
  hover = true,
  flat = false,
  ...props
}: CardProps) {
  const borderClass = flat
    ? "border border-gray-100"
    : "border border-[#E5E7EB]";

  return (
    <motion.div
      whileHover={
        hover
          ? {
              y: -1,
              transition: { duration: 0.2 },
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)",
            }
          : undefined
      }
      className={`
        rounded-2xl bg-white shadow-sm transition-all duration-200
        ${hover ? "hover:shadow-lg" : ""}
        ${borderClass}
        ${className}
      `}
      {...(props as React.ComponentProps<typeof motion.div>)}
    >
      {children}
    </motion.div>
  );
}
