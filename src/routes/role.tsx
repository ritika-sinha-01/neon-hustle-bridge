import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { GraduationCap, Briefcase, ArrowRight } from "lucide-react";
import { NeonBackground } from "@/components/site/NeonBackground";
import { Logo } from "@/components/site/Logo";

export const Route = createFileRoute("/role")({
  head: () => ({ meta: [{ title: "Choose Your Role — HustleBridge" }, { name: "description", content: "Sign up as hustler or business." }] }),
  component: RolePage,
});

function RolePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <NeonBackground />
      <div className="mx-auto flex max-w-5xl flex-col items-center px-6 pt-12 pb-20">
        <Logo />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-16 text-center">
          <div className="text-sm uppercase tracking-[0.3em] text-white/50">Welcome to</div>
          <h1 className="mt-3 font-display text-6xl font-bold sm:text-7xl">
            HUSTLE<span className="text-[#FF0A78] text-glow-pink">BRIDGE</span>
          </h1>
          <p className="mt-4 text-white/70">Choose how you want to continue</p>
        </motion.div>

        <div className="mt-16 grid w-full gap-6 md:grid-cols-2">
          {[
            { icon: GraduationCap, role: "HUSTLER", color: "#F5E400", desc: "Find freelance gigs, build your profile, and grow your hustle — open to students, creators, and side-hustlers.", to: "/student", cta: "Continue as Hustler" },
            { icon: Briefcase, role: "BUSINESS", color: "#FF0A78", desc: "Post projects, hire talented hustlers, and grow your business.", to: "/client", cta: "Continue as Business" },
          ].map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div key={r.role} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.15 }}>
                <Link to={r.to} className="group block">
                  <div className="relative h-full rounded-3xl glass-strong p-10 transition hover:-translate-y-2" style={{ boxShadow: `inset 0 0 0 1px ${r.color}22` }}>
                    <div className="absolute inset-0 rounded-3xl opacity-0 transition group-hover:opacity-100" style={{ boxShadow: `0 0 60px -10px ${r.color}, inset 0 0 0 1px ${r.color}` }} />
                    <div className="relative">
                      <div className="grid h-20 w-20 place-items-center rounded-2xl" style={{ background: `${r.color}1a`, color: r.color, boxShadow: `0 0 32px ${r.color}66` }}>
                        <Icon className="h-10 w-10" />
                      </div>
                      <h2 className="mt-8 text-3xl font-bold">I'M A <span style={{ color: r.color }}>{r.role}</span></h2>
                      <p className="mt-3 text-white/60">{r.desc}</p>
                      <div className="mt-10 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-black transition group-hover:scale-105" style={{ background: r.color, boxShadow: `0 0 24px ${r.color}88` }}>
                        {r.cta} <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <p className="mt-10 text-sm text-white/50">Already have an account? <Link to="/student" className="text-[#F5E400] hover:underline">Login</Link></p>
      </div>
    </div>
  );
}