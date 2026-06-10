import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/40 ring-1 ring-white/10 backdrop-blur transition group-hover:ring-[#F5E400]/60">
        <span className="pointer-events-none absolute inset-0 rounded-xl opacity-70 blur-md transition group-hover:opacity-100"
          style={{ background: "radial-gradient(circle at 30% 30%, #F5E40055, transparent 60%), radial-gradient(circle at 70% 70%, #FF0A7855, transparent 60%)" }} />
        <svg viewBox="0 0 32 32" className="relative h-6 w-6" fill="none" aria-hidden>
          <defs>
            <linearGradient id="hb-stroke" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F5E400" />
              <stop offset="100%" stopColor="#FF0A78" />
            </linearGradient>
          </defs>
          {/* Left tower */}
          <line x1="6" y1="5" x2="6" y2="27" stroke="#F5E400" strokeWidth="2.5" strokeLinecap="round" />
          {/* Right tower */}
          <line x1="26" y1="5" x2="26" y2="27" stroke="#FF0A78" strokeWidth="2.5" strokeLinecap="round" />
          {/* Suspension arch (the bridge) */}
          <path d="M6 12 Q 16 2 26 12" stroke="url(#hb-stroke)" strokeWidth="2.5" strokeLinecap="round" />
          {/* Crossbar / deck — also the H bar */}
          <line x1="6" y1="17" x2="26" y2="17" stroke="url(#hb-stroke)" strokeWidth="2.5" strokeLinecap="round" />
          {/* Spark */}
          <circle cx="16" cy="17" r="2" fill="#F5E400" />
        </svg>
      </span>
      <span className="font-display text-xl font-bold tracking-tight leading-none">
        Hustle<span className="text-[#FF0A78] text-glow-pink">Bridge</span>
      </span>
    </Link>
  );
}