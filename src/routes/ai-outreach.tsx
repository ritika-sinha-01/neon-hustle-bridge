import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Copy, RefreshCcw, Sparkles, Wand2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/site/AppShell";
import { apiClient } from "@/lib/api/client";
import { requireAuth } from "@/lib/require-auth";

export const Route = createFileRoute("/ai-outreach")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [
      { title: "AI Outreach — HustleBridge" },
      { name: "description", content: "Generate winning proposals with AI." },
    ],
  }),
  component: AIOutreach,
});

const tabs = [
  { label: "Cold Email", type: "cold_email" as const },
  { label: "LinkedIn Message", type: "linkedin" as const },
  { label: "WhatsApp Message", type: "whatsapp" as const },
];

interface Opportunity {
  id: string;
  title: string;
  companyName?: string;
}

function AIOutreach() {
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [opportunityId, setOpportunityId] = useState("");
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingOpps, setLoadingOpps] = useState(true);
  const [error, setError] = useState("");
  const [copyDone, setCopyDone] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiClient.get<Opportunity[] | { opportunities: Opportunity[] }>(
          "/opportunities?limit=50",
        );
        const list = Array.isArray(data) ? data : data.opportunities ?? [];
        setOpportunities(list);
        if (list.length > 0) setOpportunityId(list[0].id);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load opportunities");
      } finally {
        setLoadingOpps(false);
      }
    };
    load();
  }, []);

  const handleGenerate = async () => {
    if (!opportunityId) {
      setError("Please select an opportunity.");
      return;
    }

    setLoading(true);
    setError("");
    setCopyDone(false);

    try {
      const data = await apiClient.post<{ generatedText?: string }>("/ai/generate-outreach", {
        opportunityId,
        type: activeTab.type,
      });
      setGeneratedMessage(data.generatedText || "");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate message");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedMessage) return;
    try {
      await navigator.clipboard.writeText(generatedMessage);
      setCopyDone(true);
      setTimeout(() => setCopyDone(false), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  };

  return (
    <AppShell title="AI Outreach Generator">
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="rounded-3xl glass-strong p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Sparkles className="h-4 w-4 text-[#F5E400]" /> Select Opportunity
          </h2>
          <p className="mt-2 text-sm text-white/60">
            Pick a marketplace listing to generate a tailored outreach message.
          </p>

          {loadingOpps ? (
            <p className="mt-4 text-sm text-white/60">Loading opportunities...</p>
          ) : (
            <select
              value={opportunityId}
              onChange={(e) => setOpportunityId(e.target.value)}
              className="mt-4 w-full rounded-xl bg-white/[0.04] px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#F5E400]/40"
            >
              {opportunities.length === 0 ? (
                <option value="">No opportunities available</option>
              ) : (
                opportunities.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title}
                    {o.companyName ? ` — ${o.companyName}` : ""}
                  </option>
                ))
              )}
            </select>
          )}

          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !opportunityId}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#F5E400] py-3 font-semibold text-black glow-yellow transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Wand2 className="h-4 w-4" /> {loading ? "Generating..." : "Generate Message"}
          </button>
        </div>

        <div className="rounded-3xl glass-strong p-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t.type}
                type="button"
                onClick={() => setActiveTab(t)}
                className={`rounded-full px-4 py-1.5 text-sm transition ${
                  activeTab.type === t.type
                    ? "bg-[#F5E400] font-semibold text-black"
                    : "bg-white/5 text-white/70"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <motion.div
            key={activeTab.type + generatedMessage.slice(0, 20)}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-2xl bg-white/[0.03] p-6 text-sm leading-relaxed text-white/85"
          >
            {generatedMessage ? (
              <div className="whitespace-pre-wrap">{generatedMessage}</div>
            ) : (
              <div className="text-white/50">
                Select an opportunity and click Generate Message to create AI-powered outreach.
              </div>
            )}
          </motion.div>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleCopy}
              disabled={!generatedMessage}
              className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm disabled:opacity-40"
            >
              <Copy className="h-4 w-4" /> {copyDone ? "Copied!" : "Copy"}
            </button>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || !opportunityId}
              className="inline-flex items-center gap-2 rounded-full bg-[#FF0A78] px-4 py-2 text-sm font-semibold text-white glow-pink disabled:opacity-40"
            >
              <RefreshCcw className="h-4 w-4" /> Regenerate
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
