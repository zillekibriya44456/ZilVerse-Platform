"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/utils/api";
import DashboardShell, { getRoleMeta } from "../components/DashboardShell";
import { StatCard, Widget, SectionHeader, ActionBtn, EmptyState, StatusBadge } from "../components/DashboardWidgets";
import dynamic from "next/dynamic";
import {
  Wallet, Briefcase, Star, Clock, MessageSquare, TrendingUp,
  Plus, Package, PenTool, ArrowDownToLine, Zap, User, BarChart2
} from "lucide-react";

const AIOpportunityAgent = dynamic(() => import("@/components/AIOpportunityAgent"), { ssr: false });

export default function FreelancerDashboard({ allRoles, onRoleSwitch }: { allRoles: string[]; onRoleSwitch: (r: string) => void }) {
  const { user, token } = useAuth();
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const COLOR = "#8B5CF6";

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/dashboard/role/FREELANCER`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const stats = data?.stats || {};

  return (
    <DashboardShell activeRole="FREELANCER" allRoles={allRoles} onRoleSwitch={onRoleSwitch} roleMeta={getRoleMeta("FREELANCER")}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: `${COLOR}10`, border: `1px solid ${COLOR}25`, borderRadius: 20, padding: "0.3rem 1rem", fontSize: "0.75rem", color: COLOR, fontWeight: 700, marginBottom: "0.75rem" }}>
          💼 Freelancer Studio
        </div>
        <h1 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 900, color: "#f4f4f5", margin: 0 }}>
          Welcome back, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p style={{ color: "#71717a", marginTop: "0.3rem", fontSize: "0.9rem" }}>Here's your freelance business at a glance.</p>
      </div>

      {/* ── Quick Actions ──────────────────────────────────────────────── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "2rem" }}>
        <ActionBtn icon={<Plus size={14} />}     label="Create Service"     href="/services/create"    color={COLOR} />
        <ActionBtn icon={<Package size={14} />}  label="Manage Services"    href="/dashboard/orders"   color={COLOR} />
        <ActionBtn icon={<PenTool size={14} />}  label="Manage Portfolio"   href="/profile"            color={COLOR} />
        <ActionBtn icon={<ArrowDownToLine size={14} />} label="Withdraw Earnings" href="/dashboard/wallet" color={COLOR} />
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard icon={<Wallet size={18} />}    label="Total Earnings"      value={`₹${(stats.earnings||0).toFixed(0)}`}     color={COLOR}     href="/dashboard/wallet"  loading={loading} />
        <StatCard icon={<Briefcase size={18} />} label="Active Projects"     value={stats.activeProjects ?? "—"}              color="#10B981"    loading={loading} />
        <StatCard icon={<Star size={18} />}      label="Completed Projects"  value={stats.completedProjects ?? "—"}           color="#F59E0B"    loading={loading} />
        <StatCard icon={<Clock size={18} />}     label="Pending Orders"      value={stats.pendingOrders ?? "—"}               color="#EF4444"    href="/dashboard/orders"  loading={loading} />
        <StatCard icon={<Star size={18} />}      label="Avg Rating"          value={stats.avgRating ? `${stats.avgRating}★` : "—"} color="#F59E0B"  loading={loading} />
        <StatCard icon={<Package size={18} />}   label="Services Listed"     value={stats.services ?? "—"}                   color="#0EA5E9"    href="/services"          loading={loading} />
      </div>

      {/* ── Main Grid ──────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>

        {/* Recent Client Messages */}
        <Widget title="New Client Messages" icon={<MessageSquare size={15} />} action={<Link href="/dashboard/messages" style={{ fontSize: "0.75rem", color: "#8B5CF6", textDecoration: "none" }}>View all →</Link>}>
          {!data?.recentMessages?.length
            ? <EmptyState icon="💌" message="No new messages yet" />
            : data.recentMessages.map((m: any, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: `${COLOR}20`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: COLOR, fontSize: "0.8rem", flexShrink: 0 }}>
                  {m.avatar ? <img src={m.avatar} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover" }} alt="" /> : m.from?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "#e4e4e7" }}>{m.from}</div>
                  <div style={{ fontSize: "0.73rem", color: "#71717a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.preview}</div>
                </div>
              </div>
            ))
          }
        </Widget>

        {/* Earnings Summary */}
        <Widget title="Earnings Overview" icon={<BarChart2 size={15} />}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {[
              { label: "Available", value: `₹${(data?.wallet?.balance||0).toFixed(0)}`, color: "#22c55e" },
              { label: "Pending",   value: `₹${(data?.wallet?.pending||0).toFixed(0)}`,  color: "#F59E0B" },
              { label: "Reviews",   value: stats.totalReviews ?? 0,                        color: "#8B5CF6" },
              { label: "Messages",  value: data?.unreadMessages ?? 0,                      color: "#3B82F6" },
            ].map(item => (
              <div key={item.label} style={{ background: `${item.color}08`, border: `1px solid ${item.color}18`, borderRadius: 10, padding: "0.75rem" }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#f4f4f5" }}>{item.value}</div>
                <div style={{ fontSize: "0.72rem", color: item.color, fontWeight: 600, marginTop: 2 }}>{item.label}</div>
              </div>
            ))}
          </div>
        </Widget>
      </div>

      {/* ── AI Agent ───────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "1.25rem" }}>
        <SectionHeader title="🤖 AI Opportunity Agent" subtitle="Personalized opportunities matched to your skills" />
        <AIOpportunityAgent />
      </div>

      {/* ── Top Skills Demand ──────────────────────────────────────────── */}
      <Widget title="Top Skills in Demand" icon={<TrendingUp size={15} />}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {["React", "Node.js", "Python", "UI/UX", "Figma", "TypeScript", "AWS", "Next.js", "Flutter", "Solidity"].map(skill => (
            <span key={skill} style={{ background: `${COLOR}12`, border: `1px solid ${COLOR}25`, color: COLOR, borderRadius: 20, padding: "0.25rem 0.75rem", fontSize: "0.75rem", fontWeight: 600 }}>{skill}</span>
          ))}
        </div>
      </Widget>
    </DashboardShell>
  );
}
