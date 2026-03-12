"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, Bell, MessageCircle, UserPlus, Bookmark } from "lucide-react";
import { Button } from "@/components/Button";
import { PageContainer, PageHeader } from "@/components/layout";
import { apiFetch } from "@/lib/api";

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [markAllLoading, setMarkAllLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ notifications: NotificationItem[]; unreadCount: number }>(
        "/api/notifications"
      );
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    if (markingId) return;
    setMarkingId(id);
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    } catch {
      setError("Failed to mark as read");
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (markAllLoading || unreadCount === 0) return;
    setMarkAllLoading(true);
    try {
      await apiFetch("/api/notifications/read-all", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      window.dispatchEvent(new CustomEvent("notifications-updated"));
    } catch {
      setError("Failed to mark all as read");
    } finally {
      setMarkAllLoading(false);
    }
  };

  const Icon = ({ type }: { type: string }) => {
    switch (type) {
      case "message":
        return <MessageCircle className="w-5 h-5 text-primary-600" />;
      case "trip_join":
        return <UserPlus className="w-5 h-5 text-primary-600" />;
      case "profile_saved":
        return <Bookmark className="w-5 h-5 text-amber-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <PageContainer>
      <PageHeader
        title="Notifications"
        description="Stay updated on messages, trip joins, and profile saves"
        actions={
          unreadCount > 0 ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={markAllLoading}
          >
              {markAllLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Mark all as read"
              )}
            </Button>
          ) : undefined
        }
      />

      {error && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-center gap-3 text-amber-800 mb-6">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
          <button
            type="button"
            onClick={loadNotifications}
            className="ml-auto text-amber-600 hover:underline text-sm font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 shadow-card border border-gray-100 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No notifications yet</p>
          <p className="text-gray-500 text-sm mt-1">
            When someone messages you, joins your trip, or saves your profile, you&apos;ll see it here.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white shadow-card border border-gray-100 overflow-hidden">
          {notifications.map((n) => {
            const content = (
              <div
                className={`flex gap-4 p-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors ${
                  !n.read ? "bg-primary-50/30" : ""
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <Icon type={n.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{n.title}</p>
                  {n.body && (
                    <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">{formatTime(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      handleMarkRead(n.id);
                    }}
                    disabled={markingId === n.id}
                  >
                    {markingId === n.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Mark read"
                    )}
                  </Button>
                )}
              </div>
            );

            if (n.link) {
              return (
                <Link key={n.id} href={n.link} className="block">
                  {content}
                </Link>
              );
            }
            return <div key={n.id}>{content}</div>;
          })}
        </div>
      )}
    </PageContainer>
  );
}
