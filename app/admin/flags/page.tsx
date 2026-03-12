"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { apiFetch } from "@/lib/api";

type FlagsData = {
  safetyFlags: Array<{
    id: string;
    targetType: string;
    targetId: string | null;
    reason: string;
    severity: string;
    createdAt: string;
    user: { id: string; name: string | null; email: string } | null;
  }>;
  fraudEvents: Array<{
    id: string;
    eventType: string;
    reason: string | null;
    metadata: unknown;
    createdAt: string;
    user: { id: string; name: string | null; email: string };
  }>;
};

export default function AdminFlagsPage() {
  const [data, setData] = useState<FlagsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"safety" | "fraud">("safety");

  useEffect(() => {
    setLoading(true);
    apiFetch<FlagsData>(`/api/admin/flags?type=${tab === "safety" ? "safety" : "fraud"}`)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [tab]);

  const list = tab === "safety" ? (data?.safetyFlags ?? []) : (data?.fraudEvents ?? []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Flags</h1>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("safety")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === "safety" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"
          }`}
        >
          Safety flags
        </button>
        <button
          type="button"
          onClick={() => setTab("fraud")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === "fraud" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"
          }`}
        >
          Fraud events
        </button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <p className="text-red-700">{error}</p>
        </Card>
      )}

      {loading ? (
        <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
      ) : list.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center py-8">No {tab} flags.</p>
        </Card>
      ) : tab === "safety" ? (
        <Card hover={false} className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-700">User</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Severity</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Reason</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700"></th>
                </tr>
              </thead>
              <tbody>
                {(data?.safetyFlags ?? []).map((f) => (
                  <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {f.user ? (
                        <Link href={`/admin/users/${f.user.id}`} className="text-primary-600 hover:underline">
                          {f.user.email}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">{f.targetType}</td>
                    <td className="px-4 py-3">{f.severity}</td>
                    <td className="px-4 py-3 max-w-xs truncate">{f.reason}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(f.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {f.user && (
                        <Link href={`/admin/users/${f.user.id}`} className="text-primary-600 hover:underline">
                          Review
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card hover={false} className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-4 py-3 font-medium text-gray-700">User</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Event type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Reason</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-700"></th>
                </tr>
              </thead>
              <tbody>
                {(data?.fraudEvents ?? []).map((e) => (
                  <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/admin/users/${e.user.id}`} className="text-primary-600 hover:underline">
                        {e.user.email}
                      </Link>
                    </td>
                    <td className="px-4 py-3">{e.eventType}</td>
                    <td className="px-4 py-3">{e.reason || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(e.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/users/${e.user.id}`} className="text-primary-600 hover:underline">
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
