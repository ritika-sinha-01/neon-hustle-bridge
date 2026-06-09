import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Github, Instagram, Linkedin, Twitter } from "lucide-react";

export function SiteFooter() {
  const cols = [
    { title: "Platform", links: ["Features", "How it works", "Opportunities", "Pricing"] },
    { title: "Company", links: ["About", "Careers", "Blog", "Contact"] },
    { title: "Legal", links: ["Privacy", "Terms", "Cookies"] },
    { title: "Support", links: ["Help center", "FAQ", "Status"] },
  ];
  return (
    <footer className="mt-32 border-t border-white/5">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-white/60">Bridging student talent with real-world opportunities. Hustle smarter.</p>
          <div className="mt-6 flex gap-3">
            {[Instagram, Twitter, Linkedin, Github].map((Icon, i) => (
              <a key={i} href="#" className="grid h-10 w-10 place-items-center rounded-full glass text-white/70 transition hover:text-[#F5E400] hover:glow-yellow">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/90">{c.title}</h4>
            <ul className="space-y-2">
              {c.links.map((l) => (
                <li key={l}><Link to="/cta" className="text-sm text-white/60 hover:text-[#F5E400]">{l}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 py-6 text-center text-xs text-white/40">© 2026 HustleBridge. Built for the relentless.</div>
    </footer>
  );
}