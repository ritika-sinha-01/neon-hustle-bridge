import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Users, Briefcase, Trophy, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/site/AppShell";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { isAuthenticated } from "@/lib/auth";

export const Route = createFileRoute("/client")({
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw new Error("Unauthorized");
    }
  },
  head: () => ({ meta: [{ title: "Client Dashboard — HustleBridge" }, { name: "description", content: "Manage your projects and applicants." }] }),
  component: ClientDash,
});

function ClientDash() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await apiClient.get<any>("/clients/dashboard");
        console.log("Client dashboard data:", data);
        setDashboard(data);
      } catch (err: any) {
        console.error("Dashboard error:", err);
        setError(err.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const stats = [
    { v: dashboard?.stats?.totalOpportunities || 0, l: "Total Projects", c: "#F5E400", i: Briefcase },
    { v: dashboard?.stats?.pendingApplications || 0, l: "Pending", c: "#FF0A78", i: Users },
    { v: dashboard?.stats?.inReviewApplications || 0, l: "In Review", c: "#F5E400", i: CheckCircle2 },
    { v: dashboard?.stats?.hiredCount || 0, l: "Hired", c: "#FF0A78", i: Trophy },
  ];

  const recent = dashboard?.recentOpportunities?.map((opp: any) => ({
    id: opp.id,
    t: opp.title || "Untitled Project",
    c: opp.category || "General",
    a: opp.applicationCount || 0,
    s: opp.status || "Active",
    color: opp.status === "Active" ? "#FF0A78" : "#F5E400",
  })) || [];

  if (loading) {
    return (
      <AppShell title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <p className="text-white/60">Loading dashboard...</p>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-400">{error}</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={`Welcome back, ${dashboard?.profile?.companyName || "TechNova Labs"} 👋`}>
      <div className="rounded-3xl glass-strong p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm text-white/60">Let's build something amazing together.</div>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-[#FF0A78] px-5 py-3 text-sm font-semibold text-white glow-pink hover:scale-105 transition">
            <Plus className="h-4 w-4" /> Post a Project
          </button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.i;
            return (
              <div key={s.l} className="rounded-2xl bg-white/[0.03] p-5">
                <Icon className="h-5 w-5" style={{ color: s.c }} />
                <div className="mt-3 font-display text-4xl font-bold" style={{ color: s.c }}>{s.v}</div>
                <div className="text-xs text-white/60">{s.l}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent + Budget */}
      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl glass-strong p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Projects</h2>
            <Link to="/opportunities" className="text-sm text-[#F5E400] hover:underline">View All</Link>
          </div>
          <ul className="mt-4 space-y-3">
            {recent.length > 0 ? (
              recent.map((p: any) => (
                <motion.li key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4 rounded-2xl bg-white/[0.03] p-4">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#F5E400] to-[#FF0A78] font-bold text-black">{p.t?.[0] || "P"}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{p.t}</div>
                    <div className="text-xs text-white/50">{p.c} · {p.a} Applicants</div>
                  </div>
                  <span className="rounded-full px-3 py-1 text-xs font-semibold text-black" style={{ background: p.color }}>{p.s}</span>
                </motion.li>
              ))
            ) : (
              <li className="rounded-2xl bg-white/[0.03] p-8 text-center">
                <p className="text-white/60">No projects yet. Post your first opportunity to get started!</p>
              </li>
            )}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl glass-strong p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">Total Projects</h3>
            <div className="mt-3 font-display text-4xl font-bold text-[#F5E400]">{dashboard?.stats?.totalOpportunities || 0}</div>
            <div className="mt-2 text-xs text-white/50">Opportunities posted</div>
          </div>
          <div className="rounded-3xl glass-strong p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">Total Applications</h3>
            <div className="mt-3 font-display text-4xl font-bold text-[#FF0A78]">{dashboard?.stats?.pendingApplications + dashboard?.stats?.inReviewApplications || 0}</div>
            <div className="mt-2 text-xs text-white/50">Applications received</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}