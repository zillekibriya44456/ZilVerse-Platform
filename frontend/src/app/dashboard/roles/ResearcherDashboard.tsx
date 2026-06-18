"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/utils/api";
import DashboardShell, { getRoleMeta } from "../components/DashboardShell";
import { StatCard, Widget, SectionHeader, ActionBtn, EmptyState } from "../components/DashboardWidgets";
import dynamic from "next/dynamic";
import { FlaskConical, BookOpen, Users, DollarSign, FileText, Search, GitMerge, Star } from "lucide-react";

const AIOpportunityAgent = dynamic(() => import("@/components/AIOpportunityAgent"), { ssr: false });

export default function ResearcherDashboard({ allRoles, onRoleSwitch }: { allRoles: string[]; onRoleSwitch: (r: string) => void }) {
  const { user, token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const COLOR = "#0EA5E9";

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/dashboard/role/RESEARCHER`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const stats = data?.stats || {};

  return (
    <DashboardShell activeRole="RESEARCHER" allRoles={allRoles} onRoleSwitch={onRoleSwitch} roleMeta={getRoleMeta("RESEARCHER")}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: `${COLOR}10`, border: `1px solid ${COLOR}25`, borderRadius: 20, padding: "0.3rem 1rem", fontSize: "0.75rem", color: COLOR, fontWeight: 700, marginBottom: "0.75rem" }}>
          🔬 Research Hub
        </div>
        <h1 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 900, color: "#f4f4f5", margin: 0 }}>
          Discover. Publish. Collaborate. 🔬
        </h1>
        <p style={{ color: "#71717a", marginTop: "0.3rem", fontSize: "0.9rem" }}>Your academic research and collaboration workspace.</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "2rem" }}>
        <ActionBtn icon={<FileText size={14} />}  label="Publish Research"    href="/community"    color={COLOR} />
        <ActionBtn icon={<Search size={14} />}    label="Find Collaborators"  href="/innovation"   color={COLOR} />
        <ActionBtn icon={<DollarSign size={14} />} label="Submit for Grants"  href="/fund"         color={COLOR} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard icon={<BookOpen size={18} />}     label="Publications"    value={stats.publications ?? "—"}   color={COLOR}     href="/community" loading={loading} />
        <StatCard icon={<FlaskConical size={18} />} label="Innovations"     value={stats.innovations ?? "—"}    color="#8B5CF6"   href="/innovation" loading={loading} />
        <StatCard icon={<DollarSign size={18} />}   label="Grants Created"  value={stats.grants ?? "—"}         color="#22c55e"   href="/fund"     loading={loading} />
        <StatCard icon={<Users size={18} />}        label="Collaborations"  value={stats.collaborations ?? 0}   color="#F59E0B"                    loading={loading} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        <Widget title="🔬 Research Areas" icon={<FlaskConical size={15} />}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {["AI/ML","Bioinformatics","Climate Science","Quantum Computing","Neuroscience","Robotics","Materials Science","Genomics","Cybersecurity","Astrophysics"].map(area => (
              <span key={area} style={{ background: `${COLOR}10`, border: `1px solid ${COLOR}22`, color: COLOR, borderRadius: 20, padding: "0.25rem 0.65rem", fontSize: "0.72rem", fontWeight: 600 }}>{area}</span>
            ))}
          </div>
        </Widget>

        <Widget title="📅 Academic Events" icon={<Star size={15} />}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {[
              { icon: "🎓", event: "IEEE Global Summit",      date: "Aug 2026" },
              { icon: "🔬", event: "AI Research Conference",  date: "Sep 2026" },
              { icon: "📊", event: "Data Science Symposium",  date: "Oct 2026" },
            ].map(e => (
              <div key={e.event} style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem", background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
                <span style={{ fontSize: "1rem" }}>{e.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#e4e4e7" }}>{e.event}</div>
                  <div style={{ fontSize: "0.68rem", color: "#71717a" }}>{e.date}</div>
                </div>
              </div>
            ))}
          </div>
        </Widget>
      </div>

      <div style={{ marginBottom: "1.25rem" }}>
        <SectionHeader title="🤖 Research Grant & Partner Agent" subtitle="Matched grants, research funding, and collaboration opportunities" />
        <AIOpportunityAgent />
      </div>
    </DashboardShell>
  );
}
