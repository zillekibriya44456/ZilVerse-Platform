"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/utils/api";
import DashboardShell, { getRoleMeta } from "../components/DashboardShell";
import { StatCard, Widget, SectionHeader, ActionBtn, EmptyState } from "../components/DashboardWidgets";
import dynamic from "next/dynamic";
import { Play, Heart, Eye, Wallet, Upload, TrendingUp, Users, BarChart2, Zap } from "lucide-react";

const AIOpportunityAgent = dynamic(() => import("@/components/AIOpportunityAgent"), { ssr: false });

export default function CreatorDashboard({ allRoles, onRoleSwitch }: { allRoles: string[]; onRoleSwitch: (r: string) => void }) {
  const { user, token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const COLOR = "#EC4899";

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/dashboard/role/CREATOR`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const stats = data?.stats || {};

  return (
    <DashboardShell activeRole="CREATOR" allRoles={allRoles} onRoleSwitch={onRoleSwitch} roleMeta={getRoleMeta("CREATOR")}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: `${COLOR}10`, border: `1px solid ${COLOR}25`, borderRadius: 20, padding: "0.3rem 1rem", fontSize: "0.75rem", color: COLOR, fontWeight: 700, marginBottom: "0.75rem" }}>
          🎬 Creator Studio
        </div>
        <h1 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 900, color: "#f4f4f5", margin: 0 }}>
          Create. Grow. Monetize. 🎬
        </h1>
        <p style={{ color: "#71717a", marginTop: "0.3rem", fontSize: "0.9rem" }}>Your YouTube Studio — powered by ZilVerse.</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "2rem" }}>
        <ActionBtn icon={<Upload size={14} />}  label="Upload Reel"     href="/reels/create"    color={COLOR} />
        <ActionBtn icon={<Play size={14} />}    label="My Reels"        href="/reels"            color={COLOR} />
        <ActionBtn icon={<Wallet size={14} />}  label="Earnings"        href="/dashboard/wallet" color={COLOR} />
        <ActionBtn icon={<Users size={14} />}   label="My Audience"     href="/community"        color={COLOR} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard icon={<Play size={18} />}   label="Total Reels"    value={stats.reels ?? "—"}                      color={COLOR}   href="/reels"             loading={loading} />
        <StatCard icon={<Eye size={18} />}    label="Total Views"    value={(stats.totalViews || 0).toLocaleString()} color="#8B5CF6"                            loading={loading} />
        <StatCard icon={<Heart size={18} />}  label="Total Likes"    value={(stats.totalLikes || 0).toLocaleString()} color="#EF4444"                            loading={loading} />
        <StatCard icon={<Wallet size={18} />} label="Earnings"       value={`₹${(stats.earnings||0).toFixed(0)}`}    color="#22c55e" href="/dashboard/wallet"   loading={loading} />
      </div>

      {/* Recent Reels */}
      <div style={{ marginBottom: "1.25rem" }}>
        <Widget title="🎬 Recent Reels" icon={<Play size={15} />} action={<Link href="/reels" style={{ fontSize: "0.75rem", color: COLOR, textDecoration: "none" }}>All reels →</Link>}>
          {!data?.latestReels?.length
            ? <EmptyState icon="🎬" message="No reels yet. Upload your first reel!" />
            : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: "0.75rem" }}>
                {data.latestReels.map((r: any, i: number) => (
                  <Link key={i} href={`/reels/${r.id}`} style={{ textDecoration: "none" }}>
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, overflow: "hidden", cursor: "pointer", transition: "all 0.15s" }}
                         onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                         onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
                      <div style={{ height: 100, background: r.thumbnail ? `url(${r.thumbnail}) center/cover` : `linear-gradient(135deg,${COLOR}30,#18181b)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                        {!r.thumbnail && "🎬"}
                      </div>
                      <div style={{ padding: "0.6rem" }}>
                        <div style={{ fontWeight: 600, fontSize: "0.78rem", color: "#e4e4e7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title}</div>
                        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.3rem", fontSize: "0.68rem", color: "#71717a" }}>
                          <span>👁 {r.views || 0}</span>
                          <span>❤️ {r.likes || 0}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          }
        </Widget>
      </div>

      {/* Audience Analytics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        <Widget title="📊 Audience Analytics" icon={<BarChart2 size={15} />}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              { label: "Engagement Rate", value: "8.4%",  bar: 84, color: COLOR },
              { label: "Avg Watch Time",  value: "2:34",  bar: 60, color: "#8B5CF6" },
              { label: "Share Rate",      value: "3.2%",  bar: 32, color: "#10B981" },
            ].map(m => (
              <div key={m.label}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", color: "#a1a1aa", marginBottom: "0.3rem" }}>
                  <span>{m.label}</span><span style={{ color: m.color, fontWeight: 700 }}>{m.value}</span>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ width: `${m.bar}%`, height: "100%", background: m.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </Widget>

        <Widget title="🔥 Trending in Your Niche" icon={<TrendingUp size={15} />}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              "#TechTips", "#BuildInPublic", "#AI", "#WebDev", "#CareerAdvice",
            ].map((tag, i) => (
              <div key={tag} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.4rem", borderRadius: 8, background: "rgba(255,255,255,0.02)" }}>
                <div style={{ fontWeight: 800, fontSize: "0.8rem", color: "#3f3f46", width: 20 }}>{i+1}</div>
                <div style={{ fontWeight: 600, fontSize: "0.82rem", color: COLOR }}>{tag}</div>
                <div style={{ marginLeft: "auto", fontSize: "0.65rem", color: "#71717a" }}>+{(5 - i) * 12}%</div>
              </div>
            ))}
          </div>
        </Widget>
      </div>

      <div>
        <SectionHeader title="🤖 Creator Opportunities" subtitle="AI-matched brand deals, sponsorships, and collaborations" />
        <AIOpportunityAgent />
      </div>
    </DashboardShell>
  );
}
