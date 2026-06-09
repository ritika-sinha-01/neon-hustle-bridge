import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Copy, RefreshCcw, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/site/AppShell";

export const Route = createFileRoute("/ai-outreach")({
  head: () => ({ meta: [{ title: "AI Outreach — HustleBridge" }, { name: "description", content: "Generate winning proposals with AI." }] }),
  component: AIOutreach,
});

const tabs = ["Cold Email", "LinkedIn Message", "WhatsApp Message"];

function AIOutreach() {
  const [tab, setTab] = useState(tabs[0]);
  return (
    <AppShell title="AI Outreach Generator">
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="rounded-3xl glass-strong p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold"><Sparkles className="h-4 w-4 text-[#F5E400]" /> Input Details</h2>
          {[
            { l: "Business Name", v: "TechLearn Academy" },
            { l: "Business Type", v: "Education / Coaching" },
            { l: "What do you want to offer?", v: "Website Development" },
            { l: "Your Skills", v: "React, Node.js, Responsive Design" },
            { l: "Goal", v: "Get a freelance project" },
          ].map((f) => (
            <div key={f.l} className="mt-4">
              <label className="text-xs text-white/50">{f.l}</label>
              <input defaultValue={f.v} className="mt-1 w-full rounded-xl bg-white/[0.04] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#F5E400]/40" />
            </div>
          ))}
          <button className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#F5E400] py-3 font-semibold text-black glow-yellow hover:scale-[1.02] transition">
            <Wand2 className="h-4 w-4" /> Generate Message
          </button>
        </div>

        <div className="rounded-3xl glass-strong p-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm transition ${tab === t ? "bg-[#F5E400] text-black font-semibold" : "bg-white/5 text-white/70"}`}>{t}</button>
            ))}
          </div>
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-2xl bg-white/[0.03] p-6 text-sm leading-relaxed text-white/85">
            <div className="text-white/50">Subject: Build a High-Converting Website for TechLearn Academy</div>
            <div className="mt-3">Hi TechLearn Academy Team,</div>
            <p className="mt-3">I came across your platform and really loved the work you're doing in the education space.</p>
            <p className="mt-3">I specialize in building modern, responsive websites that are fast, SEO-friendly, and designed to convert visitors into students.</p>
            <p className="mt-3">I'd love to help you build a website that elevates your brand and provides a seamless experience for your students.</p>
            <p className="mt-3">Looking forward to the opportunity! 🚀</p>
            <p className="mt-3">Best regards,<br/>Arjun Verma</p>
          </motion.div>
          <div className="mt-4 flex gap-3">
            <button className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm"><Copy className="h-4 w-4" /> Copy</button>
            <button className="inline-flex items-center gap-2 rounded-full bg-[#FF0A78] px-4 py-2 text-sm font-semibold text-white glow-pink"><RefreshCcw className="h-4 w-4" /> Regenerate</button>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {["Make it shorter","Add stronger hook","Sound more confident"].map((s) => (
              <button key={s} className="rounded-2xl bg-white/[0.03] p-4 text-left text-sm hover:bg-white/10">
                <Sparkles className="h-4 w-4 text-[#F5E400]" />
                <div className="mt-2 font-semibold">{s}</div>
                <div className="text-xs text-white/50">AI suggestion</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}