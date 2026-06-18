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
        setDashboard(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const stats = dashboard?.stats ? [
    { v: dashboard.stats.activeProjects || 0, l: "Active Projects", c: "#F5E400", i: Briefcase },
    { v: dashboard.stats.totalApplicants || 0, l: "Total Applicants", c: "#FF0A78", i: Users },
    { v: dashboard.stats.hired || 0, l: "Hired", c: "#F5E400", i: CheckCircle2 },
    { v: dashboard.stats.completed || 0, l: "Completed", c: "#FF0A78", i: Trophy },
  ] : [
    { v: 8, l: "Active Projects", c: "#F5E400", i: Briefcase },
    { v: 25, l: "Total Applicants", c: "#FF0A78", i: Users },
    { v: 6, l: "Hired", c: "#F5E400", i: CheckCircle2 },
    { v: 3, l: "Completed", c: "#FF0A78", i: Trophy },
  ];

  const recent = dashboard?.recentProjects || [
    { t: "Mobile App UI/UX Design", c: "Design", a: 12, s: "In Review", color: "#F5E400" },
    { t: "E-commerce Website Development", c: "Development", a: 14, s: "Active", color: "#FF0A78" },
    { t: "Logo & Brand Identity Design", c: "Design", a: 8, s: "Active", color: "#F5E400" },
    { t: "Content Strategy & SEO Audit", c: "Marketing", a: 5, s: "Active", color: "#FF0A78" },
  ];

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
            {recent.map((p: any, i: number) => (
              <motion.li key={p.t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-4 rounded-2xl bg-white/[0.03] p-4">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#F5E400] to-[#FF0A78] font-bold text-black">{p.t[0]}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{p.t}</div>
                  <div className="text-xs text-white/50">{p.c} · {p.a} Applicants</div>
                </div>
                <span className="rounded-full px-3 py-1 text-xs font-semibold text-black" style={{ background: p.color }}>{p.s}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl glass-strong p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">Budget Tracking</h3>
            <div className="mt-3 font-display text-4xl font-bold text-[#F5E400]">₹1.8L<span className="text-base font-normal text-white/40"> / ₹2.5L</span></div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/5">
              <motion.div initial={{ width: 0 }} animate={{ width: "72%" }} transition={{ duration: 1 }} className="h-full bg-gradient-to-r from-[#F5E400] to-[#FF0A78]" />
            </div>
            <div className="mt-2 text-xs text-white/50">72% of monthly budget used</div>
          </div>
          <div className="rounded-3xl glass-strong p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">Team Collaboration</h3>
            <div className="mt-4 flex -space-x-2">
              {["RA","SK","MJ","PR","+3"].map((n, i) => (
                <div key={i} className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#050505] bg-gradient-to-br from-[#FF0A78] to-[#F5E400] text-xs font-bold text-black">{n}</div>
              ))}
            </div>
            <div className="mt-4 text-xs text-white/60">7 team members collaborating across 4 active projects.</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}