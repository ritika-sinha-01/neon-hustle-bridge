import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Clock, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/site/AppShell";
import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api/client";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities — HustleBridge" },
      { name: "description", content: "Browse verified opportunities." },
    ],
  }),
  component: Marketplace,
});

interface Opportunity {
  id: string;
  title: string;
  category: string;
  budgetMin: number;
  budgetMax: number;
  workMode: string;
  applicationCount: number;
  createdAt: string;
  skillsRequired?: string[];
  isDemo?: boolean;
}

function formatBudget(min: number, max: number) {
  return `₹${min.toLocaleString("en-IN")} – ₹${max.toLocaleString("en-IN")}`;
}

function Marketplace() {
  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const data = await apiClient.get<Opportunity[] | { opportunities: Opportunity[] }>(
          "/opportunities?limit=50",
        );
        const list = Array.isArray(data) ? data : data.opportunities ?? [];
        setOpps(list);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load opportunities");
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  const categories = useMemo(() => {
    const unique = [...new Set(opps.map((o) => o.category).filter(Boolean))].sort();
    return ["All", ...unique];
  }, [opps]);

  const filteredOpps = useMemo(() => {
    return opps.filter((o) => {
      const matchesCategory = active === "All" || o.category === active;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        o.title.toLowerCase().includes(query) ||
        o.category.toLowerCase().includes(query) ||
        o.skillsRequired?.some((s) => s.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [opps, active, search]);

  return (
    <AppShell title="Opportunity Marketplace">
      <div className="rounded-3xl glass-strong p-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-1 items-center gap-3 rounded-full bg-white/5 px-5 py-3">
            <Search className="h-4 w-4 text-white/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, category, or skill..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                active === c
                  ? "bg-[#F5E400] text-black font-semibold"
                  : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="mt-8 flex flex-col items-center gap-3 py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F5E400] border-t-transparent" />
          <p className="text-sm text-white/60">Loading opportunities...</p>
        </div>
      )}

      {error && (
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
          <div>
            <p className="font-semibold text-red-400">Could not load opportunities</p>
            <p className="mt-1 text-sm text-white/70">{error}</p>
          </div>
        </div>
      )}

      {!loading && !error && filteredOpps.length === 0 && (
        <div className="mt-8 rounded-3xl glass-strong p-10 text-center">
          <p className="text-lg font-semibold">No opportunities found</p>
          <p className="mt-2 text-sm text-white/60">
            {opps.length === 0
              ? "The marketplace is empty. Ask an admin to run the database seed, or check back soon."
              : "Try a different search or category filter."}
          </p>
          {opps.length === 0 && (
            <Link
              to="/register"
              className="mt-6 inline-flex rounded-full bg-[#F5E400] px-6 py-3 text-sm font-semibold text-black"
            >
              Create an account
            </Link>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredOpps.map((o, i) => (
          <motion.div
            key={o.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link to="/opportunities/$id" params={{ id: o.id }} className="block group">
              <div className="rounded-3xl glass-strong p-5 transition hover:-translate-y-1 hover:border-[#F5E400]/40">
                <div className="flex items-start gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FFEA00] font-bold text-black">
                    {o.title?.[0] || "O"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold leading-tight">{o.title}</h3>
                    <div className="mt-1 text-xs text-white/50">{o.category}</div>
                    {o.isDemo && (
                      <span className="mt-1 inline-block rounded-full bg-white/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-white/50">
                        Demo
                      </span>
                    )}
                  </div>
                </div>

                {o.skillsRequired && o.skillsRequired.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {o.skillsRequired.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/60"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-5 flex items-center justify-between">
                  <span className="rounded-full bg-[#F5E400]/10 px-3 py-1 text-xs font-semibold text-[#F5E400]">
                    {formatBudget(o.budgetMin, o.budgetMax)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs capitalize text-white/40">
                    <Clock className="h-3 w-3" /> {o.workMode}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-white/40">
                  <span>{o.applicationCount} applicants</span>
                  <span>
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "Recently"}
                  </span>
                </div>

                <div className="mt-4 w-full rounded-full bg-[#FF0A78] py-2.5 text-center text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">
                  View Details
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </AppShell>
  );
}
