"use client";
import { API_BASE } from "@/utils/api";
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import styles from "./discussions.module.css";
import { useAuth } from "@/context/AuthContext";
import {
  MessageSquare, ThumbsUp, Clock, Search, Plus, Send,
  ChevronUp, Tag, Users, TrendingUp, X
} from "lucide-react";

const CATEGORIES = ["All", "General", "Frontend", "Backend", "System Design", "DevOps", "AI / ML", "Career", "Open Source"];

const CATEGORY_COLORS: Record<string, string> = {
  General: "#a855f7", Frontend: "#3b82f6", Backend: "#10b981",
  "System Design": "#f59e0b", DevOps: "#06b6d4", "AI / ML": "#ec4899",
  Career: "#8b5cf6", "Open Source": "#22c55e"
};

function timeAgo(dateStr: string) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function PostSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
            <div className="skeleton" style={{ width: 80, height: 22, borderRadius: 99 }} />
            <div className="skeleton" style={{ width: 50, height: 18, borderRadius: 6 }} />
          </div>
          <div className="skeleton skeleton-text" style={{ width: "80%", marginBottom: "0.5rem" }} />
          <div className="skeleton skeleton-text" style={{ width: "60%" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="skeleton" style={{ width: 120, height: 20, borderRadius: 6 }} />
            <div className="skeleton" style={{ width: 80, height: 32, borderRadius: 8 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.8rem 1rem",
  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "10px", color: "#e4e4e7", fontSize: "0.9rem", outline: "none",
};

export default function DiscussionsPage() {
  const { user, token } = useAuth();
  const [dbPosts, setDbPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: "", content: "", category: "General" });
  const [isPosting, setIsPosting] = useState(false);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPosts = useCallback(() => {
    setLoading(true);
    axios.get(`${API_BASE}/api/discussions`)
      .then(res => setDbPosts(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // Client-side filter (discussions are light enough)
  const filtered = dbPosts.filter(p => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q || p.title?.toLowerCase().includes(q) || p.content?.toLowerCase().includes(q) || p.author?.name?.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const handlePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      showToast("Please fill in the title and content.", false); return;
    }
    const activeToken = token || localStorage.getItem("zilverse_token") || "";
    if (!activeToken) { showToast("Please log in to post.", false); return; }
    setIsPosting(true);
    try {
      await axios.post(`${API_BASE}/api/discussions/create`, newPost, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      setIsModalOpen(false);
      setNewPost({ title: "", content: "", category: "General" });
      showToast("Discussion posted! 🎉");
      fetchPosts();
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed to post discussion.", false);
    } finally {
      setIsPosting(false);
    }
  };

  const handleReplySubmit = async (postId: string) => {
    if (!replyContent.trim()) return;
    const activeToken = token || localStorage.getItem("zilverse_token") || "";
    if (!activeToken) { showToast("Please log in to reply.", false); return; }
    setIsReplying(true);
    try {
      await axios.post(`${API_BASE}/api/discussions/reply`, { postId, content: replyContent }, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      setReplyingToId(null);
      setReplyContent("");
      showToast("Reply posted!");
      fetchPosts();
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed to reply.", false);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 88, right: 20, zIndex: 9999999,
          padding: "0.85rem 1.25rem", borderRadius: 12, fontWeight: 600, fontSize: "0.875rem",
          background: toast.ok ? "rgba(16,185,129,0.95)" : "rgba(239,68,68,0.95)",
          color: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", backdropFilter: "blur(12px)",
          animation: "fadeInUp 0.3s ease", border: `1px solid ${toast.ok ? "rgba(16,185,129,0.4)" : "rgba(239,68,68,0.4)"}`,
        }}>
          {toast.msg}
        </div>
      )}

      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 99, padding: "0.35rem 1rem", marginBottom: "1rem", fontSize: "0.8rem", color: "#60a5fa", fontWeight: 600 }}>
            <MessageSquare size={13} /> {dbPosts.length > 0 ? `${dbPosts.length} Discussions` : "Global Forums"}
          </div>
          <h1 className={styles.title}>Developer Discussions</h1>
          <p className={styles.subtitle}>
            Ask questions, share knowledge, and debate tech trends with engineers worldwide.
          </p>

          {/* Search + CTA row */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
              <Search size={15} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#71717a", pointerEvents: "none" }} />
              <input
                type="text"
                placeholder="Search discussions..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: "2.5rem", background: "rgba(255,255,255,0.04)" }}
              />
            </div>
            <button
              className="btn btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", whiteSpace: "nowrap" }}
              onClick={() => setIsModalOpen(true)}
            >
              <Plus size={16} /> Start Discussion
            </button>
          </div>
        </div>

        {/* Category tabs */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                padding: "0.4rem 1rem", borderRadius: 99, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                background: activeCategory === cat ? `rgba(${cat === "All" ? "168,85,247" : "59,130,246"},0.2)` : "rgba(255,255,255,0.04)",
                border: `1px solid ${activeCategory === cat ? (cat === "All" ? "rgba(168,85,247,0.4)" : "rgba(59,130,246,0.4)") : "rgba(255,255,255,0.08)"}`,
                color: activeCategory === cat ? (cat === "All" ? "#c084fc" : "#60a5fa") : "#a1a1aa",
                transition: "all 0.2s",
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Stats bar */}
        {!loading && dbPosts.length > 0 && (
          <div style={{ display: "flex", gap: "1.5rem", marginBottom: "1.5rem", fontSize: "0.8rem", color: "#71717a" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <TrendingUp size={13} /> {filtered.length} thread{filtered.length !== 1 ? "s" : ""} {activeCategory !== "All" || search ? "found" : "total"}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Users size={13} /> {new Set(dbPosts.map(p => p.author?.name).filter(Boolean)).size} contributors
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <MessageSquare size={13} /> {dbPosts.reduce((acc, p) => acc + (p.replies?.length || 0), 0)} replies
            </span>
          </div>
        )}

        {/* Posts list */}
        {loading ? <PostSkeleton /> : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "#52525b" }}>
            <MessageSquare size={48} style={{ marginBottom: "1rem", opacity: 0.3 }} />
            <p style={{ marginBottom: "1rem" }}>
              {search ? `No discussions matching "${search}"` : "No discussions yet. Be the first!"}
            </p>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <Plus size={15} /> Start the First Discussion
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {filtered.map((post: any) => {
              const catColor = CATEGORY_COLORS[post.category] || "#a855f7";
              return (
                <div key={post.id} className="glass-panel" style={{ borderRadius: 14, padding: "1.25rem 1.5rem", transition: "border-color 0.2s" }}
                  onMouseOver={e => (e.currentTarget as HTMLElement).style.borderColor = `${catColor}40`}
                  onMouseOut={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)"}
                >
                  {/* Top row */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", marginBottom: "0.75rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem", borderRadius: 99, background: `${catColor}18`, color: catColor, border: `1px solid ${catColor}30`, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                        {post.category || "General"}
                      </span>
                      {post.replies?.length > 0 && (
                        <span style={{ fontSize: "0.72rem", color: "#71717a", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <MessageSquare size={11} /> {post.replies.length} {post.replies.length === 1 ? "reply" : "replies"}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.72rem", color: "#71717a", flexShrink: 0 }}>
                      <Clock size={11} />
                      {post.createdAt ? timeAgo(post.createdAt) : "Just now"}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#e4e4e7", marginBottom: "0.5rem", lineHeight: 1.4 }}>
                    {post.title}
                  </h3>

                  {/* Content preview */}
                  <p style={{ fontSize: "0.875rem", color: "#a1a1aa", lineHeight: 1.65, marginBottom: "1rem",
                    display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {post.content}
                  </p>

                  {/* Replies */}
                  {post.replies?.length > 0 && (
                    <div style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "0.75rem 1rem", marginBottom: "0.75rem", borderLeft: `3px solid ${catColor}50` }}>
                      {post.replies.slice(0, 2).map((reply: any, i: number) => (
                        <div key={i} style={{ marginBottom: i < post.replies.slice(0, 2).length - 1 ? "0.6rem" : 0 }}>
                          <p style={{ fontSize: "0.82rem", color: "#d4d4d8", marginBottom: "0.15rem" }}>{reply.content}</p>
                          <span style={{ fontSize: "0.7rem", color: "#71717a" }}>— {reply.author?.name || "Anonymous"}</span>
                        </div>
                      ))}
                      {post.replies.length > 2 && (
                        <p style={{ fontSize: "0.7rem", color: "#52525b", marginTop: "0.4rem" }}>+{post.replies.length - 2} more replies</p>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      {/* Author */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <img
                          src={post.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || "U")}&background=3b82f6&color=fff&size=32`}
                          alt={post.author?.name}
                          style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover" }}
                          onError={e => { e.currentTarget.src = `https://ui-avatars.com/api/?name=U&background=3b82f6&color=fff&size=32`; }}
                        />
                        <span style={{ fontSize: "0.78rem", color: "#a1a1aa" }}>
                          <strong style={{ color: "#d4d4d8" }}>{post.author?.name || "Anonymous"}</strong>
                        </span>
                      </div>
                      {/* Upvotes */}
                      <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.78rem", color: "#71717a" }}>
                        <ChevronUp size={13} /> {post.upvotes || 0}
                      </span>
                    </div>

                    <button
                      onClick={() => { setReplyingToId(replyingToId === post.id ? null : post.id); setReplyContent(""); }}
                      style={{
                        display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", fontWeight: 600,
                        padding: "0.4rem 0.85rem", borderRadius: 8, cursor: "pointer",
                        background: replyingToId === post.id ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.12)",
                        border: replyingToId === post.id ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(59,130,246,0.25)",
                        color: replyingToId === post.id ? "#f87171" : "#60a5fa",
                      }}
                    >
                      {replyingToId === post.id ? <><X size={13} /> Cancel</> : <><Send size={13} /> Reply</>}
                    </button>
                  </div>

                  {/* Reply form */}
                  {replyingToId === post.id && (
                    <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem" }}>
                      <input
                        type="text"
                        placeholder="Write a thoughtful reply..."
                        value={replyContent}
                        onChange={e => setReplyContent(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReplySubmit(String(post.id)); } }}
                        style={{ flex: 1, padding: "0.65rem 0.9rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e4e4e7", borderRadius: 8, fontSize: "0.875rem", outline: "none" }}
                        autoFocus
                      />
                      <button
                        onClick={() => handleReplySubmit(String(post.id))}
                        disabled={isReplying || !replyContent.trim()}
                        style={{ padding: "0.65rem 1.1rem", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: "0.85rem", opacity: isReplying || !replyContent.trim() ? 0.6 : 1, display: "flex", alignItems: "center", gap: "0.35rem" }}
                      >
                        {isReplying ? "..." : <><Send size={14} /> Post</>}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Discussion Modal */}
      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}
          onClick={() => setIsModalOpen(false)}>
          <div style={{ background: "rgba(12,12,16,0.98)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.08)", padding: "2rem", width: "90%", maxWidth: 520, backdropFilter: "blur(30px)", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ color: "#e4e4e7", fontSize: "1.2rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <MessageSquare size={20} color="#3b82f6" /> Start a Discussion
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              <div>
                <label style={{ fontSize: "0.78rem", color: "#a1a1aa", display: "block", marginBottom: "0.4rem", fontWeight: 600 }}>Title *</label>
                <input type="text" placeholder="What's your question or topic?" value={newPost.title}
                  onChange={e => setNewPost({ ...newPost, title: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", color: "#a1a1aa", display: "block", marginBottom: "0.4rem", fontWeight: 600 }}>Category</label>
                <select value={newPost.category} onChange={e => setNewPost({ ...newPost, category: e.target.value })} style={inputStyle}>
                  {CATEGORIES.filter(c => c !== "All").map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: "0.78rem", color: "#a1a1aa", display: "block", marginBottom: "0.4rem", fontWeight: 600 }}>Content *</label>
                <textarea placeholder="Describe your question or share your thoughts in detail..." value={newPost.content}
                  onChange={e => setNewPost({ ...newPost, content: e.target.value })} rows={5}
                  style={{ ...inputStyle, resize: "vertical", minHeight: 100 }} />
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              <button onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: "0.85rem", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#a1a1aa", borderRadius: 12, cursor: "pointer", fontWeight: 600 }}>Cancel</button>
              <button onClick={handlePost} disabled={isPosting || !newPost.title.trim() || !newPost.content.trim()}
                style={{ flex: 2, padding: "0.85rem", background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", border: "none", color: "#fff", borderRadius: 12, cursor: "pointer", fontWeight: 700, opacity: isPosting ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                {isPosting ? "Posting..." : <><Send size={15} /> Post Discussion</>}
              </button>
            </div>
            {!user && <p style={{ color: "#52525b", fontSize: "0.75rem", textAlign: "center", marginTop: "0.75rem" }}>You need to be logged in to post.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
