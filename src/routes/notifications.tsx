import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, Mail, Trophy, Zap, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/site/AppShell";
import { apiClient } from "@/lib/api/client";
import { isAuthenticated } from "@/lib/auth";

export const Route = createFileRoute("/notifications")({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw new Error("Unauthorized");
    }
  },
  head: () => ({ meta: [{ title: "Notifications — HustleBridge" }, { name: "description", content: "Stay on top of your hustle." }] }),
  component: Notifications,
});

const filters = ["All", "Unread", "Mentions", "System"];

function Notifications() {
  const [f, setF] = useState("All");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await apiClient.get<any>("/notifications");
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const items = notifications.map((n: any) => ({
    i: n.type === "view" ? Eye : n.type === "message" ? Mail : n.type === "achievement" ? Trophy : n.type === "opportunity" ? Zap : Bell,
    t: n.message || n.title || "Notification",
    a: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "Recently",
    u: !n.isRead,
    c: n.type === "message" || n.type === "opportunity" ? "#FF0A78" : "#F5E400",
    id: n.id,
  }));

  if (loading) {
    return (
      <AppShell title="Notifications">
        <div className="flex items-center justify-center h-64">
          <p className="text-white/60">Loading notifications...</p>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Notifications">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-400">{error}</p>
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
              <button key={x} onClick={() => setF(x)} className={`rounded-full px-4 py-1.5 text-sm transition ${f === x ? "bg-[#F5E400] text-black font-semibold" : "bg-white/5 text-white/70"}`}>{x}</button>
            ))}
          </div>
          <button className="text-sm text-[#FF0A78] hover:underline">Mark all as read</button>
        </div>
        <ul className="mt-6 space-y-3">
          {items.length > 0 ? (
            items.map((n: any, i: number) => {
              const Icon = n.i;
              return (
                <motion.li key={n.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className={`flex items-start gap-4 rounded-2xl p-4 transition ${n.u ? "bg-[#F5E400]/[0.04] border border-[#F5E400]/20" : "bg-white/[0.03]"}`}>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl" style={{ background: `${n.c}1a`, color: n.c }}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">{n.t}</div>
                    <div className="mt-1 text-xs text-white/40">{n.a}</div>
                  </div>
                  {n.u && <span className="mt-2 h-2 w-2 rounded-full bg-[#FF0A78] animate-neon-pulse" />}
                </motion.li>
              );
            })
          ) : (
            <li className="rounded-2xl bg-white/[0.03] p-8 text-center">
              <p className="text-white/60">No notifications yet. Stay active to receive updates!</p>
            </li>
          )}
        </ul>
      </div>
    </AppShell>
  );
}