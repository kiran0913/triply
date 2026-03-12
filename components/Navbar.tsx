"use client";

import Link from "next/link";
import { Search } from "lucide-react";

interface NavbarProps {
  variant?: "light" | "dark";
  showSearch?: boolean;
}

export function Navbar({ variant = "light", showSearch = false }: NavbarProps) {
  const isDark = variant === "dark";
  return (
    <nav
      className={`sticky top-0 z-50 h-14 md:h-[60px] border-b ${
        isDark
          ? "bg-white/5 backdrop-blur-xl border-white/10"
          : "bg-white/80 backdrop-blur-xl border-[#E5E7EB] supports-[backdrop-filter]:bg-white/80"
      }`}
    >
      <div className="container-main h-full flex items-center justify-between">
        <Link
          href="/"
          className={`font-bold text-lg tracking-tight shrink-0 ${
            isDark ? "text-white" : "text-[#FF6B35] hover:text-primary-700"
          } transition-colors`}
        >
          Triply
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/explore"
            className={`text-sm font-medium transition-colors ${
              isDark ? "text-white/90 hover:text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Explore
          </Link>
          <Link
            href="/matches"
            className={`text-sm font-medium transition-colors ${
              isDark ? "text-white/90 hover:text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Matches
          </Link>
          <a
            href="/#how-it-works"
            className={`text-sm font-medium transition-colors ${
              isDark ? "text-white/90 hover:text-white" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            How it Works
          </a>
        </div>
        <div className="flex items-center gap-2">
          {showSearch && (
            <button
              type="button"
              className="p-2.5 rounded-lg hover:bg-slate-100/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
            </button>
          )}
          <Link
            href="/login"
            className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
              isDark ? "text-white/90 hover:text-white hover:bg-white/10" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
            }`}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-[#FF6B35] hover:bg-primary-700 text-white px-4 py-2.5 text-sm font-semibold shadow-sm hover:shadow-md hover:-translate-y-px transition-all duration-200"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
