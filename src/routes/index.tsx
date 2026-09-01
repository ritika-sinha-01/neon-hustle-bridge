import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Code2,
  Palette,
  PenTool,
  Megaphone,
  Video,
  Sparkles,
  Briefcase,
  ShieldCheck,
  Users,
  Search,
  MessageSquare,
} from "lucide-react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { NeonBackground } from "@/components/site/NeonBackground";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "HustleBridge — Turn Skills Into Opportunities" },
      {
        name: "description",
        content:
          "Student-focused freelance marketplace. Explore opportunities, connect with clients, and use AI-assisted outreach.",
      },
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

const highlights = [
  { icon: Search, title: "Explore Opportunities", desc: "Browse open projects across design, development, marketing, and more." },
  { icon: Users, title: "Connect with Clients", desc: "Apply to real projects posted by businesses looking for student talent." },
  { icon: Sparkles, title: "AI-Assisted Outreach", desc: "Generate proposal drafts for email, LinkedIn, or WhatsApp outreach." },
  { icon: Briefcase, title: "Student Dashboard", desc: "Track applications, profile strength, and recommended opportunities." },
];

const features = [
  {
    icon: Sparkles,
    title: "AI Outreach Engine",
    desc: "Generate proposal drafts for cold email, LinkedIn, or WhatsApp.",
  },
  {
    icon: Briefcase,
    title: "Opportunity Marketplace",
    desc: "Browse and apply to project-based work from verified client accounts.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Dashboards",
    desc: "Separate experiences for students (apply) and clients (post & review).",
  },
  {
    icon: MessageSquare,
    title: "Messaging & Notifications",
    desc: "Stay updated on applications and conversations in one place.",
  },
  {
    icon: Users,
    title: "Public Profiles",
    desc: "Showcase skills, portfolio links, and experience to potential clients.",
  },
  {
    icon: Search,
    title: "Skill-Based Matching",
    desc: "Get recommended opportunities based on your profile skills.",
  },
];

const steps = [
  { n: "01", title: "Create your account", desc: "Sign up as a hustler or business in under a minute." },
  { n: "02", title: "Browse or post projects", desc: "Students explore the marketplace; clients post opportunities." },
  { n: "03", title: "Apply and collaborate", desc: "Submit applications, track status, and connect with clients." },
];

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <NeonBackground />
      <SiteHeader />

      <section className="mx-auto max-w-7xl px-6 pt-16 pb-32 lg:pt-24">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/80">
              <span className="h-1.5 w-1.5 animate-neon-pulse rounded-full bg-[#F5E400]" />
              Student-focused freelance marketplace
            </span>
            <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] sm:text-6xl lg:text-7xl">
              Turn Skills Into{" "}
              <span className="text-[#F5E400] text-glow-yellow">Opportunities.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/70">
              HustleBridge connects students and freelancers with businesses looking for
              project-based work. Explore opportunities, apply to projects, and grow your
              portfolio — all in one place.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-full bg-[#F5E400] px-7 py-4 text-base font-semibold text-black transition hover:scale-105 glow-yellow"
              >
                Get Started <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
              <Link
                to="/opportunities"
                className="inline-flex items-center gap-2 rounded-full border border-[#FF0A78]/60 px-7 py-4 text-base font-semibold text-white transition hover:bg-[#FF0A78]/10 hover:glow-pink"
              >
                Explore Opportunities
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-square overflow-hidden rounded-[2.5rem] glass-strong p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-[#F5E400]/10 via-transparent to-[#FF0A78]/10" />
              <div className="relative h-full rounded-3xl glass p-6">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#FF0A78]" />
                  <div className="h-3 w-3 rounded-full bg-[#F5E400]" />
                  <div className="h-3 w-3 rounded-full bg-white/20" />
                  <div className="ml-auto text-xs text-white/40">marketplace preview</div>
                </div>
                <div className="mt-6">
                  <div className="text-xs text-white/50">Browse</div>
                  <div className="text-2xl font-bold">Find Opportunities</div>
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    { t: "React Developer for Startup", b: "₹15K–25K", c: "#F5E400" },
                    { t: "UI/UX Designer for Mobile App", b: "₹10K–20K", c: "#FF0A78" },
                    { t: "Backend API Development", b: "₹20K–35K", c: "#F5E400" },
                  ].map((p, i) => (
                    <motion.div
                      key={i}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 + i * 0.15 }}
                      className="flex items-center justify-between rounded-xl bg-white/[0.04] p-3"
                    >
                      <div>
                        <div className="text-sm font-semibold">{p.t}</div>
                        <div className="text-xs text-white/40">Sample listing</div>
                      </div>
                      <div
                        className="rounded-full px-3 py-1 text-xs font-semibold text-black"
                        style={{ background: p.c }}
                      >
                        {p.b}
                      </div>
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
                  transition={{
                    delay: 0.4 + i * 0.1,
                    y: { duration: 4 + i, repeat: Infinity, ease: "easeInOut" },
                  }}
                  className={`absolute ${s.pos} glass-strong flex items-center gap-2 rounded-2xl px-4 py-3`}
                >
                  <span
                    className="grid h-9 w-9 place-items-center rounded-xl"
                    style={{ background: s.color, boxShadow: `0 0 24px ${s.color}66` }}
                  >
                    <Icon className="h-4 w-4 text-black" />
                  </span>
                  <span className="text-sm font-semibold">{s.label}</span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6">
        <div className="grid gap-4 rounded-3xl glass-strong p-6 sm:grid-cols-2 sm:p-10 md:grid-cols-4">
          {highlights.map((h, i) => {
            const Icon = h.icon;
            return (
              <motion.div
                key={h.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <Icon className="mx-auto h-6 w-6 text-[#F5E400]" />
                <div className="mt-3 font-bold">{h.title}</div>
                <div className="mt-2 text-sm text-white/60">{h.desc}</div>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-32">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-[#FF0A78]">
            Built for hustlers
          </span>
          <h2 className="mt-4 text-4xl font-bold sm:text-5xl">
            Everything you need to <span className="text-[#F5E400]">level up.</span>
          </h2>
          <p className="mt-4 text-white/60">
            A platform designed for students and early-career freelancers — from discovery
            to application.
          </p>
        </div>
        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="group rounded-3xl glass-strong p-7 transition hover:border-[#F5E400]/40"
              >
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

      <section className="mx-auto max-w-7xl px-6 pb-32">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-[#F5E400]">
            How it works
          </span>
          <h2 className="mt-4 text-4xl font-bold sm:text-5xl">Three steps to get started.</h2>
        </div>
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-3xl glass-strong p-8"
            >
              <div className="font-display text-4xl font-bold text-[#F5E400]">{s.n}</div>
              <h3 className="mt-4 text-xl font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-white/60">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-[2.5rem] glass-strong p-10 sm:p-16">
          <div className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-[#F5E400]/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-[#FF0A78]/20 blur-3xl" />
          <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <h2 className="font-display text-4xl font-bold sm:text-5xl">
              Ready to grow your <span className="text-[#FF0A78] text-glow-pink">hustle?</span>
            </h2>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                search={{ role: "student" }}
                className="rounded-full bg-[#F5E400] px-7 py-4 font-semibold text-black transition glow-yellow hover:scale-105"
              >
                Join as Hustler
              </Link>
              <Link
                to="/register"
                search={{ role: "client" }}
                className="rounded-full bg-[#FF0A78] px-7 py-4 font-semibold text-white transition glow-pink hover:scale-105"
              >
                Hire Talent
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
