import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Plus, Users, Briefcase, Trophy, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/site/AppShell";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { requireAuth } from "@/lib/require-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/client")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "Client Dashboard — HustleBridge" },
      { name: "description", content: "Manage your projects and applicants." },
    ],
  }),
  component: ClientDash,
});

interface Applicant {
  id: string;
  studentName: string;
  coverLetter: string;
  status: string;
}

function ClientDash() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [applicantsOpen, setApplicantsOpen] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Web Development",
    budgetMin: "",
    budgetMax: "",
    workMode: "remote",
    skillsRequired: "",
  });

  const loadDashboard = async () => {
    try {
      const data = await apiClient.get<any>("/clients/dashboard");
      setDashboard(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = [
    { v: dashboard?.stats?.totalOpportunities || 0, l: "Total Projects", c: "#F5E400", i: Briefcase },
    { v: dashboard?.stats?.pendingApplications || 0, l: "Pending", c: "#FF0A78", i: Users },
    { v: dashboard?.stats?.inReviewApplications || 0, l: "In Review", c: "#F5E400", i: CheckCircle2 },
    { v: dashboard?.stats?.hiredCount || 0, l: "Hired", c: "#FF0A78", i: Trophy },
  ];

  const recent =
    dashboard?.recentOpportunities?.map((opp: any) => ({
      id: opp.id,
      t: opp.title || "Untitled Project",
      c: opp.category || "General",
      a: opp.applicationCount || 0,
      s: opp.status || "open",
      color: opp.status === "open" ? "#FF0A78" : "#F5E400",
    })) || [];

  const totalApplications =
    (dashboard?.stats?.pendingApplications ?? 0) + (dashboard?.stats?.inReviewApplications ?? 0);

  const handleCreate = async () => {
    setFormError("");
    if (!form.title.trim() || !form.description.trim()) {
      setFormError("Title and description are required.");
      return;
    }
    setFormLoading(true);
    try {
      await apiClient.post("/opportunities", {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        budgetMin: Number(form.budgetMin) || 0,
        budgetMax: Number(form.budgetMax) || 0,
        workMode: form.workMode,
        status: "open",
        skillsRequired: form.skillsRequired
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      });
      setCreateOpen(false);
      setForm({
        title: "",
        description: "",
        category: "Web Development",
        budgetMin: "",
        budgetMax: "",
        workMode: "remote",
        skillsRequired: "",
      });
      setLoading(true);
      await loadDashboard();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to create opportunity");
    } finally {
      setFormLoading(false);
    }
  };

  const openApplicants = async (opp: any) => {
    setSelectedOpp(opp);
    setApplicantsOpen(true);
    setApplicantsLoading(true);
    try {
      const data = await apiClient.get<Applicant[]>(
        `/opportunities/${opp.id}/applications?limit=50`,
      );
      setApplicants(Array.isArray(data) ? data : []);
    } catch {
      setApplicants([]);
    } finally {
      setApplicantsLoading(false);
    }
  };

  const updateApplicantStatus = async (applicationId: string, status: string) => {
    try {
      await apiClient.patch(`/applications/${applicationId}/status`, { status });
      if (selectedOpp) {
        openApplicants(selectedOpp);
      }
      await loadDashboard();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  if (loading) {
    return (
      <AppShell title="Dashboard">
        <div className="flex h-64 items-center justify-center">
          <p className="text-white/60">Loading dashboard...</p>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Dashboard">
        <div className="flex h-64 items-center justify-center">
          <p className="text-red-400">{error}</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title={`Welcome back, ${dashboard?.profile?.companyName || "Client"} 👋`}
    >
      <div className="rounded-3xl glass-strong p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-white/60">Manage projects and review applicants.</div>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#FF0A78] px-5 py-3 text-sm font-semibold text-white glow-pink transition hover:scale-105"
          >
            <Plus className="h-4 w-4" /> Post a Project
          </button>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.i;
            return (
              <div key={s.l} className="rounded-2xl bg-white/[0.03] p-5">
                <Icon className="h-5 w-5" style={{ color: s.c }} />
                <div className="mt-3 font-display text-4xl font-bold" style={{ color: s.c }}>
                  {s.v}
                </div>
                <div className="text-xs text-white/60">{s.l}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl glass-strong p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Projects</h2>
            <Link to="/opportunities" className="text-sm text-[#F5E400] hover:underline">
              View Marketplace
            </Link>
          </div>
          <ul className="mt-4 space-y-3">
            {recent.length > 0 ? (
              recent.map((p: any) => (
                <motion.li
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex cursor-pointer items-center gap-4 rounded-2xl bg-white/[0.03] p-4 transition hover:bg-white/[0.06]"
                  onClick={() => openApplicants(p)}
                >
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-[#F5E400] to-[#FF0A78] font-bold text-black">
                    {p.t?.[0] || "P"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold">{p.t}</div>
                    <div className="text-xs text-white/50">
                      {p.c} · {p.a} Applicants · Click to review
                    </div>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold capitalize text-black"
                    style={{ background: p.color }}
                  >
                    {p.s}
                  </span>
                </motion.li>
              ))
            ) : (
              <li className="rounded-2xl bg-white/[0.03] p-8 text-center">
                <p className="text-white/60">
                  No projects yet. Post your first opportunity to get started!
                </p>
              </li>
            )}
          </ul>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl glass-strong p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">
              Total Projects
            </h3>
            <div className="mt-3 font-display text-4xl font-bold text-[#F5E400]">
              {dashboard?.stats?.totalOpportunities || 0}
            </div>
            <div className="mt-2 text-xs text-white/50">Opportunities posted</div>
          </div>
          <div className="rounded-3xl glass-strong p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">
              Total Applications
            </h3>
            <div className="mt-3 font-display text-4xl font-bold text-[#FF0A78]">
              {totalApplications}
            </div>
            <div className="mt-2 text-xs text-white/50">Applications received</div>
          </div>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#101010] text-white">
          <DialogHeader>
            <DialogTitle>Post a New Project</DialogTitle>
            <DialogDescription className="text-white/60">
              Create an opportunity that appears in the marketplace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <input
              placeholder="Project title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-xl bg-white/5 px-4 py-3 text-sm outline-none"
            />
            <Textarea
              placeholder="Project description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="border-white/10 bg-white/5 text-white"
            />
            <input
              placeholder="Category (e.g. Web Development)"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-xl bg-white/5 px-4 py-3 text-sm outline-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min budget (₹)"
                value={form.budgetMin}
                onChange={(e) => setForm({ ...form, budgetMin: e.target.value })}
                className="rounded-xl bg-white/5 px-4 py-3 text-sm outline-none"
              />
              <input
                type="number"
                placeholder="Max budget (₹)"
                value={form.budgetMax}
                onChange={(e) => setForm({ ...form, budgetMax: e.target.value })}
                className="rounded-xl bg-white/5 px-4 py-3 text-sm outline-none"
              />
            </div>
            <select
              value={form.workMode}
              onChange={(e) => setForm({ ...form, workMode: e.target.value })}
              className="w-full rounded-xl bg-white/5 px-4 py-3 text-sm outline-none"
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>
            <input
              placeholder="Skills (comma-separated)"
              value={form.skillsRequired}
              onChange={(e) => setForm({ ...form, skillsRequired: e.target.value })}
              className="w-full rounded-xl bg-white/5 px-4 py-3 text-sm outline-none"
            />
            {formError && <p className="text-sm text-red-400">{formError}</p>}
            <button
              onClick={handleCreate}
              disabled={formLoading}
              className="w-full rounded-full bg-[#FF0A78] py-3 font-semibold text-white disabled:opacity-50"
            >
              {formLoading ? "Creating..." : "Publish Opportunity"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={applicantsOpen} onOpenChange={setApplicantsOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#101010] text-white">
          <DialogHeader>
            <DialogTitle>Applicants — {selectedOpp?.t}</DialogTitle>
            <DialogDescription className="text-white/60">
              Review and update application status.
            </DialogDescription>
          </DialogHeader>
          {applicantsLoading ? (
            <p className="text-white/60">Loading applicants...</p>
          ) : applicants.length === 0 ? (
            <p className="text-white/60">No applicants yet for this project.</p>
          ) : (
            <ul className="space-y-4">
              {applicants.map((a) => (
                <li key={a.id} className="rounded-2xl bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{a.studentName}</div>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs capitalize">
                      {a.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-white/60 line-clamp-3">{a.coverLetter}</p>
                  {a.status === "pending" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => updateApplicantStatus(a.id, "in_review")}
                        className="rounded-full bg-[#F5E400] px-4 py-1.5 text-xs font-semibold text-black"
                      >
                        Accept for Review
                      </button>
                      <button
                        type="button"
                        onClick={() => updateApplicantStatus(a.id, "rejected")}
                        className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {a.status === "in_review" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => updateApplicantStatus(a.id, "interview")}
                        className="rounded-full bg-[#F5E400] px-4 py-1.5 text-xs font-semibold text-black"
                      >
                        Schedule Interview
                      </button>
                      <button
                        type="button"
                        onClick={() => updateApplicantStatus(a.id, "hired")}
                        className="rounded-full bg-[#FF0A78] px-4 py-1.5 text-xs font-semibold text-white"
                      >
                        Hire
                      </button>
                      <button
                        type="button"
                        onClick={() => updateApplicantStatus(a.id, "rejected")}
                        className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                  {a.status === "interview" && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => updateApplicantStatus(a.id, "hired")}
                        className="rounded-full bg-[#FF0A78] px-4 py-1.5 text-xs font-semibold text-white"
                      >
                        Hire
                      </button>
                      <button
                        type="button"
                        onClick={() => updateApplicantStatus(a.id, "rejected")}
                        className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
