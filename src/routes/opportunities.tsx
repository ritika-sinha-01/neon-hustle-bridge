import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, Bookmark, Clock } from "lucide-react";
import { AppShell } from "@/components/site/AppShell";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/opportunities")({
  head: () => ({
    meta: [
      { title: "Opportunities — HustleBridge" },
      { name: "description", content: "Browse verified opportunities." },
    ],
  }),
  component: Marketplace,
});

const cats = ["All", "Design", "Development", "Writing", "Marketing", "Video & Audio"];

function Marketplace() {
  const [active, setActive] = useState("All");
  const [opps, setOpps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const API_URL =
      import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

    fetch(`${API_URL}/opportunities`)
      .then((res) => res.json())
      .then((result) => {
        const data = result?.data || [];

        const mapped = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          cat: item.category || "General",
          budget: `₹${item.budgetMin || 0} - ₹${item.budgetMax || 0}`,
          time: "Recently",
          color: "#FFEA00",
        }));

        setOpps(mapped);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load opportunities");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredOpps =
    active === "All" ? opps : opps.filter((o) => o.cat === active);

  return (
    <AppShell title="Opportunity Marketplace">
      <div className="rounded-3xl glass-strong p-6">
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-1 items-center gap-3 rounded-full bg-white/5 px-5 py-3">
            <Search className="h-4 w-4 text-white/40" />
            <input
              placeholder="Search opportunities..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
            />
          </div>

          <button className="inline-flex items-center gap-2 rounded-full bg-white/5 px-5 py-3 text-sm hover:bg-white/10">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {cats.map((c) => (
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
        <p className="mt-6 text-sm text-white/60">Loading opportunities...</p>
      )}

      {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

      {!loading && !error && filteredOpps.length === 0 && (
        <p className="mt-6 text-sm text-white/60">No opportunities found.</p>
      )}

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredOpps.map((o, i) => (
          <motion.div
            key={o.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Link
              to="/opportunities/$id"
              params={{ id: o.id }}
              className="block group"
            >
              <div className="rounded-3xl glass-strong p-5 transition hover:-translate-y-1 hover:border-[#F5E400]/40">
                <div className="flex items-start gap-3">
                  <div
                    className="grid h-12 w-12 place-items-center rounded-2xl font-bold text-black"
                    style={{ background: o.color }}
                  >
                    {o.title?.[0] || "O"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold leading-tight">{o.title}</h3>
                    <div className="mt-1 text-xs text-white/50">{o.cat}</div>
                  </div>

                  <Bookmark className="h-4 w-4 text-white/30 hover:text-[#F5E400]" />
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <span className="rounded-full bg-[#F5E400]/10 px-3 py-1 text-xs font-semibold text-[#F5E400]">
                    {o.budget}
                  </span>

                  <span className="inline-flex items-center gap-1 text-xs text-white/40">
                    <Clock className="h-3 w-3" /> {o.time}
                  </span>
                </div>

                <button className="mt-4 w-full rounded-full bg-[#FF0A78] py-2.5 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100">
                  Apply Now
                </button>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </AppShell>
  );
}