import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Code2, Palette, PenTool, Megaphone, Video, Sparkles, Star, TrendingUp, Users, Briefcase, ShieldCheck } from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { NeonBackground } from "@/components/site/NeonBackground";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HustleBridge — Turn Skills Into Opportunities" },
      { name: "description", content: "Where ambitious hustlers meet real clients. Build experience, land projects, grow your hustle." },
    ],
  }),
  component: Index,
});

const skillCards = [
  { icon: Code2, label: "Web Dev", color: "#F5E400", pos: "top-4 -left-6 sm:-left-12" },
  { icon: Palette, label: "Graphic Design", color: "#FF0A78", pos: "top-24 -right-4 sm:-right-12" },
  { icon: PenTool, label: "Content Writing", color: "#F5E400", pos: "bottom-24 -left-8" },
  { icon: Megaphone, label: "Social Media", color: "#FF0A78", pos: "bottom-8 right-0 sm:-right-8" },
  { icon: Video, label: "Video Editing", color: "#F5E400", pos: "top-1/2 -right-16 hidden lg:block" },
];

const stats = [
  { v: "12,400+", l: "Active Hustlers" },
  { v: "3,200+", l: "Verified Clients" },
  { v: "₹4.2Cr", l: "Paid to Hustlers" },
  { v: "98%", l: "Satisfaction" },
];

const features = [
  { icon: Sparkles, title: "AI Outreach Engine", desc: "Generate killer proposals for cold email, LinkedIn or WhatsApp in seconds." },
  { icon: Briefcase, title: "Verified Opportunities", desc: "Every project is screened. No spam, no time-wasters — just real work." },
  { icon: TrendingUp, title: "Hustle Score", desc: "Build a track record clients trust. Climb the leaderboard, get hired faster." },
  { icon: ShieldCheck, title: "Secure Payments", desc: "Milestone-based escrow protects every rupee until the work ships." },
  { icon: Users, title: "Mentor Network", desc: "Get matched with senior pros for portfolio reviews & career advice." },
  { icon: Star, title: "Public Profile", desc: "A portfolio page so good you'll send recruiters here instead of a resume." },
];

