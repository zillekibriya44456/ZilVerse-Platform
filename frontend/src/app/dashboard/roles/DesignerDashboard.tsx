"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/utils/api";
import DashboardShell, { getRoleMeta } from "../components/DashboardShell";
import { StatCard, Widget, SectionHeader, ActionBtn, EmptyState } from "../components/DashboardWidgets";
import dynamic from "next/dynamic";
import { Palette, Package, Wallet, Eye, Upload, Star, Plus, Sparkles } from "lucide-react";

const AIOpportunityAgent = dynamic(() => import("@/components/AIOpportunityAgent"), { ssr: false });

export default function DesignerDashboard({ allRoles, onRoleSwitch }: { allRoles: string[]; onRoleSwitch: (r: string) => void }) {
  const { user, token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const COLOR = "#F59E0B";

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/dashboard/role/DESIGNER`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const stats = data?.stats || {};

  const DESIGN_TRENDS = [
    { icon: "🌊", title: "Glassmorphism", trend: "🔥 Hot" },
    { icon: "🌙", title: "Dark UI", trend: "📈 Rising" },
    { icon: "🎨", title: "Gradient Mesh", trend: "✨ Trending" },
    { icon: "⚡", title: "Micro-animations", trend: "🔥 Hot" },
    { icon: "🤖", title: "AI-Assisted Design", trend: "🚀 Emerging" },
    { icon: "🔷", title: "3D Icons", trend: "📈 Rising" },
  ];

  return (
    <DashboardShell activeRole="DESIGNER" allRoles={allRoles} onRoleSwitch={onRoleSwitch} roleMeta={getRoleMeta("DESIGNER")}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: `${COLOR}10`, border: `1px solid ${COLOR}25`, borderRadius: 20, padding: "0.3rem 1rem", fontSize: "0.75rem", color: COLOR, fontWeight: 700, marginBottom: "0.75rem" }}>
          🎨 Designer Studio
        </div>
        <h1 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 900, color: "#f4f4f5", margin: 0 }}>
          Create. Inspire. Earn. ✨
        </h1>
        <p style={{ color: "#71717a", marginTop: "0.3rem", fontSize: "0.9rem" }}>Your creative workspace and design marketplace.</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "2rem" }}>
        <ActionBtn icon={<Upload size={14} />} label="Upload Designs"   href="/projects/create" color={COLOR} />
        <ActionBtn icon={<Package size={14} />} label="Sell Assets"    href="/services/create" color={COLOR} />
        <ActionBtn icon={<Plus size={14} />}    label="Create Portfolio" href="/profile"        color={COLOR} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard icon={<Eye size={18} />}      label="Portfolio Views"  value={stats.portfolioViews ?? "—"}  color={COLOR}  loading={loading} />
        <StatCard icon={<Palette size={18} />}  label="Design Projects"  value={stats.projects ?? "—"}        color="#8B5CF6"  href="/projects" loading={loading} />
        <StatCard icon={<Package size={18} />}  label="Assets Listed"    value={stats.services ?? "—"}        color="#10B981"  href="/services" loading={loading} />
        <StatCard icon={<Wallet size={18} />}   label="Earnings"         value={`₹${(stats.earnings||0).toFixed(0)}`} color="#22c55e" href="/dashboard/wallet" loading={loading} />
      </div>

      {/* UI/UX Trends */}
      <div style={{ marginBottom: "1.25rem" }}>
        <Widget title="🔥 UI/UX Trends Right Now" icon={<Sparkles size={15} />}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: "0.75rem" }}>
            {DESIGN_TRENDS.map(t => (
              <div key={t.title} style={{ background: `${COLOR}08`, border: `1px solid ${COLOR}18`, borderRadius: 10, padding: "0.75rem" }}>
                <div style={{ fontSize: "1.3rem" }}>{t.icon}</div>
                <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#e4e4e7", marginTop: "0.3rem" }}>{t.title}</div>
                <div style={{ fontSize: "0.7rem", color: COLOR, fontWeight: 600, marginTop: "0.2rem" }}>{t.trend}</div>
              </div>
            ))}
          </div>
        </Widget>
      </div>

      <div style={{ marginBottom: "1.25rem" }}>
        <SectionHeader title="🤖 Design Job Recommendations" subtitle="AI-matched design jobs and clients" />
        <AIOpportunityAgent />
      </div>

      <Widget title="💡 Creative Challenges" icon={<Star size={15} />}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[
            { icon: "🎯", title: "Daily UI Challenge",   prize: "Portfolio boost", deadline: "Ongoing" },
            { icon: "🏆", title: "Logo Design Contest",  prize: "₹50,000",         deadline: "5 days left" },
            { icon: "🖼️", title: "Website Redesign",    prize: "₹25,000",         deadline: "10 days left" },
          ].map(c => (
            <div key={c.title} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontSize: "1.25rem" }}>{c.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "#e4e4e7" }}>{c.title}</div>
                  <div style={{ fontSize: "0.7rem", color: "#71717a" }}>{c.deadline}</div>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: "0.78rem", color: COLOR }}>{c.prize}</div>
            </div>
          ))}
        </div>
      </Widget>
    </DashboardShell>
  );
}
