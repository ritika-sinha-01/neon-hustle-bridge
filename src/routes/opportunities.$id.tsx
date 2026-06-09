import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Bookmark, Share2, Star, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/site/AppShell";

export const Route = createFileRoute("/opportunities/$id")({
  head: () => ({ meta: [{ title: "Opportunity — HustleBridge" }, { name: "description", content: "Opportunity details and apply." }] }),
  component: OppDetails,
});

function OppDetails() {
  const requirements = ["3+ years building responsive sites", "Strong CSS/HTML fundamentals", "Portfolio of past education projects", "Available for daily syncs"];
  return (
    <AppShell title="Opportunity Details">
      <Link to="/opportunities" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-[#F5E400]"><ArrowLeft className="h-4 w-4" /> Back to Opportunities</Link>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl glass-strong p-8">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Build a Responsive Website for Coaching Institute</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#F5E400] to-[#FF0A78] font-bold text-black">T</div>
              <span className="font-semibold text-white">TechLearn Academy</span>
              <span className="inline-flex items-center gap-1 text-[#F5E400]"><Star className="h-3 w-3 fill-current" /> 4.8 (33)</span>
            </div>
            <span>· Posted 2 days ago</span>
            <span>· Remote</span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/[0.03] p-4"><div className="text-xs text-white/50">Budget</div><div className="mt-1 font-bold text-[#F5E400]">₹10,000 - ₹20,000</div></div>
            <div className="rounded-2xl bg-white/[0.03] p-4"><div className="text-xs text-white/50">Duration</div><div className="mt-1 font-bold">5 - 7 days</div></div>
            <div className="rounded-2xl bg-white/[0.03] p-4"><div className="text-xs text-white/50">Skill Level</div><div className="mt-1 font-bold">Intermediate</div></div>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {["Web Development", "HTML", "CSS", "JavaScript", "Responsive Design"].map((s) => (
              <span key={s} className="rounded-full bg-[#F5E400]/10 px-3 py-1.5 text-xs font-semibold text-[#F5E400]">{s}</span>
            ))}
          </div>
          <div className="mt-8">
            <h2 className="text-lg font-bold">Project Description</h2>
            <p className="mt-3 text-white/70 leading-relaxed">We need a modern, responsive website for our coaching institute. Pages: Home, About, Courses, Contact, Client. UI must feel fast, SEO-friendly, and designed to convert visitors into students. Bonus points for clean animations and a polished mobile experience.</p>
          </div>
          <div className="mt-8">
            <h2 className="text-lg font-bold">Requirements</h2>
            <ul className="mt-3 space-y-2">
              {requirements.map((r) => <li key={r} className="flex items-start gap-3 text-white/70"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#F5E400]" /> {r}</li>)}
            </ul>
          </div>
          <div className="mt-8 rounded-2xl bg-white/[0.03] p-5">
            <h2 className="text-lg font-bold">Timeline</h2>
            <div className="mt-4 space-y-3">
              {[{d:"Day 1-2", t:"Discovery & wireframes"},{d:"Day 3-5", t:"Design & development"},{d:"Day 6-7", t:"Polish, QA, handoff"}].map((s, i) => (
                <div key={i} className="flex gap-4"><div className="w-24 shrink-0 text-xs font-semibold text-[#FF0A78]">{s.d}</div><div className="text-sm text-white/70">{s.t}</div></div>
              ))}
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          <div className="rounded-3xl glass-strong p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">About Client</h3>
            <div className="mt-4 flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#F5E400] to-[#FF0A78] font-bold text-black">T</div>
              <div><div className="font-bold">TechLearn Academy</div><div className="text-xs text-white/50">Education · Bengaluru</div></div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-sm"><Star className="h-4 w-4 fill-current text-[#F5E400]" /> <span className="font-bold">4.8</span> <span className="text-white/40">(32 reviews)</span></div>
          </div>
          <div className="rounded-3xl glass-strong p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">Proposals</h3>
            <div className="mt-3 font-display text-3xl font-bold">23 <span className="text-base font-normal text-white/40">already applied</span></div>
            <div className="mt-3 flex -space-x-2">
              {["AV","SK","MR","PJ","+19"].map((n,i) => <div key={i} className="grid h-9 w-9 place-items-center rounded-full border-2 border-[#050505] bg-gradient-to-br from-[#FF0A78] to-[#F5E400] text-xs font-bold text-black">{n}</div>)}
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