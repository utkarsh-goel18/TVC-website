"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import type { SafeMemberProfile, NotificationItem } from "@/lib/exclusive/types";

interface NotificationsModuleProps {
  member: SafeMemberProfile;
  onNavigateToModule?: (moduleId: string) => void;
  realtimeSignal?: number;
}

export function NotificationsModule({
  member,
  onNavigateToModule,
  realtimeSignal = 0,
}: NotificationsModuleProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/exclusive/notifications");
      const json = await res.json();
      if (res.ok && json.notifications) {
        setNotifications(json.notifications);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (realtimeSignal > 0) {
      fetchNotifications();
    }
  }, [realtimeSignal]);

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/exclusive/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_read", notificationId: id }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/exclusive/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch {
      // ignore
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
                <Bell className="h-4 w-4" />
              </span>
              <h2 className="font-display text-xl font-bold text-white">
                Notifications & Broadcasts
              </h2>
            </div>
            <p className="mt-1 text-sm text-white/60">
              Task assignments, application decisions, mentions, and official club announcements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Filter buttons */}
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              filter === "all"
                ? "bg-amber-400 text-slate-950"
                : "bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
              filter === "unread"
                ? "bg-amber-400 text-slate-950"
                : "bg-white/5 text-white/60 hover:text-white"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] py-20 text-center text-sm text-white/40">
          Loading notifications...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] py-20 text-center text-sm text-white/40">
          No notifications to display.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col gap-3 rounded-2xl border p-4 transition sm:flex-row sm:items-center sm:justify-between ${
                item.isRead
                  ? "border-white/5 bg-white/[0.02] text-white/70"
                  : "border-amber-400/30 bg-amber-400/[0.04] text-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                    item.isRead
                      ? "bg-white/5 text-white/40"
                      : "bg-amber-400/20 text-amber-300"
                  }`}
                >
                  <Bell className="h-4 w-4" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white">{item.title}</h4>
                    {!item.isRead && (
                      <span className="h-2 w-2 rounded-full bg-amber-400" />
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-white/65">{item.body}</p>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-white/40">
                    <Clock className="h-3 w-3" />
                    <span>
                      {new Date(
                        item.createdAt ||
                          item.created_at ||
                          new Date().toISOString()
                      ).toLocaleString()}
                    </span>
                    <span>•</span>
                    <span className="uppercase">{item.type.replace("_", " ")}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:shrink-0">
                {item.actionUrl && onNavigateToModule && (
                  <button
                    onClick={() => {
                      if (!item.isRead) handleMarkAsRead(item.id);
                      if (item.actionUrl?.includes("task")) {
                        onNavigateToModule("tasks");
                      } else if (item.actionUrl?.includes("connect")) {
                        onNavigateToModule("connect");
                      } else if (item.actionUrl?.includes("application")) {
                        onNavigateToModule("applications");
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white"
                  >
                    View
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}

                {!item.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(item.id)}
                    title="Mark as read"
                    className="rounded-xl border border-white/10 bg-white/5 p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
