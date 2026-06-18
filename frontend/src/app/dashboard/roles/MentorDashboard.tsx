"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/utils/api";
import DashboardShell, { getRoleMeta } from "../components/DashboardShell";
import { StatCard, Widget, SectionHeader, ActionBtn, EmptyState } from "../components/DashboardWidgets";
import dynamic from "next/dynamic";
import { Brain, Users, Star, Wallet, Calendar, Clock, Plus, MessageSquare, TrendingUp } from "lucide-react";

const AIOpportunityAgent = dynamic(() => import("@/components/AIOpportunityAgent"), { ssr: false });

export default function MentorDashboard({ allRoles, onRoleSwitch }: { allRoles: string[]; onRoleSwitch: (r: string) => void }) {
  const { user, token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const COLOR = "#A855F7";

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/dashboard/role/MENTOR`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const stats = data?.stats || {};

  return (
    <DashboardShell activeRole="MENTOR" allRoles={allRoles} onRoleSwitch={onRoleSwitch} roleMeta={getRoleMeta("MENTOR")}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: `${COLOR}10`, border: `1px solid ${COLOR}25`, borderRadius: 20, padding: "0.3rem 1rem", fontSize: "0.75rem", color: COLOR, fontWeight: 700, marginBottom: "0.75rem" }}>
          🧠 Mentor Hub
        </div>
        <h1 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 900, color: "#f4f4f5", margin: 0 }}>
          Guide. Inspire. Impact. 🧠
        </h1>
        <p style={{ color: "#71717a", marginTop: "0.3rem", fontSize: "0.9rem" }}>Your mentorship dashboard — sessions, students, and impact metrics.</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "2rem" }}>
        <ActionBtn icon={<Calendar size={14} />}     label="Schedule Sessions"         href="/community"       color={COLOR} />
        <ActionBtn icon={<Plus size={14} />}         label="Create Mentorship Program" href="/community"       color={COLOR} />
        <ActionBtn icon={<MessageSquare size={14} />} label="Manage Messages"          href="/dashboard/messages" color={COLOR} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard icon={<Brain size={18} />}    label="Sessions Conducted"   value={stats.sessionsConducted ?? "—"}       color={COLOR}                   loading={loading} />
        <StatCard icon={<Users size={18} />}    label="Discussions Shared"   value={stats.postsShared ?? "—"}              color="#10B981"  href="/community" loading={loading} />
        <StatCard icon={<Star size={18} />}     label="Avg Rating"           value={stats.avgRating ? `${stats.avgRating}★` : "—"} color="#F59E0B"          loading={loading} />
        <StatCard icon={<Wallet size={18} />}   label="Earnings"             value={`₹${(stats.earnings||0).toFixed(0)}`}  color="#22c55e"  href="/dashboard/wallet" loading={loading} />
      </div>

      {/* Rating overview */}
      <div style={{ marginBottom: "1.25rem" }}>
        <Widget title="⭐ Mentor Reputation" icon={<Star size={15} />}>
          <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", fontWeight: 900, color: "#F59E0B", lineHeight: 1 }}>{stats.avgRating || 4.8}</div>
              <div style={{ display: "flex", gap: "2px", justifyContent: "center", margin: "0.25rem 0" }}>
                {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.round(stats.avgRating || 4.8) ? "#F59E0B" : "#3f3f46", fontSize: "0.85rem" }}>★</span>)}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#71717a" }}>Overall Rating</div>
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {[5,4,3,2,1].map(star => {
                const percent = star === 5 ? 72 : star === 4 ? 20 : star === 3 ? 5 : star === 2 ? 2 : 1;
                return (
                  <div key={star} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ fontSize: "0.72rem", color: "#71717a", width: 16, textAlign: "right" }}>{star}★</div>
                    <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${percent}%`, height: "100%", background: "#F59E0B", borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "#52525b", width: 28 }}>{percent}%</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Widget>
      </div>

      {/* Recent posts / discussions */}
      <div style={{ marginBottom: "1.25rem" }}>
        <Widget title="📋 Recent Mentorship Activity" icon={<TrendingUp size={15} />} action={<Link href="/community" style={{ fontSize: "0.75rem", color: COLOR, textDecoration: "none" }}>View all →</Link>}>
          {!data?.recentPosts?.length
            ? <EmptyState icon="💬" message="Start sharing knowledge in Community!" />
            : data.recentPosts.map((p: any, i: number) => (
              <div key={i} style={{ padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "#e4e4e7" }}>{p.title}</div>
                <div style={{ fontSize: "0.7rem", color: "#71717a" }}>▲ {p.upvotes}</div>
              </div>
            ))
          }
        </Widget>
      </div>

      <div>
        <SectionHeader title="🤖 Mentee & Opportunity Finder" subtitle="AI-matched students and mentorship opportunities" />
        <AIOpportunityAgent />
      </div>
    </DashboardShell>
  );
}
