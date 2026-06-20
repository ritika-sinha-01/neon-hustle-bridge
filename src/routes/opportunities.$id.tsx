import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Bookmark, Share2, Star, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/site/AppShell";
import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";

export const Route = createFileRoute("/opportunities/$id")({
  head: () => ({ meta: [{ title: "Opportunity — HustleBridge" }, { name: "description", content: "Opportunity details and apply." }] }),
  component: OppDetails,
});

function OppDetails() {
  const { id } = Route.useParams();
  const [opportunity, setOpportunity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOpportunity = async () => {
      try {
        const data = await apiClient.get<any>(`/opportunities/${id}`);
        setOpportunity(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load opportunity");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOpportunity();
    }
  }, [id]);

  if (loading) {
    return (
      <AppShell title="Opportunity Details">
        <div className="flex items-center justify-center h-64">
          <p className="text-white/60">Loading opportunity...</p>
        </div>
      </AppShell>
    );
  }

  if (error) {
    return (
      <AppShell title="Opportunity Details">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-400">{error}</p>
        </div>
      </AppShell>
    );
  }

  if (!opportunity) {
    return (
      <AppShell title="Opportunity Details">
        <div className="flex items-center justify-center h-64">
          <p className="text-white/60">Opportunity not found.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Opportunity Details">
      <Link to="/opportunities" className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-[#F5E400]"><ArrowLeft className="h-4 w-4" /> Back to Opportunities</Link>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl glass-strong p-8">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">{opportunity?.title || "Untitled Opportunity"}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#F5E400] to-[#FF0A78] font-bold text-black">{opportunity?.companyName?.[0] || "C"}</div>
              <span className="font-semibold text-white">{opportunity?.companyName || "Company"}</span>
            </div>
            <span>· Posted {opportunity?.createdAt ? new Date(opportunity.createdAt).toLocaleDateString() : "Recently"}</span>
            <span>· {opportunity?.workMode || "Remote"}</span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/[0.03] p-4"><div className="text-xs text-white/50">Budget</div><div className="mt-1 font-bold text-[#F5E400]">₹{opportunity?.budgetMin || 0} - ₹{opportunity?.budgetMax || 0}</div></div>
            <div className="rounded-2xl bg-white/[0.03] p-4"><div className="text-xs text-white/50">Deadline</div><div className="mt-1 font-bold">{opportunity?.deadline ? new Date(opportunity.deadline).toLocaleDateString() : "Flexible"}</div></div>
            <div className="rounded-2xl bg-white/[0.03] p-4"><div className="text-xs text-white/50">Category</div><div className="mt-1 font-bold">{opportunity?.category || "General"}</div></div>
          </div>
          <div className="mt-8 flex flex-wrap gap-2">
            {opportunity?.skillsRequired?.length > 0 ? (
              opportunity.skillsRequired.map((s: string) => (
                <span key={s} className="rounded-full bg-[#F5E400]/10 px-3 py-1.5 text-xs font-semibold text-[#F5E400]">{s}</span>
              ))
            ) : (
              <span className="text-white/60">No skills specified</span>
            )}
          </div>
          <div className="mt-8">
            <h2 className="text-lg font-bold">Project Description</h2>
            <p className="mt-3 text-white/70 leading-relaxed">{opportunity?.description || "No description provided."}</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          <div className="rounded-3xl glass-strong p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">About Client</h3>
            <div className="mt-4 flex items-center gap-3">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#F5E400] to-[#FF0A78] font-bold text-black">{opportunity?.companyName?.[0] || "C"}</div>
              <div><div className="font-bold">{opportunity?.companyName || "Company"}</div><div className="text-xs text-white/50">{opportunity?.category || "General"}</div></div>
            </div>
          </div>
          <div className="rounded-3xl glass-strong p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60">Applications</h3>
            <div className="mt-3 font-display text-3xl font-bold">{opportunity?.applicationCount || 0} <span className="text-base font-normal text-white/40">already applied</span></div>
          </div>
          <button className="w-full rounded-2xl bg-[#FF0A78] py-4 font-bold text-white glow-pink hover:scale-[1.02] transition">Apply Now</button>
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl glass py-3 text-sm font-semibold"><Bookmark className="h-4 w-4" /> Save Opportunity</button>
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-2xl glass py-3 text-sm font-semibold"><Share2 className="h-4 w-4" /> Share</button>
        </motion.div>
      </div>
    </AppShell>
  );
}