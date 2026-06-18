"use client";
import React, { useState, useEffect } from "react";
import { BookOpen, Check, Clock, Award, Search, Filter, ChevronRight, X, TrendingUp, Star } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/utils/api";
import Link from "next/link";

interface Cert {
  id: string;
  title: string;
  provider: string;
  category: string;
  level: string;
  duration?: string;
  description?: string;
  url?: string;
  userProgress?: {
    progress: number;
    status: string;
    completedAt?: string;
  } | null;
}

const CATEGORIES = ["All", "Technology", "Design", "Data", "Marketing", "Cloud", "AI", "Security", "Business"];
const LEVELS     = ["All", "Beginner", "Intermediate", "Advanced"];

const LEVEL_COLOR: Record<string, string> = {
  Beginner:     "#22c55e",
  Intermediate: "#f59e0b",
  Advanced:     "#ef4444",
};

const CAT_ICONS: Record<string, string> = {
  Technology: "⚡", Design: "🎨", Data: "📊", Marketing: "📢",
  Cloud: "☁️", AI: "🤖", Security: "🔒", Business: "💼",
};

export default function CertificationsPage() {
  const { user, token } = useAuth();
  const [certs,   setCerts]   = useState<Cert[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [cat,     setCat]     = useState("All");
  const [level,   setLevel]   = useState("All");
  const [tab,     setTab]     = useState<"browse" | "my">("browse");
  const [toast,   setToast]   = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const fetchCerts = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/api/certifications`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setCerts(Array.isArray(data) ? data : []);
    } catch { setCerts([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchCerts(); }, [token]);

  const enroll = async (id: string) => {
    if (!token) return showToast("Please log in to enroll");
    const res  = await fetch(`${API_BASE}/api/certifications/${id}/enroll`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      showToast("✅ Enrolled! Start learning now.");
      fetchCerts();
    }
  };

  const updateProgress = async (id: string, progress: number) => {
    if (!token) return;
    await fetch(`${API_BASE}/api/certifications/${id}/progress`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ progress }),
    });
    fetchCerts();
  };

  const unenroll = async (id: string) => {
    await fetch(`${API_BASE}/api/certifications/${id}/unenroll`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` },
    });
    showToast("Removed from your certifications");
    fetchCerts();
  };

  const filtered = certs.filter(c => {
    const matchSearch = !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.provider.toLowerCase().includes(search.toLowerCase());
    const matchCat    = cat   === "All" || c.category === cat;
    const matchLevel  = level === "All" || c.level    === level;
    const matchTab    = tab   === "browse" || !!c.userProgress;
    return matchSearch && matchCat && matchLevel && matchTab;
  });

  const myCount       = certs.filter(c => !!c.userProgress).length;
  const completedCount= certs.filter(c => c.userProgress?.status === "COMPLETED").length;
  const inProgress    = certs.filter(c => c.userProgress?.status === "IN_PROGRESS").length;

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", paddingTop: "7rem" }}>
      {toast && (
        <div style={{ position: "fixed", top: 24, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "0.85rem 1.5rem", color: "#e4e4e7", fontWeight: 600, fontSize: "0.88rem", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
          {toast}
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 1.5rem 4rem" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", padding: "0.4rem 1rem", borderRadius: 999, fontSize: "0.78rem", color: "#a855f7", fontWeight: 700, marginBottom: "1rem" }}>
            <Award size={13} /> Certifications & Skills
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 900, color: "#f4f4f5", marginBottom: "0.75rem" }}>
            Level Up Your Career
          </h1>
          <p style={{ color: "#71717a", fontSize: "1rem", maxWidth: 480, margin: "0 auto" }}>
            Earn recognized certifications from ZilVerse Academy. Track your progress and showcase your badges.
          </p>
        </div>

        {/* My Progress Stats */}
        {user && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem", marginBottom: "2rem" }}>
            {[
              { label: "Enrolled",   value: myCount,        color: "#8B5CF6", icon: BookOpen },
              { label: "In Progress",value: inProgress,     color: "#3b82f6", icon: TrendingUp },
              { label: "Completed",  value: completedCount, color: "#22c55e", icon: Award },
            ].map(stat => (
              <div key={stat.label} style={{ background: `${stat.color}0d`, border: `1px solid ${stat.color}25`, borderRadius: 14, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${stat.color}18`, color: stat.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <stat.icon size={16} />
                </div>
                <div>
                  <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#f4f4f5" }}>{stat.value}</div>
                  <div style={{ fontSize: "0.72rem", color: "#71717a" }}>{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0" }}>
          {(["browse", "my"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "0.65rem 1.25rem", border: "none", cursor: "pointer", fontFamily: "inherit",
              background: "transparent",
              color: tab === t ? "var(--primary)" : "#52525b",
              borderBottom: tab === t ? "2px solid var(--primary)" : "2px solid transparent",
              fontWeight: 700, fontSize: "0.85rem", textTransform: "capitalize",
            }}>
              {t === "browse" ? "Browse All" : `My Certifications (${myCount})`}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#52525b" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search certifications…"
              style={{ width: "100%", paddingLeft: 36, paddingRight: 12, paddingTop: "0.6rem", paddingBottom: "0.6rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#e4e4e7", fontFamily: "inherit", fontSize: "0.83rem", outline: "none", boxSizing: "border-box" }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{ padding: "0.4rem 0.75rem", borderRadius: 999, border: `1px solid ${cat === c ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.07)"}`, background: cat === c ? "rgba(139,92,246,0.12)" : "transparent", color: cat === c ? "var(--primary)" : "#71717a", cursor: "pointer", fontSize: "0.73rem", fontWeight: 700, fontFamily: "inherit" }}>
                {CAT_ICONS[c] || ""} {c}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "0.4rem" }}>
            {LEVELS.map(l => (
              <button key={l} onClick={() => setLevel(l)} style={{ padding: "0.4rem 0.75rem", borderRadius: 999, border: `1px solid ${level === l ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.07)"}`, background: level === l ? "rgba(139,92,246,0.12)" : "transparent", color: level === l ? "var(--primary)" : "#71717a", cursor: "pointer", fontSize: "0.73rem", fontWeight: 600, fontFamily: "inherit" }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ height: 200, borderRadius: 16, background: "rgba(255,255,255,0.03)", animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#52525b" }}>
            <BookOpen size={36} style={{ marginBottom: 12, color: "#27272a" }} />
            <div>{tab === "my" ? "You haven't enrolled in any certifications yet." : "No certifications match your filters."}</div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
            {filtered.map(cert => {
              const p = cert.userProgress;
              const isCompleted = p?.status === "COMPLETED";
              const isEnrolled  = !!p;

              return (
                <div key={cert.id} style={{
                  background: "rgba(255,255,255,0.02)",
                  border: `1px solid ${isCompleted ? "rgba(34,197,94,0.2)" : isEnrolled ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 16, padding: "1.5rem",
                  display: "flex", flexDirection: "column", gap: "0.85rem",
                  transition: "border-color 0.15s",
                  position: "relative",
                }}>
                  {isCompleted && (
                    <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(34,197,94,0.15)", color: "#22c55e", padding: "3px 10px", borderRadius: 999, fontSize: "0.65rem", fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}>
                      <Award size={10} /> COMPLETED
                    </div>
                  )}

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                      <span style={{ fontSize: "1.25rem" }}>{CAT_ICONS[cert.category] || "📚"}</span>
                      <span style={{ fontSize: "0.68rem", color: LEVEL_COLOR[cert.level] || "#71717a", fontWeight: 700, background: `${LEVEL_COLOR[cert.level]}15`, padding: "2px 8px", borderRadius: 999 }}>
                        {cert.level}
                      </span>
                      <span style={{ fontSize: "0.68rem", color: "#52525b" }}>{cert.category}</span>
                    </div>
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "#f4f4f5", marginBottom: "0.25rem", lineHeight: 1.3 }}>{cert.title}</h3>
                    <div style={{ fontSize: "0.75rem", color: "#71717a" }}>{cert.provider}</div>
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.72rem", color: "#52525b" }}>
                    {cert.duration && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={11} />{cert.duration}</span>}
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Star size={11} style={{ color: "#f59e0b" }} /> Certificate included</span>
                  </div>

                  {/* Progress bar (if enrolled) */}
                  {isEnrolled && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: "0.72rem", color: "#71717a" }}>
                        <span>Progress</span>
                        <span style={{ color: isCompleted ? "#22c55e" : "#a855f7", fontWeight: 700 }}>{p!.progress}%</span>
                      </div>
                      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 999, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${p!.progress}%`, background: isCompleted ? "#22c55e" : "var(--primary)", borderRadius: 999, transition: "width 0.4s" }} />
                      </div>
                      {!isCompleted && (
                        <input type="range" min={0} max={100} value={p!.progress}
                          onChange={e => updateProgress(cert.id, parseInt(e.target.value))}
                          style={{ width: "100%", marginTop: 8, accentColor: "var(--primary)", cursor: "pointer" }}
                        />
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "auto" }}>
                    {!isEnrolled ? (
                      <button onClick={() => enroll(cert.id)} style={{ flex: 1, padding: "0.65rem", borderRadius: 10, border: "none", background: "var(--primary)", color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
                        Enroll Free
                      </button>
                    ) : isCompleted ? (
                      <button style={{ flex: 1, padding: "0.65rem", borderRadius: 10, border: "1px solid rgba(34,197,94,0.3)", background: "rgba(34,197,94,0.08)", color: "#22c55e", fontFamily: "inherit", fontWeight: 700, fontSize: "0.82rem", cursor: "default" }}>
                        ✓ Earned Certificate
                      </button>
                    ) : (
                      <button onClick={() => updateProgress(cert.id, Math.min(100, (p?.progress || 0) + 10))} style={{ flex: 1, padding: "0.65rem", borderRadius: 10, border: "none", background: "rgba(139,92,246,0.15)", color: "#a855f7", fontFamily: "inherit", fontWeight: 700, fontSize: "0.82rem", cursor: "pointer" }}>
                        Continue Learning
                      </button>
                    )}
                    {isEnrolled && !isCompleted && (
                      <button onClick={() => unenroll(cert.id)} title="Unenroll" style={{ padding: "0.65rem 0.75rem", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "transparent", color: "#52525b", cursor: "pointer", fontFamily: "inherit" }}>
                        <X size={14} />
                      </button>
                    )}
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
