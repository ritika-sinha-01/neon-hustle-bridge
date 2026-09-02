import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { isAuthenticated, getStoredUser } from "@/lib/auth";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/opportunities", label: "Opportunities" },
  { to: "/cta", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const authed = isAuthenticated();
  const user = getStoredUser();
  const dashboardPath = user?.role === "client" ? "/client" : "/student";

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="glass-strong flex items-center justify-between rounded-2xl px-4 py-3 sm:px-6">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {publicLinks.map((l) => (
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
            {authed && (
              <Link
                to={dashboardPath}
                className="rounded-full px-4 py-2 text-sm text-white/70 transition hover:text-white"
              >
                Dashboard
              </Link>
            )}
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            {authed ? (
              <Link
                to={dashboardPath}
                className="rounded-full bg-[#F5E400] px-5 py-2 text-sm font-semibold text-black transition hover:scale-105 glow-yellow"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="rounded-full px-4 py-2 text-sm text-white/80 hover:text-white">
                  Login
                </Link>
                <Link
                  to="/login"
                  className="rounded-full border border-[#F5E400]/40 px-4 py-2 text-sm text-[#F5E400]"
                >
                  Try Demo
                </Link>
                <Link
                  to="/register"
                  className="rounded-full bg-[#F5E400] px-5 py-2 text-sm font-semibold text-black transition hover:scale-105 glow-yellow"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
          <button type="button" onClick={() => setOpen(!open)} className="text-white md:hidden">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <div className="glass mt-2 flex flex-col gap-1 rounded-2xl p-3 md:hidden">
            {publicLinks.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/5"
              >
                {l.label}
              </Link>
            ))}
            {authed ? (
              <Link
                to={dashboardPath}
                onClick={() => setOpen(false)}
                className="mt-2 rounded-xl bg-[#F5E400] px-4 py-3 text-center text-sm font-semibold text-black"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm text-white/80 hover:bg-white/5"
                >
                  Login
                </Link>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm text-[#F5E400] hover:bg-white/5"
                >
                  Try Demo
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="mt-2 rounded-xl bg-[#F5E400] px-4 py-3 text-center text-sm font-semibold text-black"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
