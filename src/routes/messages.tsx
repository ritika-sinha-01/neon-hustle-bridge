import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Search, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/site/AppShell";
import { apiClient } from "@/lib/api/client";
import { requireAuth } from "@/lib/require-auth";
import { getStoredUser } from "@/lib/auth";

export const Route = createFileRoute("/messages")({
  beforeLoad: requireAuth,
  head: () => ({
    meta: [{ title: "Messages — HustleBridge" }, { name: "description", content: "Chat with clients." }],
  }),
  component: Messages,
});

function Messages() {
  const currentUser = getStoredUser();
  const currentUserId = currentUser?.id;

  const [active, setActive] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadConversations = async () => {
    try {
      const data = await apiClient.get<any>("/messages/conversations");
      const list = Array.isArray(data) ? data : data.conversations ?? [];
      setConversations(list);
      if (list.length > 0 && !active) setActive(list[0].id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!active) return;

    const fetchMessages = async () => {
      try {
        const data = await apiClient.get<any>(`/messages/conversations/${active}`);
        setMessages(data.messages ?? []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load messages");
      }
    };

    fetchMessages();
  }, [active]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || !active || sending) return;

    setSending(true);
    setError("");
    try {
      const msg = await apiClient.post<any>(`/messages/conversations/${active}/messages`, {
        content,
      });
      setMessages((prev) => [...prev, msg]);
      setDraft("");
      await loadConversations();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find((c) => c.id === active);
  const otherParticipant = activeConv?.participants?.find(
    (p: any) => p.userId !== currentUserId,
  );

  return (
    <AppShell title="Messages">
      <div className="grid h-[calc(100vh-12rem)] gap-4 overflow-hidden rounded-3xl glass-strong lg:grid-cols-[320px_1fr]">
        <aside className="border-r border-white/5 p-4">
          <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-2">
            <Search className="h-4 w-4 text-white/40" />
            <input
              placeholder="Search messages..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-white/40"
            />
          </div>
          {loading && <p className="mt-4 text-sm text-white/60">Loading conversations...</p>}
          {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          {!loading && conversations.length === 0 && (
            <p className="mt-4 text-sm text-white/60">
              No conversations yet. Apply to opportunities or receive applications to start
              messaging.
            </p>
          )}
          <div className="mt-4 space-y-1 overflow-y-auto">
            {conversations.map((c: any) => {
              const other = c.participants?.find((p: any) => p.userId !== currentUserId);
              const name = other?.fullName || "Unknown";
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActive(c.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                    active === c.id ? "bg-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#F5E400] to-[#FF0A78] font-bold text-black">
                    {name?.[0] || "U"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{name}</div>
                    <div className="truncate text-xs text-white/50">
                      {c.lastMessage || "No messages yet"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex flex-col">
          <div className="flex items-center gap-3 border-b border-white/5 p-4">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#F5E400] to-[#FF0A78] font-bold text-black">
              {otherParticipant?.fullName?.[0] || "?"}
            </div>
            <div>
              <div className="font-semibold">
                {otherParticipant?.fullName || "Select a conversation"}
              </div>
              <div className="text-xs text-white/50">
                {otherParticipant?.isOnline ? "Active now" : "Offline"}
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-6">
            {messages.map((m: any, i: number) => {
              const isFromSelf = m.senderId === currentUserId;
              return (
                <motion.div
                  key={m.id || i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isFromSelf ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm ${
                      isFromSelf
                        ? "rounded-br-md bg-[#F5E400] text-black"
                        : "rounded-bl-md bg-white/[0.06]"
                    }`}
                  >
                    {m.content}
                    <div
                      className={`mt-1 text-[10px] ${isFromSelf ? "text-black/60" : "text-white/40"}`}
                    >
                      {m.createdAt ? new Date(m.createdAt).toLocaleTimeString() : ""}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="border-t border-white/5 p-4">
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={active ? "Type a message…" : "Select a conversation first"}
                disabled={!active || sending}
                className="flex-1 bg-transparent px-2 text-sm outline-none placeholder:text-white/40 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!active || sending || !draft.trim()}
                className="grid h-9 w-9 place-items-center rounded-full bg-[#FF0A78] text-white glow-pink disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
