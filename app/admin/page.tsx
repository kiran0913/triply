"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Flag, FileWarning } from "lucide-react";
import { Card } from "@/components/Card";
import { apiFetch } from "@/lib/api";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  fraudStatus: string | null;
  safetyStatus: string | null;
  verificationLevel: string | null;
  _count: { reportsReceived: number; fraudEvents: number; safetyFlags: number };
};

export default function AdminOverviewPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<UserRow[]>("/api/admin/users?flagged=1")
      .then(setUsers)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <p className="text-red-700">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Flagged users</h1>
      <p className="text-gray-600 text-sm">
        Users with fraud or safety flags. <Link href="/admin/users" className="text-primary-600 hover:underline">View all users</Link>
      </p>

      {users.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center py-8">No flagged users.</p>
          <Link href="/admin/users" className="block text-center text-primary-600 text-sm hover:underline">
            Browse all users
          </Link>
        </Card>
      ) : (
        <Card hover={false} className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-700">User</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Fraud</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Safety</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Reports</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Events</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{u.name || "—"}</p>
                        <p className="text-gray-500 text-xs">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          u.fraudStatus === "restricted"
                            ? "bg-red-100 text-red-700"
                            : u.fraudStatus === "review_required"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {u.fraudStatus || "normal"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          u.safetyStatus === "high_risk"
                            ? "bg-red-100 text-red-700"
                            : u.safetyStatus === "medium_risk"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {u.safetyStatus || "low_risk"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{u._count.reportsReceived}</td>
                    <td className="px-4 py-3">{u._count.fraudEvents + u._count.safetyFlags}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="text-primary-600 font-medium hover:underline"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <Link href="/admin/users">
          <Card className="flex items-center gap-3">
            <Users className="w-8 h-8 text-primary-500" />
            <div>
              <p className="font-medium text-gray-900">Users</p>
              <p className="text-sm text-gray-500">Search and filter</p>
            </div>
          </Card>
        </Link>
        <Link href="/admin/flags">
          <Card className="flex items-center gap-3">
            <Flag className="w-8 h-8 text-amber-500" />
            <div>
              <p className="font-medium text-gray-900">Flags</p>
              <p className="text-sm text-gray-500">Fraud & safety events</p>
            </div>
          </Card>
        </Link>
        <Link href="/admin/reports">
          <Card className="flex items-center gap-3">
            <FileWarning className="w-8 h-8 text-red-500" />
            <div>
              <p className="font-medium text-gray-900">Reports</p>
              <p className="text-sm text-gray-500">User reports</p>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
