import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Github, Instagram, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { NeonBackground } from "@/components/site/NeonBackground";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

export const Route = createFileRoute("/cta")({
  head: () => ({ meta: [{ title: "Get Started — HustleBridge" }, { name: "description", content: "Join thousands building their future." }] }),
  component: CTA,
});

function CTA() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <NeonBackground />
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-6xl font-bold leading-[1.05] sm:text-7xl lg:text-8xl">
          READY TO GROW <br /> YOUR <span className="text-[#FF0A78] text-glow-pink italic">HUSTLE?</span>
        </motion.h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">Join thousands of hustlers and businesses building the future together. Your next big opportunity is one click away.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/register" as="/register" className="rounded-full bg-[#F5E400] px-8 py-4 font-semibold text-black glow-yellow hover:scale-105 transition">Join as Hustler</Link>
          <Link to="/register" as="/register" className="rounded-full bg-[#FF0A78] px-8 py-4 font-semibold text-white glow-pink hover:scale-105 transition">Hire Hustler Talent</Link>
        </div>

        <div className="mt-20 grid gap-4 md:grid-cols-3">
          {[
            { i: Mail, l: "Email", v: "hello@hustlebridge.app" },
            { i: Phone, l: "Phone", v: "+91 98765 43210" },
            { i: MapPin, l: "Office", v: "Bengaluru, India" },
          ].map((c, i) => {
            const Icon = c.i;
            return (
              <motion.div key={c.l} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="rounded-3xl glass-strong p-6 text-left">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#F5E400]/10 text-[#F5E400]"><Icon className="h-5 w-5" /></span>
                <div className="mt-4 text-xs uppercase tracking-wider text-white/50">{c.l}</div>
                <div className="mt-1 font-semibold">{c.v}</div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 flex justify-center gap-4">
          {[Instagram, Twitter, Linkedin, Github].map((Icon, i) => (
            <a key={i} href="#" className="grid h-12 w-12 place-items-center rounded-full glass-strong text-white/70 transition hover:text-[#F5E400] hover:glow-yellow"><Icon className="h-5 w-5" /></a>
          ))}
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}