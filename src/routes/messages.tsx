import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Paperclip, Phone, Search, Send, Smile, Video } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/site/AppShell";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages — HustleBridge" }, { name: "description", content: "Chat with clients." }] }),
  component: Messages,
});

const convos = [
  { id: 1, n: "TechLearn Academy", l: "It looks great!", t: "2m", on: true },
  { id: 2, n: "DesignHub", l: "Project discussion", t: "1h", on: true },
  { id: 3, n: "Creative Studio", l: "Thanks!", t: "3h", on: false },
  { id: 4, n: "Rohan Mehta", l: "Shared a file", t: "1d", on: false },
  { id: 5, n: "CodeCraft", l: "Let's connect", t: "2d", on: true },
];

const msgs = [
  { m: "Hi Arjun, we reviewed your proposal.", me: false, t: "10:12 AM" },
  { m: "It looks great!", me: false, t: "10:12 AM" },
  { m: "Thank you! I'm excited about this opportunity.", me: true, t: "10:31 AM" },
  { m: "Can we discuss the project requirements?", me: false, t: "10:32 AM" },
  { m: "Sure! When would be a good time for you?", me: true, t: "10:37 AM" },
];

function Messages() {
  const [active, setActive] = useState(1);
  return (
    <AppShell title="Messages">
      <div className="grid h-[calc(100vh-12rem)] gap-4 overflow-hidden rounded-3xl glass-strong lg:grid-cols-[320px_1fr]">
        <aside className="border-r border-white/5 p-4">
          <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
            <Search className="h-4 w-4 text-white/40" />
            <input placeholder="Search messages..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40" />
          </div>
          <div className="mt-4 space-y-1 overflow-y-auto">
            {convos.map((c) => (
              <button key={c.id} onClick={() => setActive(c.id)} className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${active === c.id ? "bg-white/10" : "hover:bg-white/5"}`}>
                <div className="relative">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#F5E400] to-[#FF0A78] font-bold text-black">{c.n[0]}</div>
                  {c.on && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#050505] bg-[#F5E400]" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between"><span className="truncate text-sm font-semibold">{c.n}</span><span className="text-[10px] text-white/40">{c.t}</span></div>
                  <div className="truncate text-xs text-white/50">{c.l}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>
        <section className="flex flex-col">
          <div className="flex items-center justify-between border-b border-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#F5E400] to-[#FF0A78] font-bold text-black">T</div>
              <div>
                <div className="font-semibold">TechLearn Academy</div>
                <div className="text-xs text-[#F5E400]">Active now</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="grid h-9 w-9 place-items-center rounded-full glass"><Phone className="h-4 w-4" /></button>
              <button className="grid h-9 w-9 place-items-center rounded-full glass"><Video className="h-4 w-4" /></button>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-6">
            {msgs.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`flex ${m.me ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${m.me ? "bg-[#F5E400] text-black rounded-br-md" : "bg-white/[0.06] rounded-bl-md"}`}>
                  {m.m}
                  <div className={`mt-1 text-[10px] ${m.me ? "text-black/60" : "text-white/40"}`}>{m.t}</div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="border-t border-white/5 p-4">
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2">
              <button className="text-white/50 hover:text-[#F5E400]"><Paperclip className="h-4 w-4" /></button>
              <input placeholder="Type a message…" className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-white/40" />
              <button className="text-white/50 hover:text-[#F5E400]"><Smile className="h-4 w-4" /></button>
              <button className="grid h-9 w-9 place-items-center rounded-full bg-[#FF0A78] text-white glow-pink"><Send className="h-4 w-4" /></button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}