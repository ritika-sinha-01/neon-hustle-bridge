import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/site/AppShell";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { getStoredUser, isAuthenticated } from "@/lib/auth";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/opportunities/$id")({
  head: () => ({
    meta: [
      { title: "Opportunity — HustleBridge" },
      { name: "description", content: "Opportunity details and apply." },
    ],
  }),
  component: OppDetails,
});

interface Application {
  id: string;
  opportunityId: string;
  status: string;
}

function OppDetails() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const user = getStoredUser();
  const authed = isAuthenticated();

  const [opportunity, setOpportunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hasApplied, setHasApplied] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const data = await apiClient.get<any>(`/opportunities/${id}`);
        setOpportunity(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load opportunity");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOpportunity();
  }, [id]);

  useEffect(() => {
    const checkApplication = async () => {
      if (!authed || user?.role !== "student") return;
      try {
        const apps = await apiClient.get<Application[]>("/applications?limit=100");
        const list = Array.isArray(apps) ? apps : [];
        setHasApplied(list.some((a) => a.opportunityId === id));
      } catch {
        // Non-fatal — apply attempt will still validate server-side
      }
    };
    checkApplication();
  }, [authed, user?.role, id]);

  const handleApply = async () => {
    if (!coverLetter.trim()) {
      setApplyError("Please write a brief cover letter.");
      return;
    }
    setApplyLoading(true);
    setApplyError("");
    try {
      await apiClient.post("/applications", {
        opportunityId: id,
        coverLetter: coverLetter.trim(),
      });
      setHasApplied(true);
      setApplySuccess(true);
      setApplyOpen(false);
    } catch (err: unknown) {
      setApplyError(err instanceof Error ? err.message : "Failed to submit application");
    } finally {
      setApplyLoading(false);
    }
  };

  const renderApplyAction = () => {
    if (!authed) {
      return (
        <Link
          to="/login"
          className="block w-full rounded-2xl bg-[#FF0A78] py-4 text-center font-bold text-white glow-pink hover:scale-[1.02] transition"
        >
          Login to Apply
        </Link>
      );
    }

    if (user?.role === "client") {
      return (
        <p className="rounded-2xl bg-white/5 px-4 py-3 text-center text-sm text-white/60">
          Client accounts cannot apply to opportunities. Switch to a student account to apply.
        </p>
      );
    }

    if (hasApplied || applySuccess) {
      return (
        <div className="flex items-center justify-center gap-2 rounded-2xl bg-[#F5E400]/10 py-4 font-semibold text-[#F5E400]">
          <CheckCircle2 className="h-5 w-5" />
          Application Submitted
        </div>
      );
    }

    return (
      <button
        onClick={() => setApplyOpen(true)}
        className="w-full rounded-2xl bg-[#FF0A78] py-4 font-bold text-white glow-pink hover:scale-[1.02] transition"
      >
        Apply Now
      </button>
    );
  };

  if (loading) {
    return (
      <AppShell title="Opportunity Details">
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F5E400] border-t-transparent" />
          <p className="text-white/60">Loading opportunity...</p>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Opportunity Details">
        <div className="flex h-64 flex-col items-center justify-center gap-3 px-6 text-center">
          <AlertCircle className="h-8 w-8 text-red-400" />
          <p className="text-red-400">{error}</p>
          <Link to="/opportunities" className="text-sm text-[#F5E400] hover:underline">
            Back to marketplace
          </Link>
        </div>
      </AppShell>
    );
  }

  if (!opportunity) {
    return (
      <AppShell title="Opportunity Details">
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <p className="text-white/60">Opportunity not found.</p>
          <Link to="/opportunities" className="text-sm text-[#F5E400] hover:underline">
            Browse all opportunities
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Opportunity Details">
      <Link
        to="/opportunities"
        className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-[#F5E400]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Opportunities
      </Link>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl glass-strong p-8"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl font-bold sm:text-4xl">
              {opportunity.title}
            </h1>
            {opportunity.isDemo && (
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-wide text-white/50">
                Demo listing
              </span>
            )}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#F5E400] to-[#FF0A78] font-bold text-black">
                {opportunity.companyName?.[0] || "C"}
              </div>
              <span className="font-semibold text-white">
                {opportunity.companyName || "Client"}
              </span>
            </div>
            <span>
              · Posted{" "}
              {opportunity.createdAt
                ? new Date(opportunity.createdAt).toLocaleDateString()
                : "Recently"}
            </span>
            <span className="capitalize">· {opportunity.workMode || "remote"}</span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/[0.03] p-4">
              <div className="text-xs text-white/50">Budget</div>
              <div className="mt-1 font-bold text-[#F5E400]">
                ₹{opportunity.budgetMin?.toLocaleString("en-IN")} – ₹
                {opportunity.budgetMax?.toLocaleString("en-IN")}
              </div>
            </div>
            <div className="rounded-2xl bg-white/[0.03] p-4">
              <div className="text-xs text-white/50">Deadline</div>
              <div className="mt-1 font-bold">
                {opportunity.deadline
                  ? new Date(opportunity.deadline).toLocaleDateString()
                  : "Flexible"}
              </div>
            </div>
            <div className="rounded-2xl bg-white/[0.03] p-4">
              <div className="text-xs text-white/50">Category</div>
              <div className="mt-1 font-bold">{opportunity.category || "General"}</div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {opportunity.skillsRequired?.length > 0 ? (
              opportunity.skillsRequired.map((s: string) => (
                <span
                  key={s}
                  className="rounded-full bg-[#F5E400]/10 px-3 py-1.5 text-xs font-semibold text-[#F5E400]"
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="text-white/60">No skills specified</span>
            )}
          </div>
          <div className="mt-8">
            <h2 className="text-lg font-bold">Project Description</h2>
            <p className="mt-3 leading-relaxed text-white/70">
              {opportunity.description || "No description provided."}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <div className="rounded-3xl glass-strong p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">
              About Client
            </h3>
            <div className="mt-4 flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#F5E400] to-[#FF0A78] font-bold text-black">
                {opportunity.companyName?.[0] || "C"}
              </div>
              <div>
                <div className="font-bold">{opportunity.companyName || "Client"}</div>
                <div className="text-xs text-white/50">{opportunity.category}</div>
              </div>
            </div>
          </div>
          <div className="rounded-3xl glass-strong p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">
              Applications
            </h3>
            <div className="mt-3 font-display text-3xl font-bold">
              {opportunity.applicationCount || 0}{" "}
              <span className="text-base font-normal text-white/40">already applied</span>
            </div>
          </div>
          {renderApplyAction()}
          {applySuccess && (
            <button
              onClick={() => navigate({ to: "/student" })}
              className="w-full rounded-2xl glass py-3 text-sm font-semibold text-[#F5E400]"
            >
              View dashboard
            </button>
          )}
        </motion.div>
      </div>

      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="border-white/10 bg-[#101010] text-white">
          <DialogHeader>
            <DialogTitle>Apply to {opportunity.title}</DialogTitle>
            <DialogDescription className="text-white/60">
              Write a short cover letter explaining why you are a good fit.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Hi, I'm interested in this project because..."
            rows={6}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
          />
          {applyError && <p className="text-sm text-red-400">{applyError}</p>}
          <button
            onClick={handleApply}
            disabled={applyLoading}
            className="w-full rounded-full bg-[#FF0A78] py-3 font-semibold text-white disabled:opacity-50"
          >
            {applyLoading ? "Submitting..." : "Submit Application"}
          </button>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
