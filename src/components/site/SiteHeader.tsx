import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { to: "/", label: "Home" },
  { to: "/opportunities", label: "Opportunities" },
  { to: "/ai-outreach", label: "AI Outreach" },
  { to: "/profile", label: "Profile" },
  { to: "/cta", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="glass-strong flex items-center justify-between rounded-2xl px-4 py-3 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                className="rounded-full px-4 py-2 text-sm text-white/70 transition hover:text-white"
                activeProps={{ className: "text-[#F5E400]" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Link to="/role" className="rounded-full px-4 py-2 text-sm text-white/80 hover:text-white">Login</Link>
            <Link to="/role" className="rounded-full bg-[#F5E400] px-5 py-2 text-sm font-semibold text-black transition hover:scale-105 glow-yellow">
              Get Started
            </Link>
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden text-white">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <div className="glass mt-2 flex flex-col gap-1 rounded-2xl p-3 md:hidden">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/5">{l.label}</Link>
            ))}
            <Link to="/role" onClick={() => setOpen(false)} className="mt-2 rounded-xl bg-[#F5E400] px-4 py-3 text-center text-sm font-semibold text-black">Get Started</Link>
          </div>
        )}
      </div>
    </header>
  );
}