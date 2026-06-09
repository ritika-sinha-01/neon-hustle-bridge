import { Link, useRouterState } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { NeonBackground } from "./NeonBackground";
import { Bell, Bookmark, Briefcase, LayoutDashboard, MessageSquare, Search, Settings, Sparkles, User } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/student", label: "Dashboard", icon: LayoutDashboard },
  { to: "/opportunities", label: "Opportunities", icon: Briefcase },
  { to: "/profile", label: "My Profile", icon: User },
  { to: "/ai-outreach", label: "AI Outreach", icon: Sparkles },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/client", label: "Client View", icon: Bookmark },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="relative min-h-screen">
      <NeonBackground />
      <div className="mx-auto flex max-w-[1500px] gap-6 px-4 py-6 lg:px-8">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-64 shrink-0 flex-col rounded-3xl glass-strong p-5 lg:flex">
          <Logo />
          <nav className="mt-8 flex flex-col gap-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                    active ? "bg-[#F5E400] text-black font-semibold glow-yellow" : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto rounded-2xl glass p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#FF0A78] to-[#F5E400] text-sm font-bold text-black">AV</div>
              <div>
                <div className="text-sm font-semibold">Arjun Verma</div>
                <div className="text-xs text-white/50">View profile</div>
              </div>
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden items-center gap-2 rounded-full glass px-4 py-2 md:flex">
                <Search className="h-4 w-4 text-white/50" />
                <input placeholder="Search…" className="w-48 bg-transparent text-sm outline-none placeholder:text-white/40" />
              </div>
              <Link to="/notifications" className="grid h-10 w-10 place-items-center rounded-full glass text-white/80 hover:text-[#F5E400]">
                <Bell className="h-4 w-4" />
              </Link>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#FF0A78] to-[#F5E400] text-sm font-bold text-black">AV</div>
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}