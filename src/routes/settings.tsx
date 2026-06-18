import { createFileRoute } from "@tanstack/react-router";
import { Bell, CreditCard, Lock, Palette, ShieldCheck, User } from "lucide-react";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/site/AppShell";
import { apiClient } from "@/lib/api/client";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — HustleBridge" }, { name: "description", content: "Manage your account." }] }),
  component: Settings,
});

const tabs = [
  { id: "profile", l: "Profile Settings", i: User },
  { id: "account", l: "Account", i: ShieldCheck },
  { id: "notify", l: "Notifications", i: Bell },
  { id: "privacy", l: "Privacy", i: Lock },
  { id: "appearance", l: "Appearance", i: Palette },
  { id: "payments", l: "Payment Methods", i: CreditCard },
];

function Settings() {
  const [tab, setTab] = useState("profile");
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
      <AppShell title="Settings">
        <div className="flex items-center justify-center h-64">
          <p className="text-white/60">Loading settings...</p>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Settings">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-400">{error}</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Settings">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <nav className="rounded-3xl glass-strong p-3">
          {tabs.map((t) => {
            const Icon = t.i;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition ${tab === t.id ? "bg-[#F5E400] text-black font-semibold" : "text-white/70 hover:bg-white/5"}`}>
                <Icon className="h-4 w-4" /> {t.l}
              </button>
            );
          })}
        </nav>
        <div className="rounded-3xl glass-strong p-6">
          <h2 className="text-xl font-bold">Profile Settings</h2>
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <div className="grid h-24 w-24 place-items-center rounded-2xl bg-gradient-to-br from-[#F5E400] to-[#FF0A78] text-3xl font-bold text-black">{profile?.fullName?.substring(0, 2).toUpperCase() || "AV"}</div>
            <div>
              <button className="rounded-full bg-[#F5E400] px-4 py-2 text-sm font-semibold text-black">Change Photo</button>
              <div className="mt-2 text-xs text-white/50">JPG or PNG · Max 2MB</div>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[
              { l: "Full Name", v: profile?.fullName || "Arjun Verma" },
              { l: "Email", v: profile?.email || "arjun.verma@example.com" },
              { l: "Location", v: profile?.location || "Delhi, India" },
              { l: "Phone", v: profile?.phone || "+91 98765 43210" },
            ].map((f) => (
              <div key={f.l}>
                <label className="text-xs text-white/50">{f.l}</label>
                <input defaultValue={f.v} className="mt-1 w-full rounded-xl bg-white/[0.04] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#F5E400]/40" />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="text-xs text-white/50">Bio</label>
              <textarea rows={4} defaultValue={profile?.bio || "Passionate full-stack developer building delightful product experiences."} className="mt-1 w-full rounded-xl bg-white/[0.04] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#F5E400]/40" />
            </div>
          </div>
          <div className="mt-6 flex gap-3">
            <button className="rounded-full bg-[#F5E400] px-6 py-3 text-sm font-semibold text-black glow-yellow">Save Changes</button>
            <button className="rounded-full glass px-6 py-3 text-sm">Cancel</button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}