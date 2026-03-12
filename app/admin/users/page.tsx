"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [fraudStatus, setFraudStatus] = useState("");
  const [safetyStatus, setSafetyStatus] = useState("");
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (fraudStatus) params.set("fraudStatus", fraudStatus);
    if (safetyStatus) params.set("safetyStatus", safetyStatus);
    if (flaggedOnly) params.set("flagged", "1");
    apiFetch<UserRow[]>(`/api/admin/users?${params}`)
      .then(setUsers)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [q, fraudStatus, safetyStatus, flaggedOnly]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Users</h1>

      <Card hover={false} className="p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Name or email"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-primary-500/30"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fraud status</label>
            <select
              value={fraudStatus}
              onChange={(e) => setFraudStatus(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm"
            >
              <option value="">All</option>
              <option value="normal">Normal</option>
              <option value="suspicious">Suspicious</option>
              <option value="review_required">Review required</option>
              <option value="restricted">Restricted</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Safety status</label>
            <select
              value={safetyStatus}
              onChange={(e) => setSafetyStatus(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm"
            >
              <option value="">All</option>
              <option value="low_risk">Low risk</option>
              <option value="medium_risk">Medium risk</option>
              <option value="high_risk">High risk</option>
            </select>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={flaggedOnly}
              onChange={(e) => setFlaggedOnly(e.target.checked)}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Flagged only</span>
          </label>
        </div>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {loading ? (
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
      ) : users.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center py-8">No users found.</p>
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
                      <span className="px-2 py-0.5 rounded text-xs bg-gray-100">
                        {u.fraudStatus || "normal"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-xs bg-gray-100">
                        {u.safetyStatus || "low_risk"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{u._count.reportsReceived}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/users/${u.id}`} className="text-primary-600 hover:underline">
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
    </div>
  );
}