const testimonials = [
  { name: "Sneha R.", role: "UI/UX Designer", quote: "Landed 3 clients in my first month. The AI outreach actually closes deals.", avatar: "SR" },
  { name: "Karan M.", role: "Full-Stack Dev", quote: "Built ₹2L+ in client work while still in college. HustleBridge changed everything.", avatar: "KM" },
  { name: "Priya S.", role: "Content Creator", quote: "The quality of projects here is unreal. Real budgets, real respect.", avatar: "PS" },
];

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <NeonBackground />
      <SiteHeader />

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-32 lg:pt-24">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-[#F5E400] animate-neon-pulse" /> The hustler marketplace
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
              Turn Skills Into <span className="text-[#F5E400] text-glow-yellow">Opportunities.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/70">
              HustleBridge connects ambitious hustlers with real-world projects from verified clients. Find work, build experience, grow your hustle — all in one place.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link to="/register" className="group inline-flex items-center gap-2 rounded-full bg-[#F5E400] px-7 py-4 text-base font-semibold text-black transition hover:scale-105 glow-yellow">
                Get Started <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link to="/opportunities" className="inline-flex items-center gap-2 rounded-full border border-[#FF0A78]/60 px-7 py-4 text-base font-semibold text-white transition hover:bg-[#FF0A78]/10 hover:glow-pink">
                Explore Opportunities
              </Link>
            </div>
            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3">
                {["#F5E400", "#FF0A78", "#F5E400", "#FF0A78"].map((c, i) => (
                  <div key={i} className="grid h-10 w-10 place-items-center rounded-full border-2 border-[#050505] text-xs font-bold text-black" style={{ background: c }}>{["AV","SR","KM","PS"][i]}</div>
                ))}
              </div>
              <div>
                <div className="font-bold text-[#F5E400]">10K+ hustlers</div>
                <div className="text-xs text-white/60">already building their future</div>
              </div>
            </div>
          </motion.div>

          {/* Hero visual */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative">
            <div className="relative aspect-square rounded-[2.5rem] glass-strong p-8 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#F5E400]/10 via-transparent to-[#FF0A78]/10" />
              <div className="relative h-full rounded-3xl glass p-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#FF0A78]" />
                  <div className="h-3 w-3 rounded-full bg-[#F5E400]" />
                  <div className="h-3 w-3 rounded-full bg-white/20" />
                  <div className="ml-auto text-xs text-white/40">find-opportunities.app</div>
                </div>
                <div className="mt-6">
                  <div className="text-xs text-white/50">Browse</div>
                  <div className="text-2xl font-bold">Find Opportunities</div>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    { t: "Landing Page Design", b: "₹15K", c: "#F5E400" },
                    { t: "React Dashboard", b: "₹22K", c: "#FF0A78" },
                    { t: "Brand Identity", b: "₹18K", c: "#F5E400" },
                  ].map((p, i) => (
                    <motion.div key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 + i * 0.15 }} className="flex items-center justify-between rounded-xl bg-white/[0.04] p-3">
                      <div>
                        <div className="text-sm font-semibold">{p.t}</div>
                        <div className="text-xs text-white/40">Posted 2h ago</div>
                      </div>
                      <div className="rounded-full px-3 py-1 text-xs font-semibold text-black" style={{ background: p.c }}>{p.b}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {skillCards.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
                  transition={{ delay: 0.4 + i * 0.1, y: { duration: 4 + i, repeat: Infinity, ease: "easeInOut" } }}
                  className={`absolute ${s.pos} glass-strong flex items-center gap-2 rounded-2xl px-4 py-3`}
                >
                  <span className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: s.color, boxShadow: `0 0 24px ${s.color}66` }}>
                    <Icon className="h-4 w-4 text-black" />
                  </span>
                  <span className="text-sm font-semibold">{s.label}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-4 rounded-3xl glass-strong p-6 sm:p-10 md:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div key={s.l} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
              <div className="font-display text-4xl font-bold text-[#F5E400] text-glow-yellow sm:text-5xl">{s.v}</div>
              <div className="mt-2 text-sm text-white/60">{s.l}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 py-32">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-[#FF0A78]">Built for hustlers</span>
          <h2 className="mt-4 text-4xl font-bold sm:text-5xl">Everything you need to <span className="text-[#F5E400]">level up.</span></h2>
          <p className="mt-4 text-white/60">A complete platform — from your first cold pitch to your hundredth happy client.</p>
        </div>
        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="group rounded-3xl glass-strong p-7 transition hover:border-[#F5E400]/40">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 text-[#F5E400] transition group-hover:bg-[#F5E400] group-hover:text-black group-hover:glow-yellow">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-xl font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-white/60">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-[#F5E400]">Real stories</span>
          <h2 className="mt-4 text-4xl font-bold sm:text-5xl">Hustlers who made it.</h2>
        </div>
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div key={t.name} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-3xl glass-strong p-8">
              <div className="flex gap-1 text-[#F5E400]">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-4 w-4 fill-current" />)}</div>
              <p className="mt-5 text-lg leading-relaxed">"{t.quote}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#FF0A78] to-[#F5E400] font-bold text-black">{t.avatar}</div>
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-white/50">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA BAND */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-[2.5rem] glass-strong p-10 sm:p-16">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-[#F5E400]/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#FF0A78]/20 blur-3xl" />
          <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <h2 className="font-display text-4xl font-bold sm:text-5xl">Ready to grow your <span className="text-[#FF0A78] text-glow-pink">hustle?</span></h2>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="rounded-full bg-[#F5E400] px-7 py-4 font-semibold text-black glow-yellow hover:scale-105 transition">Join as Hustler</Link>
              <Link to="/register" className="rounded-full bg-[#FF0A78] px-7 py-4 font-semibold text-white glow-pink hover:scale-105 transition">Hire Talent</Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
