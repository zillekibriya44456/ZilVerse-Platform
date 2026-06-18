"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/utils/api";
import DashboardShell, { getRoleMeta } from "../components/DashboardShell";
import { StatCard, Widget, SectionHeader, ActionBtn, EmptyState } from "../components/DashboardWidgets";
import dynamic from "next/dynamic";
import { Rocket, Users, DollarSign, Lightbulb, Plus, UserPlus, TrendingUp, Briefcase } from "lucide-react";

const AIOpportunityAgent = dynamic(() => import("@/components/AIOpportunityAgent"), { ssr: false });

export default function StartupDashboard({ allRoles, onRoleSwitch }: { allRoles: string[]; onRoleSwitch: (r: string) => void }) {
  const { user, token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const COLOR = "#EF4444";

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/dashboard/role/STARTUP`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const stats = data?.stats || {};

  return (
    <DashboardShell activeRole="STARTUP" allRoles={allRoles} onRoleSwitch={onRoleSwitch} roleMeta={getRoleMeta("STARTUP")}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: `${COLOR}10`, border: `1px solid ${COLOR}25`, borderRadius: 20, padding: "0.3rem 1rem", fontSize: "0.75rem", color: COLOR, fontWeight: 700, marginBottom: "0.75rem" }}>
          🚀 Startup Command Center
        </div>
        <h1 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 900, color: "#f4f4f5", margin: 0 }}>
          Build the Future, {user?.name?.split(" ")[0]} 🚀
        </h1>
        <p style={{ color: "#71717a", marginTop: "0.3rem", fontSize: "0.9rem" }}>Your AngelList-style startup command center.</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "2rem" }}>
        <ActionBtn icon={<Rocket size={14} />}   label="Create Startup"   href="/innovation"    color={COLOR} />
        <ActionBtn icon={<UserPlus size={14} />} label="Recruit Team"     href="/jobs/create"   color={COLOR} />
        <ActionBtn icon={<DollarSign size={14} />} label="Raise Funding"  href="/fund"          color={COLOR} />
        <ActionBtn icon={<Briefcase size={14} />} label="Post Opportunities" href="/jobs/create" color={COLOR} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard icon={<Lightbulb size={18} />}  label="Innovations Created" value={stats.innovations ?? "—"}    color={COLOR}     href="/innovation"  loading={loading} />
        <StatCard icon={<Briefcase size={18} />}  label="Open Roles"          value={stats.openRoles ?? "—"}      color="#8B5CF6"   href="/jobs"        loading={loading} />
        <StatCard icon={<DollarSign size={18} />} label="Grants Created"       value={stats.grantsCreated ?? "—"} color="#22c55e"   href="/fund"        loading={loading} />
        <StatCard icon={<TrendingUp size={18} />} label="Funding Progress"     value={`${stats.fundingProgress ?? 0}%`} color="#F59E0B"              loading={loading} />
      </div>

      {/* Investor Matches */}
      <div style={{ marginBottom: "1.25rem" }}>
        <Widget title="🤝 Investor & Co-Founder Matches" icon={<Users size={15} />} action={<Link href="/fund" style={{ fontSize: "0.75rem", color: COLOR, textDecoration: "none" }}>Explore funding →</Link>}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "0.75rem" }}>
            {[
              { icon: "💰", title: "Angel Investors",   count: "1,200+", color: "#F59E0B" },
              { icon: "🏦", title: "VC Funds",          count: "340+",   color: "#8B5CF6" },
              { icon: "🤝", title: "Co-Founders",       count: "5,800+", color: "#10B981" },
              { icon: "🎓", title: "Startup Grants",    count: "200+",   color: "#0EA5E9" },
            ].map(item => (
              <div key={item.title} style={{ background: `${item.color}08`, border: `1px solid ${item.color}20`, borderRadius: 10, padding: "0.85rem", textAlign: "center" }}>
                <div style={{ fontSize: "1.5rem" }}>{item.icon}</div>
                <div style={{ fontWeight: 800, fontSize: "1.1rem", color: item.color, marginTop: "0.25rem" }}>{item.count}</div>
                <div style={{ fontSize: "0.72rem", color: "#71717a", marginTop: "0.2rem" }}>{item.title}</div>
              </div>
            ))}
          </div>
        </Widget>
      </div>

      <div style={{ marginBottom: "1.25rem" }}>
        <SectionHeader title="🤖 Funding & Talent AI Agent" subtitle="Matched investors, grants, and top candidates" />
        <AIOpportunityAgent />
      </div>

      <Widget title="📊 Startup Metrics" icon={<TrendingUp size={15} />}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem" }}>
          {[
            { label: "Runway",         value: "–",    desc: "Track with Razorpay" },
            { label: "Team Size",      value: stats.openRoles ?? 0,   desc: "Open roles" },
            { label: "Wallet",         value: `₹${(data?.wallet?.balance||0).toFixed(0)}`, desc: "Available" },
          ].map(m => (
            <div key={m.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "0.85rem", textAlign: "center" }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#f4f4f5" }}>{m.value}</div>
              <div style={{ fontSize: "0.72rem", color: COLOR, fontWeight: 700, marginTop: "0.2rem" }}>{m.label}</div>
              <div style={{ fontSize: "0.65rem", color: "#52525b", marginTop: "0.1rem" }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </Widget>
    </DashboardShell>
  );
}
