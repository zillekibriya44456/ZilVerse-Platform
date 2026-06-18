"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Zap, Briefcase, GraduationCap, DollarSign, Calendar, Users, ChevronRight, RotateCw, Sparkles, MapPin, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/utils/api";

interface Opportunity {
  id: string;
  title: string;
  company?: string;
  location?: string;
  type?: string;
  salary?: string;
  matchScore: number;
  createdAt: string;
  employer?: { name: string; avatar?: string };
  name?: string;
  avatar?: string;
  skills?: string[];
  hourlyRate?: number;
  date?: string;
  description?: string;
}

const TABS = [
  { id: "jobs",          label: "Jobs",           icon: Briefcase,      color: "#8B5CF6" },
  { id: "internships",   label: "Internships",     icon: GraduationCap,  color: "#06B6D4" },
  { id: "grants",        label: "Grants",          icon: DollarSign,     color: "#22C55E" },
  { id: "events",        label: "Events",          icon: Calendar,       color: "#F59E0B" },
  { id: "collaborators", label: "Collaborators",   icon: Users,          color: "#EC4899" },
];

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 70 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#71717a";
  return (
    <div style={{
      padding: "2px 8px", borderRadius: 999, fontSize: "0.7rem", fontWeight: 800,
      background: `${color}18`, color, border: `1px solid ${color}30`,
      flexShrink: 0,
    }}>
      {score}% match
    </div>
  );
}

function timeAgo(ts: string) {
  if (!ts) return "";
  const diff = Date.now() - new Date(ts).getTime();
  const d = Math.floor(diff / 86400000);
  return d === 0 ? "Today" : d === 1 ? "Yesterday" : `${d}d ago`;
}

export default function AIOpportunityAgent() {
  const { token, user } = useAuth();
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("jobs");
  const [error,   setError]   = useState(false);

  const fetch_ = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError(false);
    try {
      const res = await fetch(`${API_BASE}/api/agent/opportunities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const d = await res.json();
      setData(d);
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { if (user) fetch_(); }, [user]);

  const items: Opportunity[] = data?.[tab] || [];

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(139,92,246,0.2)",
      borderRadius: 20,
      overflow: "hidden",
      marginBottom: "1.5rem",
    }}>
      {/* Header */}
      <div style={{
        padding: "1.25rem 1.5rem",
        background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))",
        borderBottom: "1px solid rgba(139,92,246,0.12)",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Sparkles size={18} style={{ color: "#a855f7" }} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: "1rem", color: "#f4f4f5", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              AI Opportunity Agent
              <span style={{ fontSize: "0.6rem", background: "rgba(139,92,246,0.2)", color: "#a855f7", padding: "2px 7px", borderRadius: 999, fontWeight: 700 }}>LIVE</span>
            </div>
            <div style={{ fontSize: "0.73rem", color: "#71717a" }}>
              {data ? `${data.summary?.totalOpportunities} personalized matches found` : "Searching globally for you…"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {data && (
            <div style={{ fontSize: "0.7rem", color: "#52525b" }}>
              {data.summary?.userSkillsCount} skills matched
            </div>
          )}
          <button onClick={fetch_} disabled={loading} title="Refresh" style={{
            width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)", color: "#71717a",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
            <RotateCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.05)", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "0.75rem 1.1rem", border: "none", cursor: "pointer", fontFamily: "inherit",
            background: tab === t.id ? `${t.color}10` : "transparent",
            color: tab === t.id ? t.color : "#52525b",
            borderBottom: tab === t.id ? `2px solid ${t.color}` : "2px solid transparent",
            fontWeight: 700, fontSize: "0.78rem", display: "flex", alignItems: "center", gap: "0.3rem",
            transition: "all 0.15s", whiteSpace: "nowrap",
          }}>
            <t.icon size={13} />
            {t.label}
            {data?.[t.id]?.length > 0 && (
              <span style={{ background: `${t.color}25`, color: t.color, fontSize: "0.62rem", padding: "1px 5px", borderRadius: 999 }}>
                {data[t.id].length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: "1rem 1.25rem" }}>
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ height: 72, borderRadius: 10, background: "rgba(255,255,255,0.03)", animation: "pulse 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "#71717a", fontSize: "0.85rem" }}>
            <Zap size={24} style={{ color: "#3f3f46", marginBottom: 8 }} />
            <div>Complete your profile with skills to get personalized matches</div>
            <Link href="/freelancer/register" style={{ color: "var(--primary)", fontSize: "0.8rem", marginTop: 8, display: "inline-block" }}>
              Set up profile →
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "1.5rem", color: "#52525b", fontSize: "0.82rem" }}>
            No {tab} matches found yet. Add more skills to your profile.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {items.map((item) => (
              <div key={item.id} style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 12, padding: "0.85rem 1rem",
                display: "flex", alignItems: "center", gap: "0.85rem",
                transition: "border-color 0.15s, background 0.15s",
                cursor: "pointer",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(139,92,246,0.2)"; (e.currentTarget as HTMLElement).style.background = "rgba(139,92,246,0.04)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)"; }}
              >
                {/* Avatar / Icon */}
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${TABS.find(t=>t.id===tab)?.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                  {item.avatar || item.employer?.avatar ? (
                    <img src={item.avatar || item.employer?.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    React.createElement(TABS.find(t => t.id === tab)!.icon, { size: 16, style: { color: TABS.find(t=>t.id===tab)?.color } })
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#e4e4e7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.title || item.name}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#71717a", marginTop: 2, display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {(item.company || item.employer?.name) && (
                      <span>{item.company || item.employer?.name}</span>
                    )}
                    {item.location && (
                      <span style={{ display: "flex", alignItems: "center", gap: 2 }}><MapPin size={10} />{item.location}</span>
                    )}
                    {item.type && <span>{item.type}</span>}
                    {item.salary && <span style={{ color: "#22c55e" }}>{item.salary}</span>}
                    {item.hourlyRate && <span style={{ color: "#22c55e" }}>₹{item.hourlyRate}/hr</span>}
                    {item.date && <span style={{ display: "flex", alignItems: "center", gap: 2 }}><Clock size={10} />{new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                    {item.skills && <span>{item.skills.join(", ")}</span>}
                    {item.createdAt && <span style={{ color: "#3f3f46" }}>{timeAgo(item.createdAt)}</span>}
                  </div>
                </div>

                <ScoreBadge score={item.matchScore} />
                <ChevronRight size={14} style={{ color: "#3f3f46", flexShrink: 0 }} />
              </div>
            ))}

            {/* View all link */}
            <Link href={`/${tab === "jobs" || tab === "internships" ? "jobs" : tab === "collaborators" ? "freelancers" : tab === "grants" ? "fund" : "events"}`}
              style={{ textAlign: "center", padding: "0.6rem", fontSize: "0.78rem", color: "var(--primary)", textDecoration: "none", display: "block", fontWeight: 600 }}>
              View all {tab} →
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}
