"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, Users, Flag, FileWarning, ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    apiFetch<{ admin: boolean }>("/api/admin/check")
      .then((r) => setAllowed(r.admin))
      .catch(() => setAllowed(false));
  }, []);

  useEffect(() => {
    if (allowed === false) {
      router.replace("/dashboard");
    }
  }, [allowed, router]);

  if (allowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-500">Checking access...</p>
        </div>
      </div>
    );
  }

  if (!allowed) return null;

  const nav = [
    { href: "/admin", label: "Overview", icon: Shield },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/flags", label: "Flags", icon: Flag },
    { href: "/admin/reports", label: "Reports", icon: FileWarning },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-gray-500 hover:text-gray-700 flex items-center gap-1 text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Back to app
            </Link>
            <span className="text-gray-300">|</span>
            <h1 className="font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-600" /> Admin
            </h1>
          </div>
        </div>
        <nav className="max-w-6xl mx-auto px-4 flex gap-1 border-t border-gray-100">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                (n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href))
                  ? "border-amber-500 text-amber-700"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <n.icon className="w-4 h-4" /> {n.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
