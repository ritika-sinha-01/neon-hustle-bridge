import { createFileRoute } from "@tanstack/react-router";
import { Bell, User } from "lucide-react";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/site/AppShell";
import { apiClient } from "@/lib/api/client";
import { requireAuth } from "@/lib/require-auth";
import { getStoredUser } from "@/lib/auth";

export const Route = createFileRoute("/settings")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [{ title: "Settings — HustleBridge" }, { name: "description", content: "Manage your account." }],
  }),
  component: Settings,
});

function Settings() {
  const user = getStoredUser();
  const isClient = user?.role === "client";

  const [form, setForm] = useState({
    fullName: "",
    headline: "",
    bio: "",
    location: "",
    companyName: "",
    industry: "",
    description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const path = isClient ? "/clients/profile" : "/students/profile";
        const data = await apiClient.get<any>(path);
        if (isClient) {
          setForm({
            fullName: "",
            headline: "",
            bio: "",
            location: data.location || "",
            companyName: data.companyName || "",
            industry: data.industry || "",
            description: data.description || "",
          });
        } else {
          setForm({
            fullName: data.fullName || "",
            headline: data.headline || "",
            bio: data.bio || "",
            location: data.location || "",
            companyName: "",
            industry: "",
            description: "",
          });
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isClient]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      if (isClient) {
        await apiClient.put("/clients/profile", {
          companyName: form.companyName,
          industry: form.industry,
          description: form.description,
          location: form.location,
        });
      } else {
        await apiClient.put("/students/profile", {
          fullName: form.fullName,
          headline: form.headline,
          bio: form.bio,
          location: form.location,
        });
      }
      setSuccess("Changes saved successfully.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppShell title="Settings">
        <div className="flex h-64 items-center justify-center">
          <p className="text-white/60">Loading settings...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Settings">
      <div className="rounded-3xl glass-strong p-6">
        <h2 className="text-xl font-bold">{isClient ? "Company Settings" : "Profile Settings"}</h2>

        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        {success && <p className="mt-4 text-sm text-[#F5E400]">{success}</p>}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {isClient ? (
            <>
              <div>
                <label className="text-xs text-white/50">Company Name</label>
                <input
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="mt-1 w-full rounded-xl bg-white/[0.04] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#F5E400]/40"
                />
              </div>
              <div>
                <label className="text-xs text-white/50">Industry</label>
                <input
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  className="mt-1 w-full rounded-xl bg-white/[0.04] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#F5E400]/40"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-white/50">Description</label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="mt-1 w-full rounded-xl bg-white/[0.04] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#F5E400]/40"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="text-xs text-white/50">Full Name</label>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  className="mt-1 w-full rounded-xl bg-white/[0.04] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#F5E400]/40"
                />
              </div>
              <div>
                <label className="text-xs text-white/50">Headline</label>
                <input
                  value={form.headline}
                  onChange={(e) => setForm({ ...form, headline: e.target.value })}
                  className="mt-1 w-full rounded-xl bg-white/[0.04] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#F5E400]/40"
                />
              </div>
            </>
          )}
          <div className={isClient ? "md:col-span-2" : ""}>
            <label className="text-xs text-white/50">Location</label>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="mt-1 w-full rounded-xl bg-white/[0.04] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#F5E400]/40"
            />
          </div>
          {!isClient && (
            <div className="md:col-span-2">
              <label className="text-xs text-white/50">Bio</label>
              <textarea
                rows={4}
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="mt-1 w-full rounded-xl bg-white/[0.04] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#F5E400]/40"
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-[#F5E400] px-6 py-3 text-sm font-semibold text-black glow-yellow disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className="mt-8 rounded-2xl bg-white/[0.03] p-4 text-sm text-white/60">
          <Bell className="mb-2 h-4 w-4 text-[#F5E400]" />
          Notification preferences, payment methods, and appearance settings are coming soon.
        </div>
      </div>
    </AppShell>
  );
}
