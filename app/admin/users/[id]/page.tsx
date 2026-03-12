"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { apiFetch } from "@/lib/api";

type UserDetail = {
  id: string;
  email: string;
  name: string | null;
  bio: string | null;
  fraudStatus: string | null;
  safetyStatus: string | null;
  safetyScore: number | null;
  verificationLevel: string | null;
  flaggedReasons: string[] | null;
  reportsReceived: Array<{
    id: string;
    reason: string | null;
    createdAt: string;
    reporter: { id: string; name: string | null; email: string };
  }>;
  fraudEvents: Array<{
    id: string;
    eventType: string;
    reason: string | null;
    metadata: unknown;
    createdAt: string;
  }>;
  safetyFlags: Array<{
    id: string;
    targetType: string;
    targetId: string | null;
    reason: string;
    severity: string;
    createdAt: string;
  }>;
  recentMessages: Array<{ id: string; content: string; createdAt: string }>;
  recentTrips: Array<{
    id: string;
    title: string;
    destination: string;
    status: string;
    createdAt: string;
  }>;
  _count: {
    sentMessages: number;
    savedProfiles: number;
    hostedTrips: number;
    reportsReceived: number;
  };
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fraudStatus: "",
    safetyStatus: "",
    verificationLevel: "",
  });

  useEffect(() => {
    if (!id) return;
    apiFetch<UserDetail>(`/api/admin/users/${id}`)
      .then((u) => {
        setUser(u);
        setForm({
          fraudStatus: u.fraudStatus ?? "",
          safetyStatus: u.safetyStatus ?? "",
          verificationLevel: u.verificationLevel ?? "",
        });
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!id || saving) return;
    setSaving(true);
    try {
      await apiFetch(`/api/admin/users/${id}/review`, {
        method: "PATCH",
        body: JSON.stringify({
          fraudStatus: form.fraudStatus || undefined,
          safetyStatus: form.safetyStatus || undefined,
          verificationLevel: form.verificationLevel || undefined,
        }),
      });
      setUser((prev) =>
        prev
          ? {
              ...prev,
              fraudStatus: form.fraudStatus || null,
              safetyStatus: form.safetyStatus || null,
              verificationLevel: form.verificationLevel || null,
            }
          : null
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error && !user) {
    return (
      <Card className="border-red-200 bg-red-50">
        <p className="text-red-700">{error}</p>
        <Link href="/admin/users" className="mt-4 inline-block text-primary-600 hover:underline">
          Back to users
        </Link>
      </Card>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Link href="/admin/users" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to users
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{user.name || "—"}</h1>
          <p className="text-gray-500 text-sm">{user.email}</p>
          <Link href={`/profile/${user.id}`} className="text-primary-600 text-sm hover:underline mt-1 block">
            View public profile →
          </Link>
        </div>
      </div>

      <Card>
        <h2 className="font-semibold text-gray-900 mb-4">Update status</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fraud status</label>
            <select
              value={form.fraudStatus}
              onChange={(e) => setForm((f) => ({ ...f, fraudStatus: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm"
            >
              <option value="">—</option>
              <option value="normal">Normal</option>
              <option value="suspicious">Suspicious</option>
              <option value="review_required">Review required</option>
              <option value="restricted">Restricted</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Safety status</label>
            <select
              value={form.safetyStatus}
              onChange={(e) => setForm((f) => ({ ...f, safetyStatus: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm"
            >
              <option value="">—</option>
              <option value="low_risk">Low risk</option>
              <option value="medium_risk">Medium risk</option>
              <option value="high_risk">High risk</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verification level</label>
            <select
              value={form.verificationLevel}
              onChange={(e) => setForm((f) => ({ ...f, verificationLevel: e.target.value }))}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 text-sm"
            >
              <option value="">—</option>
              <option value="basic">Basic</option>
              <option value="verified">Verified</option>
              <option value="trusted">Trusted</option>
            </select>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} size="sm" className="mt-4">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
        </Button>
      </Card>

      {user.flaggedReasons && user.flaggedReasons.length > 0 && (
        <Card>
          <h2 className="font-semibold text-gray-900 mb-2">Flagged reasons</h2>
          <ul className="list-disc list-inside text-sm text-gray-600">
            {user.flaggedReasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        <Card>
          <h2 className="font-semibold text-gray-900 mb-3">Reports received ({user._count.reportsReceived})</h2>
          {user.reportsReceived.length === 0 ? (
            <p className="text-gray-500 text-sm">No reports.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {user.reportsReceived.map((r) => (
                <li key={r.id} className="border-b border-gray-100 pb-2 last:border-0">
                  <p className="text-gray-700">{r.reason || "No reason"}</p>
                  <p className="text-gray-500 text-xs">
                    by {r.reporter.email} — {new Date(r.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-gray-900 mb-3">Fraud events ({user.fraudEvents.length})</h2>
          {user.fraudEvents.length === 0 ? (
            <p className="text-gray-500 text-sm">None.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {user.fraudEvents.map((e) => (
                <li key={e.id} className="border-b border-gray-100 pb-2 last:border-0">
                  <p className="font-medium text-gray-800">{e.eventType}</p>
                  <p className="text-gray-600">{e.reason || "—"}</p>
                  <p className="text-gray-500 text-xs">{new Date(e.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-gray-900 mb-3">Safety flags ({user.safetyFlags.length})</h2>
          {user.safetyFlags.length === 0 ? (
            <p className="text-gray-500 text-sm">None.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {user.safetyFlags.map((f) => (
                <li key={f.id} className="border-b border-gray-100 pb-2 last:border-0">
                  <p className="font-medium text-gray-800">
                    {f.targetType} — {f.severity}
                  </p>
                  <p className="text-gray-600">{f.reason}</p>
                  <p className="text-gray-500 text-xs">{new Date(f.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-semibold text-gray-900 mb-3">Recent activity</h2>
          <p className="text-sm text-gray-600 mb-2">
            {user._count.sentMessages} messages, {user._count.savedProfiles} saves, {user._count.hostedTrips} trips
          </p>
          {user.recentMessages.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-500 uppercase">Recent messages</p>
              <ul className="mt-1 space-y-1 text-sm text-gray-600">
                {user.recentMessages.map((m) => (
                  <li key={m.id} className="truncate">{m.content}</li>
                ))}
              </ul>
            </div>
          )}
          {user.recentTrips.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-medium text-gray-500 uppercase">Recent trips</p>
              <ul className="mt-1 space-y-1 text-sm">
                {user.recentTrips.map((t) => (
                  <li key={t.id}>
                    <Link href={`/trips/${t.id}`} className="text-primary-600 hover:underline">
                      {t.destination} ({t.status})
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
