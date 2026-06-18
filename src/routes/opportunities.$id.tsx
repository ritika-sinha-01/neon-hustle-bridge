import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Bookmark, Share2, Star, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/site/AppShell";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";

export const Route = createFileRoute("/opportunities/$id")({
  head: () => ({ meta: [{ title: "Opportunity — HustleBridge" }, { name: "description", content: "Opportunity details and apply." }] }),
  component: OppDetails,
});

function OppDetails() {
  const { id } = Route.useParams();
  const [opportunity, setOpportunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const data = await apiClient.get<any>(`/opportunities/${id}`);
        setOpportunity(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load opportunity");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOpportunity();
    }
  }, [id]);

  const requirements = opportunity?.requirements || ["3+ years building responsive sites", "Strong CSS/HTML fundamentals", "Portfolio of past education projects", "Available for daily syncs"];

  if (loading) {
    return (
      <AppShell title="Opportunity Details">
        <div className="flex items-center justify-center h-64">
          <p className="text-white/60">Loading opportunity...</p>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Opportunity Details">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-400">{error}</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Opportunity Details">
      <Link to="/opportunities" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-[#F5E400]"><ArrowLeft className="h-4 w-4" /> Back to Opportunities</Link>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl glass-strong p-8">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{opportunity?.title || "Build a Responsive Website for Coaching Institute"}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#F5E400] to-[#FF0A78] font-bold text-black">{opportunity?.companyName?.[0] || "T"}</div>
              <span className="font-semibold text-white">{opportunity?.companyName || "TechLearn Academy"}</span>
              <span className="inline-flex items-center gap-1 text-[#F5E400]"><Star className="h-3 w-3 fill-current" /> {opportunity?.rating || "4.8"} ({opportunity?.reviewCount || "33"})</span>
            </div>
            <span>· Posted {opportunity?.createdAt || "2 days ago"}</span>
            <span>· {opportunity?.workMode || "Remote"}</span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/[0.03] p-4"><div className="text-xs text-white/50">Budget</div><div className="mt-1 font-bold text-[#F5E400]">₹{opportunity?.budgetMin || "10,000"} - ₹{opportunity?.budgetMax || "20,000"}</div></div>
            <div className="rounded-2xl bg-white/[0.03] p-4"><div className="text-xs text-white/50">Duration</div><div className="mt-1 font-bold">{opportunity?.duration || "5 - 7 days"}</div></div>
            <div className="rounded-2xl bg-white/[0.03] p-4"><div className="text-xs text-white/50">Skill Level</div><div className="mt-1 font-bold">{opportunity?.skillLevel || "Intermediate"}</div></div>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {(opportunity?.skillsRequired || ["Web Development", "HTML", "CSS", "JavaScript", "Responsive Design"]).map((s: string) => (
              <span key={s} className="rounded-full bg-[#F5E400]/10 px-3 py-1.5 text-xs font-semibold text-[#F5E400]">{s}</span>
            ))}
          </div>
          <div className="mt-8">
            <h2 className="text-lg font-bold">Project Description</h2>
            <p className="mt-3 text-white/70 leading-relaxed">{opportunity?.description || "We need a modern, responsive website for our coaching institute. Pages: Home, About, Courses, Contact, Client. UI must feel fast, SEO-friendly, and designed to convert visitors into students. Bonus points for clean animations and a polished mobile experience."}</p>
          </div>
          <div className="mt-8">
            <h2 className="text-lg font-bold">Requirements</h2>
            <ul className="mt-3 space-y-2">
              {requirements.map((r: string) => <li key={r} className="flex items-start gap-3 text-white/70"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#F5E400]" /> {r}</li>)}
            </ul>
          </div>
          <div className="mt-8 rounded-2xl bg-white/[0.03] p-5">
            <h2 className="text-lg font-bold">Timeline</h2>
            <div className="mt-4 space-y-3">
              {(opportunity?.timeline || [{d:"Day 1-2", t:"Discovery & wireframes"},{d:"Day 3-5", t:"Design & development"},{d:"Day 6-7", t:"Polish, QA, handoff"}]).map((s: any, i: number) => (
                <div key={i} className="flex gap-4"><div className="w-24 shrink-0 text-xs font-semibold text-[#FF0A78]">{s.d}</div><div className="text-sm text-white/70">{s.t}</div></div>
              ))}
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          <div className="rounded-3xl glass-strong p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">About Client</h3>
            <div className="mt-4 flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#F5E400] to-[#FF0A78] font-bold text-black">{opportunity?.companyName?.[0] || "T"}</div>
              <div><div className="font-bold">{opportunity?.companyName || "TechLearn Academy"}</div><div className="text-xs text-white/50">{opportunity?.clientCategory || "Education"} · {opportunity?.clientLocation || "Bengaluru"}</div></div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm"><Star className="h-4 w-4 fill-current text-[#F5E400]" /> <span className="font-bold">{opportunity?.rating || "4.8"}</span> <span className="text-white/40">({opportunity?.reviewCount || "32"} reviews)</span></div>
          </div>
          <div className="rounded-3xl glass-strong p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">Proposals</h3>
            <div className="mt-3 font-display text-3xl font-bold">{opportunity?.applicationCount || "23"} <span className="text-base font-normal text-white/40">already applied</span></div>
            <div className="mt-3 flex -space-x-2">
              {(opportunity?.applicants || ["AV","SK","MR","PJ","+19"]).map((n: string, i: number) => <div key={i} className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#050505] bg-gradient-to-br from-[#FF0A78] to-[#F5E400] text-xs font-bold text-black">{n}</div>)}
            </div>
          </div>
          <button className="w-full rounded-2xl bg-[#FF0A78] py-4 font-bold text-white glow-pink hover:scale-[1.02] transition">Apply Now</button>
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl glass py-3 text-sm font-semibold"><Bookmark className="h-4 w-4" /> Save Opportunity</button>
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl glass py-3 text-sm font-semibold"><Share2 className="h-4 w-4" /> Share</button>
        </motion.div>
      </div>
    </AppShell>
  );
}