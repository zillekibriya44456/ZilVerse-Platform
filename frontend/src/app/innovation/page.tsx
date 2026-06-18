"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Lightbulb, ThumbsUp, ThumbsDown, Users, Plus, Search, Tag, Flame, Clock, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { API_BASE } from "@/utils/api";

interface Idea {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string; // JSON string
  status: string;
  upvotes: number;
  downvotes: number;
  creatorId: string;
  creator: { name: string; avatar?: string };
  createdAt: string;
  teamMembers: { userId: string; role: string; status: string }[];
  userVote?: number; // +1, -1, or 0
}

const CATEGORIES = ["All", "Product", "Startup", "Research", "Social"];
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  OPEN:        { label: "Open",       color: "#22c55e" },
  IN_PROGRESS: { label: "Building",   color: "#f59e0b" },
  BUILT:       { label: "Built!",     color: "#8B5CF6" },
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const d = Math.floor(diff / 86400000);
  return d === 0 ? "Today" : d === 1 ? "Yesterday" : `${d}d ago`;
}

export default function InnovationPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [ideas,    setIdeas]    = useState<Idea[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [cat,      setCat]      = useState("All");
  const [search,   setSearch]   = useState("");
  const [sort,     setSort]     = useState<"hot" | "new">("hot");
  const [showForm, setShowForm] = useState(false);
  const [toast,    setToast]    = useState("");

  // Form state
  const [form, setForm] = useState({ title: "", description: "", category: "Product", tags: "" });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/api/innovation`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setIdeas(Array.isArray(data.data || data) ? (data.data || data) : []);
    } catch { setIdeas([]); } finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchIdeas(); }, [fetchIdeas]);

  const vote = async (ideaId: string, voteVal: number) => {
    if (!token) return showToast("Please log in to vote");
    const res = await fetch(`${API_BASE}/api/innovation/${ideaId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ vote: voteVal }),
    });
    if (res.ok) fetchIdeas();
  };

  const joinTeam = async (ideaId: string) => {
    if (!token) return router.push("/login");
    const res = await fetch(`${API_BASE}/api/innovation/${ideaId}/join-team`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok) {
      showToast("✅ Team join request sent!");
      fetchIdeas();
    } else {
      showToast(data.message || "Already requested");
    }
  };

  const submit = async () => {
    if (!form.title || !form.description) return showToast("Please fill in title and description");
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/innovation`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, tags: form.tags.split(",").map(t => t.trim()).filter(Boolean) }),
      });
      if (res.ok) {
        showToast("🚀 Idea submitted! Community can now vote and join.");
        setShowForm(false);
        setForm({ title: "", description: "", category: "Product", tags: "" });
        fetchIdeas();
      }
    } finally { setSubmitting(false); }
  };

  const filtered = ideas
    .filter(i => {
      const matchCat    = cat === "All" || i.category === cat;
      const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => sort === "hot"
      ? (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes)
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", paddingTop: "7rem" }}>
      {toast && (
        <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "0.85rem 1.5rem", color: "#e4e4e7", fontWeight: 600, fontSize: "0.88rem", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 1.5rem 4rem" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", padding: "0.4rem 1rem", borderRadius: 999, fontSize: "0.78rem", color: "#f59e0b", fontWeight: 700, marginBottom: "1rem" }}>
            <Lightbulb size={13} /> Innovation Hub
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, color: "#f4f4f5", marginBottom: "0.75rem" }}>
            Where Ideas Become Reality
          </h1>
          <p style={{ color: "#71717a", fontSize: "1rem", maxWidth: 500, margin: "0 auto 1.5rem" }}>
            Submit your startup idea, vote on the best ones, and build teams to bring them to life.
          </p>
          <button onClick={() => { if (!user) { router.push("/login"); return; } setShowForm(s => !s); }} style={{ padding: "0.85rem 2rem", borderRadius: 12, border: "none", background: "linear-gradient(135deg, #8B5CF6, #F59E0B)", color: "#fff", fontFamily: "inherit", fontWeight: 800, fontSize: "0.95rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <Plus size={16} /> Submit Your Idea
          </button>
        </div>

        {/* Submit Form */}
        {showForm && (
          <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(139,92,246,0.2)", borderRadius: 18, padding: "2rem", marginBottom: "2rem" }}>
            <h3 style={{ color: "#f4f4f5", fontWeight: 800, marginBottom: "1.25rem", fontSize: "1rem" }}>💡 Submit Your Idea</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Idea title *" style={{ padding: "0.75rem 1rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#e4e4e7", fontFamily: "inherit", fontSize: "0.9rem", outline: "none" }} />
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe your idea in detail *" rows={4} style={{ padding: "0.75rem 1rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#e4e4e7", fontFamily: "inherit", fontSize: "0.9rem", outline: "none", resize: "vertical" }} />
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ flex: 1, minWidth: 150, padding: "0.75rem 1rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#e4e4e7", fontFamily: "inherit", fontSize: "0.85rem", outline: "none" }}>
                  {["Product", "Startup", "Research", "Social"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="Tags (comma separated)" style={{ flex: 2, padding: "0.75rem 1rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#e4e4e7", fontFamily: "inherit", fontSize: "0.85rem", outline: "none" }} />
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={submit} disabled={submitting} style={{ flex: 1, padding: "0.85rem", borderRadius: 10, border: "none", background: "var(--primary)", color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>
                  {submitting ? "Submitting…" : "🚀 Submit Idea"}
                </button>
                <button onClick={() => setShowForm(false)} style={{ padding: "0.85rem 1.25rem", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)", background: "transparent", color: "#71717a", fontFamily: "inherit", cursor: "pointer" }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#52525b" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ideas…" style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: "0.6rem", paddingBottom: "0.6rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#e4e4e7", fontFamily: "inherit", fontSize: "0.82rem", outline: "none", boxSizing: "border-box" }} />
          </div>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{ padding: "0.4rem 0.85rem", borderRadius: 999, border: `1px solid ${cat === c ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.07)"}`, background: cat === c ? "rgba(245,158,11,0.12)" : "transparent", color: cat === c ? "#f59e0b" : "#71717a", cursor: "pointer", fontSize: "0.73rem", fontWeight: 700, fontFamily: "inherit" }}>{c}</button>
          ))}
          <div style={{ display: "flex", gap: "0.3rem" }}>
            <button onClick={() => setSort("hot")} style={{ padding: "0.4rem 0.75rem", borderRadius: 8, border: "none", background: sort === "hot" ? "rgba(239,68,68,0.12)" : "transparent", color: sort === "hot" ? "#ef4444" : "#52525b", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: "0.72rem", display: "flex", alignItems: "center", gap: 4 }}><Flame size={12} /> Hot</button>
            <button onClick={() => setSort("new")} style={{ padding: "0.4rem 0.75rem", borderRadius: 8, border: "none", background: sort === "new" ? "rgba(59,130,246,0.12)" : "transparent", color: sort === "new" ? "#3b82f6" : "#52525b", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: "0.72rem", display: "flex", alignItems: "center", gap: 4 }}><Clock size={12} /> New</button>
          </div>
        </div>

        {/* Ideas list */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 160, borderRadius: 16, background: "rgba(255,255,255,0.03)", animation: "pulse 1.5s ease-in-out infinite" }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#52525b" }}>
            <Lightbulb size={36} style={{ marginBottom: 12, color: "#27272a" }} />
            <div>No ideas yet. Be the first to submit one!</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filtered.map(idea => {
              const tags     = (() => { try { return JSON.parse(idea.tags) as string[]; } catch { return []; } })();
              const status   = STATUS_LABELS[idea.status] || { label: idea.status, color: "#71717a" };
              const netVotes = idea.upvotes - idea.downvotes;
              const alreadyRequested = idea.teamMembers?.some(m => m.userId === user?.id);

              return (
                <div key={idea.id} style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 16, padding: "1.5rem",
                  display: "flex", gap: "1rem",
                  transition: "border-color 0.15s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(245,158,11,0.2)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"; }}
                >
                  {/* Vote column */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.35rem", minWidth: 48 }}>
                    <button onClick={() => vote(idea.id, 1)} style={{ padding: "0.35rem", background: "none", border: "none", color: "#22c55e", cursor: "pointer", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ThumbsUp size={16} />
                    </button>
                    <span style={{ fontWeight: 900, fontSize: "1rem", color: netVotes > 0 ? "#22c55e" : netVotes < 0 ? "#ef4444" : "#71717a" }}>
                      {netVotes >= 0 ? "+" : ""}{netVotes}
                    </span>
                    <button onClick={() => vote(idea.id, -1)} style={{ padding: "0.35rem", background: "none", border: "none", color: "#ef4444", cursor: "pointer", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <ThumbsDown size={16} />
                    </button>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#f4f4f5", lineHeight: 1.3 }}>{idea.title}</h3>
                      <span style={{ fontSize: "0.65rem", background: `${status.color}18`, color: status.color, padding: "3px 10px", borderRadius: 999, fontWeight: 800, flexShrink: 0 }}>
                        {status.label}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.82rem", color: "#a1a1aa", lineHeight: 1.5, marginBottom: "0.75rem" }}>
                      {idea.description.slice(0, 200)}{idea.description.length > 200 ? "…" : ""}
                    </p>

                    {/* Tags */}
                    {tags.length > 0 && (
                      <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
                        {tags.map(tag => (
                          <span key={tag} style={{ fontSize: "0.65rem", background: "rgba(139,92,246,0.1)", color: "#a855f7", padding: "2px 8px", borderRadius: 999, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                            <Tag size={9} />{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.72rem", color: "#52525b" }}>
                        {idea.creator?.avatar ? (
                          <img src={idea.creator.avatar} alt="" style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem", color: "#a855f7", fontWeight: 700 }}>
                            {idea.creator?.name?.[0] || "?"}
                          </div>
                        )}
                        <span>{idea.creator?.name}</span>
                        <span>·</span>
                        <span>{timeAgo(idea.createdAt)}</span>
                        <span>·</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Users size={11} />{idea.teamMembers?.length || 0} builders</span>
                      </div>

                      {user?.id !== idea.creatorId && (
                        <button onClick={() => joinTeam(idea.id)} disabled={alreadyRequested} style={{
                          padding: "0.4rem 0.85rem", borderRadius: 8,
                          border: `1px solid ${alreadyRequested ? "rgba(255,255,255,0.06)" : "rgba(245,158,11,0.3)"}`,
                          background: alreadyRequested ? "transparent" : "rgba(245,158,11,0.08)",
                          color: alreadyRequested ? "#3f3f46" : "#f59e0b",
                          cursor: alreadyRequested ? "default" : "pointer",
                          fontFamily: "inherit", fontWeight: 700, fontSize: "0.72rem",
                          display: "flex", alignItems: "center", gap: 4,
                        }}>
                          <Users size={11} /> {alreadyRequested ? "Requested" : "Join Team"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:0.5}50%{opacity:1}}`}</style>
    </div>
  );
}
