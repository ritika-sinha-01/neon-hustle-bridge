import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bookmark, X, TrendingUp, Wallet, Eye, MessageCircle } from "lucide-react";
import { AppShell } from "@/components/site/AppShell";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";

export const Route = createFileRoute("/student")({
  head: () => ({ meta: [{ title: "Dashboard — HustleBridge" }, { name: "description", content: "Your student hustle dashboard." }] }),
  component: StudentDash,
});

function StudentDash() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const data = await apiClient.get<any>("/students/dashboard");
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
    { v: dashboard.stats.applied || 0, l: "Applied", c: "#F5E400" },
    { v: dashboard.stats.inReview || 0, l: "In Review", c: "#FF0A78" },
    { v: dashboard.stats.interview || 0, l: "Interview", c: "#F5E400" },
    { v: dashboard.stats.hired || 0, l: "Hired", c: "#FF0A78" },
  ] : [
    { v: 12, l: "Applied", c: "#F5E400" },
    { v: 4, l: "In Review", c: "#FF0A78" },
    { v: 2, l: "Interview", c: "#F5E400" },
    { v: 1, l: "Hired", c: "#FF0A78" },
  ];

  const recommended = dashboard?.recommendedOpportunities || [
    { title: "Build a Responsive Website for Coaching Institute", tags: ["Web Development", "HTML", "CSS"], budget: "₹8,000 - ₹15,000", mode: "Remote", ago: "3d ago", rating: 4.8 },
    { title: "Social Media Content Creator", tags: ["SMM", "Content Creation"], budget: "₹5,000 - ₹10,000", mode: "Remote", ago: "3d ago", rating: 4.6 },
    { title: "Mobile App UI/UX for Fitness Startup", tags: ["Figma", "UI/UX"], budget: "₹12,000 - ₹20,000", mode: "Remote", ago: "1d ago", rating: 4.9 },
    { title: "Brand Identity for D2C Coffee Brand", tags: ["Branding", "Illustrator"], budget: "₹15,000 - ₹25,000", mode: "Hybrid", ago: "4h ago", rating: 5.0 },
  ];

  const activity = [
    { i: Eye, t: "Client viewed your application for Landing Page", a: "12m" },
    { i: MessageCircle, t: "New message from TechLearn Academy", a: "1h" },
    { i: Wallet, t: "Payment of ₹8,000 received for Logo Project", a: "3h" },
    { i: TrendingUp, t: "Your profile views are up 24% this week", a: "1d" },
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
    <AppShell title={`Welcome back, ${dashboard?.profile?.fullName || "Arjun"} 👋`}>
      {/* Welcome + Profile Strength */}
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl glass-strong p-6">
          <div className="text-sm text-white/60">"Great things come to those who hustle."</div>
          <div className="mt-2 text-2xl font-bold">Let's land you the next gig.</div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s: any) => (
              <div key={s.l} className="rounded-2xl bg-white/[0.03] p-4">
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold" style={{ color: s.c }}>{s.v}</div>
                  <Bookmark className="h-4 w-4 text-white/30" />
                </div>
                <div className="mt-1 text-xs text-white/60">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative rounded-3xl bg-[#F5E400] p-6 text-black glow-yellow">
          <button className="absolute right-4 top-4 opacity-60 hover:opacity-100"><X className="h-4 w-4" /></button>
          <div className="text-sm font-medium opacity-70">Profile Strength</div>
          <div className="mt-1 font-display text-6xl font-bold">85%</div>
          <div className="mt-3 text-sm font-medium">Keep it up! Add 2 portfolio pieces to reach 100%.</div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/20">
            <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} transition={{ duration: 1 }} className="h-full bg-black" />
          </div>
        </div>
      </div>

      {/* Recommended */}
      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-xl font-bold">Recommended Opportunities</h2>
        <Link to="/opportunities" className="text-sm text-[#F5E400] hover:underline">View All</Link>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {recommended.map((r: any, i: number) => (
          <motion.div key={r.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to="/opportunities/$id" params={{ id: String(i + 1) }} className="block">
              <div className="group rounded-3xl glass-strong p-5 transition hover:border-[#F5E400]/40 hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#F5E400] to-[#FF0A78] font-bold text-black">{r.title[0]}</div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold leading-tight">{r.title}</h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {r.tags.map((t: string) => <span key={t} className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-white/70">{t}</span>)}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <span className="text-[#F5E400] font-semibold">{r.budget}</span>
                      <span className="text-white/40">{r.mode} · {r.ago}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Earnings + Activity */}
      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_400px]">
        <div className="rounded-3xl glass-strong p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Earnings Overview</h2>
            <select className="rounded-full bg-white/5 px-3 py-1 text-xs outline-none"><option>Last 6 months</option></select>
          </div>
          <div className="mt-2 flex items-end gap-4">
            <div className="font-display text-4xl font-bold text-[#F5E400] text-glow-yellow">₹1,21,400</div>
            <div className="pb-1 text-xs text-[#F5E400]">+24% ↑</div>
          </div>
          <div className="mt-6 flex h-40 items-end gap-3">
            {[40, 65, 50, 80, 55, 95, 70].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.06, duration: 0.6 }} className="w-full rounded-t-lg bg-gradient-to-t from-[#FF0A78] to-[#F5E400]" />
                <span className="text-[10px] text-white/40">{["J","F","M","A","M","J","J"][i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl glass-strong p-6">
          <h2 className="text-xl font-bold">Activity Feed</h2>
          <ul className="mt-4 space-y-3">
            {activity.map((a: any, i: number) => {
              const Icon = a.i;
              return (
                <li key={i} className="flex items-start gap-3 rounded-2xl bg-white/[0.03] p-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#F5E400]/10 text-[#F5E400]"><Icon className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">{a.t}</div>
                    <div className="text-xs text-white/40">{a.a} ago</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </AppShell>
  );
}