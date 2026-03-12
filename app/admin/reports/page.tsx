"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/Card";
import { apiFetch } from "@/lib/api";

type ReportRow = {
  id: string;
  reason: string | null;
  createdAt: string;
  reporter: { id: string; name: string | null; email: string };
  reportedUser: { id: string; name: string | null; email: string; fraudStatus: string | null };
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ReportRow[]>("/api/admin/reports")
      .then(setReports)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <p className="text-red-700">{error}</p>
      </Card>
    );
  }

  if (loading) {
    return <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />;
  }

  if (reports.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-bold text-gray-900">Reports</h1>
        <Card>
          <p className="text-gray-500 text-center py-8">No reports.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Reports</h1>
      <Card hover={false} className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-700">Reporter</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Reported user</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Reason</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">Date</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="text-gray-900">{r.reporter.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${r.reportedUser.id}`} className="text-primary-600 hover:underline">
                      {r.reportedUser.email}
                    </Link>
                    {r.reportedUser.fraudStatus && r.reportedUser.fraudStatus !== "normal" && (
                      <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-amber-100 text-amber-800">
                        {r.reportedUser.fraudStatus}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">{r.reason || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(r.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${r.reportedUser.id}`} className="text-primary-600 hover:underline">
                      Review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
