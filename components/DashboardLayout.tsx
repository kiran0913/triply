"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  Home,
  Compass,
  MessageCircle,
  User,
  MapPin,
  CalendarDays,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const DESKTOP_NAV = [
  { href: "/matches", label: "Matches", icon: Compass },
  { href: "/explore", label: "Explore", icon: MapPin },
  { href: "/explore", label: "Trips", icon: CalendarDays },
  { href: "/chat", label: "Chat", icon: MessageCircle },
];

const MOBILE_NAV = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/matches", icon: Compass, label: "Matches" },
  { href: "/explore", icon: MapPin, label: "Explore" },
  { href: "/explore", icon: CalendarDays, label: "Trips" },
  { href: "/chat", icon: MessageCircle, label: "Chat" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, error, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    fetch("/api/notifications/unread-count", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : { unreadCount: 0 }))
      .then((data) => setUnreadCount(data.unreadCount ?? 0))
      .catch(() => setUnreadCount(0));
  }, [user]);

  useEffect(() => {
    const handler = () => {
      if (!user) return;
      fetch("/api/notifications/unread-count", { credentials: "include" })
        .then((res) => (res.ok ? res.json() : { unreadCount: 0 }))
        .then((data) => setUnreadCount(data.unreadCount ?? 0))
        .catch(() => {});
    };
    window.addEventListener("notifications-updated", handler);
    return () => window.removeEventListener("notifications-updated", handler);
  }, [user]);

  const handleLogout = async () => {
    setProfileOpen(false);
    await logout();
    router.push("/login");
    router.refresh();
  };

  const displayInitial = user?.name?.[0]?.toUpperCase() ?? "?";
  const hasProfilePhoto = user?.profilePhoto && user.profilePhoto.startsWith("http");

  const isActive = (href: string) => {
    if (href === "/profile") return pathname.startsWith("/profile");
    if (href === "/trips/public") return pathname.startsWith("/trips") || pathname.startsWith("/explore");
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  };

  return (
    <div className="min-h-screen w-full bg-[#FFF8F2] pb-24 md:pb-0 overflow-x-hidden">
      {/* Navbar — Sunset Travel Theme */}
      <header className="sticky top-0 z-40 h-14 md:h-[60px] border-b border-[#E5E7EB] bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
        <div className="container-main h-full flex items-center justify-between gap-2 min-w-0 overflow-visible">
          <Link
            href="/dashboard"
            className="font-bold text-lg tracking-tight text-[#FF6B35] hover:text-primary-700 transition-colors shrink-0"
          >
            Triply
          </Link>

          <nav className="hidden md:flex items-center gap-0.5 flex-1 min-w-0 max-w-xl mx-4">
            {DESKTOP_NAV.map((n) => (
              <Link
                key={n.label}
                href={n.href}
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive(n.href)
                    ? "text-[#FF6B35] bg-primary-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="hidden sm:block flex-1 min-w-0 max-w-xs">
            <div className="relative min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="search"
                placeholder="Search destination"
                className="input-base pl-9 pr-4 py-2 text-sm border-[#E5E7EB] bg-gray-50/50 focus:bg-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 overflow-visible">
            <Link
              href="/notifications"
              className="p-2.5 rounded-lg hover:bg-gray-100/80 transition-colors relative text-gray-600 hover:text-gray-900"
              title="Notifications"
            >
              <Bell className="w-5 h-5" strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF6B35] text-white text-[10px] font-semibold flex items-center justify-center ring-2 ring-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>

            <div className="relative overflow-visible">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-0.5 rounded-full hover:bg-gray-100/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-2"
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-[#E5E7EB] bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center font-semibold text-primary-700 text-sm shrink-0">
                  {loading ? (
                    <span className="animate-pulse text-xs">…</span>
                  ) : hasProfilePhoto ? (
                    <Image
                      src={user!.profilePhoto!}
                      alt={user?.name || "Profile"}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  ) : (
                    displayInitial
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 hidden sm:block transition-transform ${profileOpen ? "rotate-180" : ""}`} strokeWidth={2} />
              </button>

              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-[60]"
                    onClick={() => setProfileOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 top-full mt-2 w-52 min-w-[12rem] max-w-[calc(100vw-2rem)] rounded-xl bg-white shadow-lg border border-[#E5E7EB] py-1.5 z-[60] max-h-[calc(100vh-6rem)] overflow-y-auto animate-fade-in">
                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      Profile
                    </Link>
                    <Link
                      href="/create"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-gray-400" />
                      Create Trip
                    </Link>
                    <Link
                      href="/stories"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Stories
                    </Link>
                    <Link
                      href="/assistant"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      AI Assistant
                    </Link>
                    <Link
                      href="/safety"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Safety
                    </Link>
                    <div className="my-1 border-t border-gray-100" />
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm font-medium text-[#DC2626] hover:bg-red-50 transition-colors text-left"
                      aria-label="Sign out"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {error === "Unauthorized" && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-center text-sm text-amber-800">
          Session expired.{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="font-medium underline focus:outline-none focus:ring-2 focus:ring-amber-500/30 rounded"
          >
            Log in again
          </button>
        </div>
      )}

      <main className="container-main w-full min-w-0 py-8 md:py-10">{children}</main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 safe-area-pb bg-white/90 backdrop-blur-xl border-t border-[#E5E7EB] flex justify-around items-center md:hidden z-50 px-2">
        {MOBILE_NAV.map((n) => (
          <Link
            key={n.label}
            href={n.href}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 py-2 rounded-lg transition-all duration-150 ${
              (n.href === "/profile"
                ? pathname.startsWith("/profile")
                : n.href === "/explore" && n.label === "Trips"
                ? pathname.startsWith("/explore")
                : pathname === n.href || (n.href === "/dashboard" && pathname === "/dashboard"))
                ? "text-[#FF6B35] bg-primary-50"
                : "text-gray-500 hover:text-gray-700 active:bg-gray-100/80"
            }`}
          >
            <n.icon className="w-5 h-5 shrink-0" strokeWidth={pathname === n.href ? 2.5 : 1.5} />
            <span className="text-[10px] font-medium truncate max-w-full">{n.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
