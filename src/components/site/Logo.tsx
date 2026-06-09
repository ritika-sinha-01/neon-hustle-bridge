import { Link } from "@tanstack/react-router";
import { Zap } from "lucide-react";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2 ${className}`}>
      <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5E400] text-black glow-yellow">
        <Zap className="h-5 w-5" strokeWidth={2.5} />
      </span>
      <span className="font-display text-xl font-bold tracking-tight">
        Hustle<span className="text-[#FF0A78] text-glow-pink">Bridge</span>
      </span>
    </Link>
  );
}