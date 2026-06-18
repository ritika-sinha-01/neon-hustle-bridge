import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { CheckCircle2, MapPin, Pencil, Share2, Star, Trophy } from "lucide-react";
import { AppShell } from "@/components/site/AppShell";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — HustleBridge" }, { name: "description", content: "Public student profile." }] }),
  component: Profile,
});

function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiClient.get<any>("/students/profile");
        setProfile(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <AppShell title="Student Profile">
        <div className="flex items-center justify-center h-64">
          <p className="text-white/60">Loading profile...</p>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Student Profile">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-400">{error}</p>
        </div>
      </AppShell>
    );
  }

  const skills = profile?.skills || ["React", "Node.js", "MongoDB", "JavaScript", "Tailwind CSS", "Express", "Figma", "TypeScript"];
  const portfolio = [["#F5E400","#FF0A78"],["#FF0A78","#F5E400"],["#F5E400","#a78bfa"],["#FF0A78","#34d399"]];
  const experience = [
    { y: "2024-Now", t: "Freelance Full-Stack Developer", d: "Built 14+ websites for SMBs and student startups." },
    { y: "2023", t: "Frontend Intern · Razorpay", d: "Shipped checkout UI improvements used by 2M+ users." },
    { y: "2022", t: "Open Source Contributor", d: "Maintained UI components library with 1.4k stars." },
  ];
  return (
    <AppShell title="Student Profile">
      <div className="relative overflow-hidden rounded-3xl glass-strong">
        <div className="h-44 bg-gradient-to-r from-[#FF0A78] via-[#050505] to-[#F5E400]" />
        <div className="p-6">
          <div className="-mt-20 flex flex-wrap items-end gap-5">
            <div className="grid h-32 w-32 shrink-0 place-items-center rounded-3xl border-4 border-[#050505] bg-gradient-to-br from-[#F5E400] to-[#FF0A78] text-4xl font-bold text-black">{profile?.fullName?.substring(0, 2).toUpperCase() || "AV"}</div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold">{profile?.fullName || "Arjun Verma"}</h1>
                <CheckCircle2 className="h-5 w-5 fill-[#F5E400] text-black" />
              </div>
              <div className="text-white/60">{profile?.headline || "Full Stack Developer"}</div>
              <div className="mt-1 inline-flex items-center gap-1 text-sm text-white/50"><MapPin className="h-3 w-3" /> {profile?.location || "Delhi, India"} · Available for work</div>
            </div>
            <div className="font-display text-6xl font-bold italic text-[#FF0A78] text-glow-pink hidden md:block">HUSTLE MODE</div>
            <div className="flex gap-2">
              <button className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm"><Pencil className="h-4 w-4" /> Edit</button>
              <button className="inline-flex items-center gap-2 rounded-full bg-[#F5E400] px-4 py-2 text-sm font-semibold text-black"><Share2 className="h-4 w-4" /> Share</button>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[{l:"Projects",v:"14"},{l:"Experience",v:"1.5 Yrs"},{l:"Rating",v:"4.9"},{l:"Earnings",v:"₹1.21L+"}].map((s) => (
              <div key={s.l} className="rounded-2xl bg-white/[0.03] p-4 text-center">
                <div className="font-display text-3xl font-bold text-[#F5E400]">{s.v}</div>
                <div className="text-xs text-white/60">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-3xl glass-strong p-6">
            <h2 className="text-lg font-bold">About</h2>
            <p className="mt-3 text-white/70">{profile?.bio || "Passionate full-stack developer skilled in building modern web applications with clean UI and great performance. Currently in my final year, working with startups across India."}</p>
          </div>
          <div className="rounded-3xl glass-strong p-6">
            <h2 className="text-lg font-bold">Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.map((s: string, i: number) => <span key={s} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${i % 2 === 0 ? "bg-[#F5E400] text-black" : "bg-[#FF0A78] text-white"}`}>{s}</span>)}
            </div>
          </div>
          <div className="rounded-3xl glass-strong p-6">
            <h2 className="text-lg font-bold">Portfolio</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {portfolio.map((p, i) => (
                <motion.div key={i} whileHover={{ scale: 1.05 }} className="aspect-square rounded-2xl" style={{ background: `linear-gradient(135deg, ${p[0]}, ${p[1]})` }} />
              ))}
            </div>
          </div>
          <div className="rounded-3xl glass-strong p-6">
            <h2 className="text-lg font-bold">Experience</h2>
            <ol className="mt-5 space-y-5 border-l border-white/10 pl-6">
              {experience.map((e) => (
                <li key={e.t} className="relative">
                  <span className="absolute -left-[1.86rem] top-1 grid h-3 w-3 place-items-center rounded-full bg-[#F5E400] glow-yellow" />
                  <div className="text-xs text-[#FF0A78]">{e.y}</div>
                  <div className="font-semibold">{e.t}</div>
                  <div className="text-sm text-white/60">{e.d}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl glass-strong p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">Achievements</h3>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[{i:Trophy,l:"Top 1% Hustler"},{i:Star,l:"5-star rated"},{i:CheckCircle2,l:"Verified ID"},{i:Trophy,l:"100 days streak"}].map((a, i) => {
                const Icon = a.i;
                return (
                  <div key={i} className="rounded-2xl bg-white/[0.03] p-4 text-center">
                    <Icon className="mx-auto h-6 w-6 text-[#F5E400]" />
                    <div className="mt-2 text-xs">{a.l}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-3xl glass-strong p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">Reviews</h3>
            {[{n:"TechLearn",r:5,t:"Delivered ahead of time, super polished."},{n:"DesignHub",r:5,t:"Communicative, fast, talented."}].map((r) => (
              <div key={r.n} className="mt-4 rounded-2xl bg-white/[0.03] p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{r.n}</div>
                  <div className="flex text-[#F5E400]">{Array.from({length:r.r}).map((_,i) => <Star key={i} className="h-3 w-3 fill-current" />)}</div>
                </div>
                <p className="mt-2 text-xs text-white/60">"{r.t}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}