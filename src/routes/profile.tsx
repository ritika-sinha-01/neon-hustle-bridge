import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, MapPin, Pencil, Share2 } from "lucide-react";
import { AppShell } from "@/components/site/AppShell";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/profile")({
  beforeLoad: requireAuth,
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

  const skills = profile?.skills || [];
  const profileStrength = profile?.profileStrength || 0;
  const hustleScore = profile?.hustleScore || 0;
  const totalEarnings = profile?.totalEarnings || 0;

  return (
    <AppShell title="Student Profile">
      <div className="relative overflow-hidden rounded-3xl glass-strong">
        <div className="h-44 bg-gradient-to-r from-[#FF0A78] via-[#050505] to-[#F5E400]" />
        <div className="p-6">
          <div className="-mt-20 flex flex-wrap items-end gap-5">
            <div className="grid h-32 w-32 shrink-0 place-items-center rounded-3xl border-4 border-[#050505] bg-gradient-to-br from-[#F5E400] to-[#FF0A78] text-4xl font-bold text-black">{profile?.fullName?.substring(0, 2).toUpperCase() || "AV"}</div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold">{profile?.fullName || "Hustler"}</h1>
                <CheckCircle2 className="h-5 w-5 fill-[#F5E400] text-black" />
              </div>
              <div className="text-white/60">{profile?.headline || "Full Stack Developer"}</div>
              <div className="mt-1 inline-flex items-center gap-1 text-sm text-white/50"><MapPin className="h-3 w-3" /> {profile?.location || "Location not set"} · Available for work</div>
            </div>
            <div className="font-display text-6xl font-bold italic text-[#FF0A78] text-glow-pink hidden md:block">HUSTLE MODE</div>
            <div className="flex gap-2">
              <Link
                to="/settings"
                className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm"
              >
                <Pencil className="h-4 w-4" /> Edit
              </Link>
              <button
                type="button"
                onClick={async () => {
                  const text = `${profile?.fullName || "My profile"} on HustleBridge`;
                  try {
                    if (navigator.share) {
                      await navigator.share({ title: "HustleBridge Profile", text });
                    } else {
                      await navigator.clipboard.writeText(text);
                      alert("Profile link copied to clipboard.");
                    }
                  } catch {
                    /* user cancelled share */
                  }
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[#F5E400] px-4 py-2 text-sm font-semibold text-black"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-2xl bg-white/[0.03] p-4 text-center">
              <div className="font-display text-3xl font-bold text-[#F5E400]">{profileStrength}%</div>
              <div className="text-xs text-white/60">Profile Strength</div>
            </div>
            <div className="rounded-2xl bg-white/[0.03] p-4 text-center">
              <div className="font-display text-3xl font-bold text-[#FF0A78]">{hustleScore}</div>
              <div className="text-xs text-white/60">Hustle Score</div>
            </div>
            <div className="rounded-2xl bg-white/[0.03] p-4 text-center">
              <div className="font-display text-3xl font-bold text-[#F5E400]">₹{totalEarnings.toLocaleString()}</div>
              <div className="text-xs text-white/60">Total Earnings</div>
            </div>
            <div className="rounded-2xl bg-white/[0.03] p-4 text-center">
              <div className="font-display text-3xl font-bold text-[#FF0A78]">{skills.length}</div>
              <div className="text-xs text-white/60">Skills</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-3xl glass-strong p-6">
            <h2 className="text-lg font-bold">About</h2>
            {profile?.bio ? (
              <p className="mt-3 text-white/70">{profile.bio}</p>
            ) : (
              <p className="mt-3 text-white/60">No bio added yet. Edit your profile to add information about yourself.</p>
            )}
          </div>
          <div className="rounded-3xl glass-strong p-6">
            <h2 className="text-lg font-bold">Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {skills.length > 0 ? (
                skills.map((s: string, i: number) => <span key={s} className={`rounded-full px-3 py-1.5 text-xs font-semibold ${i % 2 === 0 ? "bg-[#F5E400] text-black" : "bg-[#FF0A78] text-white"}`}>{s}</span>)
              ) : (
                <p className="text-white/60">No skills added yet. Edit your profile to add your skills.</p>
              )}
            </div>
          </div>
          <div className="rounded-3xl glass-strong p-6">
            <h2 className="text-lg font-bold">Portfolio</h2>
            {profile?.portfolioUrl ? (
              <div className="mt-4">
                <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-[#F5E400] hover:underline">
                  {profile.portfolioUrl}
                </a>
              </div>
            ) : (
              <p className="mt-4 text-white/60">No portfolio URL added yet. Edit your profile to add your portfolio link.</p>
            )}
          </div>
          <div className="rounded-3xl glass-strong p-6">
            <h2 className="text-lg font-bold">Experience</h2>
            <p className="mt-4 text-white/60">Experience section coming soon. Edit your profile to add your work history.</p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-3xl glass-strong p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">Achievements</h3>
            <p className="mt-4 text-white/60">Achievements coming soon. Complete projects to earn badges!</p>
          </div>
          <div className="rounded-3xl glass-strong p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">Reviews</h3>
            <p className="mt-4 text-white/60">No reviews yet. Complete projects to receive reviews from clients.</p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}