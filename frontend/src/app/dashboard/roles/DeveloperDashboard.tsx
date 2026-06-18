"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/utils/api";
import DashboardShell, { getRoleMeta } from "../components/DashboardShell";
import { StatCard, Widget, SectionHeader, ActionBtn, EmptyState, StatusBadge } from "../components/DashboardWidgets";
import dynamic from "next/dynamic";
import { Code2, Package, Lightbulb, GitBranch, Calendar, Plus, Upload, Users, Zap } from "lucide-react";

const AIOpportunityAgent = dynamic(() => import("@/components/AIOpportunityAgent"), { ssr: false });

export default function DeveloperDashboard({ allRoles, onRoleSwitch }: { allRoles: string[]; onRoleSwitch: (r: string) => void }) {
  const { user, token } = useAuth();
  const [data, setData]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const COLOR = "#10B981";

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/dashboard/role/DEVELOPER`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const stats = data?.stats || {};

  return (
    <DashboardShell activeRole="DEVELOPER" allRoles={allRoles} onRoleSwitch={onRoleSwitch} roleMeta={getRoleMeta("DEVELOPER")}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: `${COLOR}10`, border: `1px solid ${COLOR}25`, borderRadius: 20, padding: "0.3rem 1rem", fontSize: "0.75rem", color: COLOR, fontWeight: 700, marginBottom: "0.75rem" }}>
          ⚡ Developer Hub
        </div>
        <h1 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 900, color: "#f4f4f5", margin: 0 }}>
          Build. Ship. Repeat. 🛠️
        </h1>
        <p style={{ color: "#71717a", marginTop: "0.3rem", fontSize: "0.9rem" }}>Your developer workspace and opportunity radar.</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "2rem" }}>
        <ActionBtn icon={<Upload size={14} />}    label="Sell Source Code"   href="/projects/create"  color={COLOR} />
        <ActionBtn icon={<Package size={14} />}   label="My Projects"        href="/projects"         color={COLOR} />
        <ActionBtn icon={<Users size={14} />}     label="Join Teams"         href="/innovation"       color={COLOR} />
        <ActionBtn icon={<Plus size={14} />}      label="Create Dev Profile" href="/profile"          color={COLOR} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard icon={<Code2 size={18} />}     label="Projects Listed"  value={stats.projects ?? "—"}       color={COLOR}     href="/projects"       loading={loading} />
        <StatCard icon={<Package size={18} />}   label="Services"         value={stats.services ?? "—"}       color="#8B5CF6"   href="/services"       loading={loading} />
        <StatCard icon={<Lightbulb size={18} />} label="Innovations"      value={stats.innovations ?? "—"}    color="#F59E0B"   href="/innovation"     loading={loading} />
        <StatCard icon={<GitBranch size={18} />} label="Certifications"   value={stats.certifications ?? "—"} color="#0EA5E9"   href="/certifications" loading={loading} />
      </div>

      {/* Upcoming Tech Events */}
      <div style={{ marginBottom: "1.25rem" }}>
        <Widget title="Upcoming Tech Events & Hackathons" icon={<Calendar size={15} />} action={<Link href="/events" style={{ fontSize: "0.75rem", color: COLOR, textDecoration: "none" }}>All events →</Link>}>
          {!data?.upcomingEvents?.length
            ? <EmptyState icon="📅" message="No upcoming events. Check back soon!" />
            : data.upcomingEvents.map((e: any, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.65rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${COLOR}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem", flexShrink: 0 }}>
                  {e.type === "Hackathon" ? "⚡" : e.type === "Workshop" ? "🛠️" : "📅"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "#e4e4e7" }}>{e.title}</div>
                  <div style={{ fontSize: "0.72rem", color: "#71717a" }}>{e.location} · {e.date}</div>
                </div>
                <div style={{ background: e.isFree ? "#22c55e18" : "#F59E0B18", color: e.isFree ? "#22c55e" : "#F59E0B", fontSize: "0.65rem", fontWeight: 700, borderRadius: 20, padding: "2px 8px" }}>
                  {e.isFree ? "FREE" : "PAID"}
                </div>
              </div>
            ))
          }
        </Widget>
      </div>

      <div style={{ marginBottom: "1.25rem" }}>
        <SectionHeader title="🤖 Developer Opportunity Agent" subtitle="Jobs, open source & hackathons matched to your stack" />
        <AIOpportunityAgent />
      </div>

      {/* Tech Stack Badges */}
      <Widget title="Popular Dev Technologies" icon={<Zap size={15} />}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {["React","TypeScript","Node.js","Python","Rust","Go","Docker","Kubernetes","AWS","PostgreSQL","GraphQL","Next.js","Solidity","Flutter","Swift"].map(tech => (
            <span key={tech} style={{ background: `${COLOR}10`, border: `1px solid ${COLOR}20`, color: COLOR, borderRadius: 8, padding: "0.25rem 0.65rem", fontSize: "0.73rem", fontWeight: 600 }}>{tech}</span>
          ))}
        </div>
      </Widget>
    </DashboardShell>
  );
}
