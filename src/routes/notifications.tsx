import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bell, Mail, Trophy, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/site/AppShell";
import { apiClient } from "@/lib/api/client";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/notifications")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Notifications — HustleBridge" },
      { name: "description", content: "Stay on top of your hustle." },
    ],
  }),
  component: Notifications,
});

const filters = ["All", "Unread", "System"] as const;

function Notifications() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [error, setError] = useState("");

  const loadNotifications = async (unreadOnly = false) => {
    try {
      const query = unreadOnly ? "?unreadOnly=true" : "";
      const data = await apiClient.get<{ notifications?: any[] } | any[]>(
        `/notifications${query}`,
      );
      const list = Array.isArray(data) ? data : data.notifications ?? [];
      setNotifications(list);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(filter === "Unread");
  }, [filter]);

  const handleMarkAllRead = async () => {
    setMarking(true);
    try {
      await apiClient.patch("/notifications/read-all", {});
      await loadNotifications(filter === "Unread");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to mark notifications as read");
    } finally {
      setMarking(false);
    }
  };

  const items = notifications
    .filter((n) => {
      if (filter === "System") return n.type === "system";
      return true;
    })
    .map((n: any) => ({
      i: n.type === "message" ? Mail : n.type === "opportunity" ? Zap : n.type === "application_received" ? Trophy : Bell,
      t: n.message || n.title || "Notification",
      a: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "Recently",
      u: !n.isRead,
      c: n.type === "message" || n.type === "opportunity" ? "#FF0A78" : "#F5E400",
      id: n.id,
    }));

  if (loading) {
    return (
      <AppShell title="Notifications">
        <div className="flex h-64 items-center justify-center">
          <p className="text-white/60">Loading notifications...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Notifications">
      <div className="rounded-3xl glass-strong p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {filters.map((x) => (
              <button
                key={x}
                type="button"
                onClick={() => setFilter(x)}
                className={`rounded-full px-4 py-1.5 text-sm transition ${
                  filter === x
                    ? "bg-[#F5E400] font-semibold text-black"
                    : "bg-white/5 text-white/70"
                }`}
              >
                {x}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={marking || notifications.length === 0}
            className="text-sm text-[#FF0A78] hover:underline disabled:opacity-40"
          >
            {marking ? "Updating..." : "Mark all as read"}
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

        <ul className="mt-6 space-y-3">
          {items.length > 0 ? (
            items.map((n: any, i: number) => {
              const Icon = n.i;
              return (
                <motion.li
                  key={n.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-start gap-4 rounded-2xl p-4 transition ${
                    n.u
                      ? "border border-[#F5E400]/20 bg-[#F5E400]/[0.04]"
                      : "bg-white/[0.03]"
                  }`}
                >
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                    style={{ background: `${n.c}1a`, color: n.c }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">{n.t}</div>
                    <div className="mt-1 text-xs text-white/40">{n.a}</div>
                  </div>
                  {n.u && (
                    <span className="mt-2 h-2 w-2 rounded-full bg-[#FF0A78] animate-neon-pulse" />
                  )}
                </motion.li>
              );
            })
          ) : (
            <li className="rounded-2xl bg-white/[0.03] p-8 text-center">
              <p className="text-white/60">
                No notifications yet. Apply to opportunities or post projects to receive updates.
              </p>
            </li>
          )}
        </ul>
      </div>
    </AppShell>
  );
}
