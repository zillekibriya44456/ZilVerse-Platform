"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/utils/api";
import DashboardShell, { getRoleMeta } from "../components/DashboardShell";
import { StatCard, Widget, SectionHeader, ActionBtn, EmptyState, StatusBadge } from "../components/DashboardWidgets";
import dynamic from "next/dynamic";
import { Building2, Users, UserCheck, BarChart2, Plus, Calendar, Search, CheckCircle, Clock, AlertCircle } from "lucide-react";

const AIOpportunityAgent = dynamic(() => import("@/components/AIOpportunityAgent"), { ssr: false });

export default function EmployerDashboard({ allRoles, onRoleSwitch }: { allRoles: string[]; onRoleSwitch: (r: string) => void }) {
  const { user, token } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const COLOR = "#6366F1";

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/dashboard/role/EMPLOYER`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const stats = data?.stats || {};

  const PIPELINE_STAGES = [
    { label: "Applied",      count: stats.totalApplications || 0,  color: "#3B82F6" },
    { label: "Reviewing",    count: Math.floor((stats.totalApplications || 0) * 0.4), color: "#F59E0B" },
    { label: "Interviewed",  count: Math.floor((stats.totalApplications || 0) * 0.2), color: "#A855F7" },
    { label: "Hired",        count: stats.acceptedHires || 0,       color: "#22c55e" },
  ];

  return (
    <DashboardShell activeRole="EMPLOYER" allRoles={allRoles} onRoleSwitch={onRoleSwitch} roleMeta={getRoleMeta("EMPLOYER")}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: `${COLOR}10`, border: `1px solid ${COLOR}25`, borderRadius: 20, padding: "0.3rem 1rem", fontSize: "0.75rem", color: COLOR, fontWeight: 700, marginBottom: "0.75rem" }}>
          🏢 Employer HQ
        </div>
        <h1 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 900, color: "#f4f4f5", margin: 0 }}>
          Hire Top Talent, {user?.name?.split(" ")[0]} 🏢
        </h1>
        <p style={{ color: "#71717a", marginTop: "0.3rem", fontSize: "0.9rem" }}>LinkedIn Recruiter-quality hiring command center.</p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "2rem" }}>
        <ActionBtn icon={<Plus size={14} />}       label="Post Job"               href="/jobs/create"          color={COLOR} />
        <ActionBtn icon={<Search size={14} />}     label="Browse Candidates"      href="/talent"               color={COLOR} />
        <ActionBtn icon={<Calendar size={14} />}   label="Schedule Interviews"    href="/dashboard/messages"   color={COLOR} />
        <ActionBtn icon={<BarChart2 size={14} />}  label="Recruitment Analytics"  href="/dashboard"            color={COLOR} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard icon={<Building2 size={18} />}  label="Active Jobs"         value={stats.jobsPosted ?? "—"}         color={COLOR}   href="/jobs"     loading={loading} />
        <StatCard icon={<Users size={18} />}      label="Total Applications"  value={stats.totalApplications ?? "—"}   color="#3B82F6"               loading={loading} />
        <StatCard icon={<UserCheck size={18} />}  label="Hires Made"          value={stats.acceptedHires ?? "—"}       color="#22c55e"               loading={loading} />
        <StatCard icon={<BarChart2 size={18} />}  label="In Pipeline"         value={stats.pipeline ?? "—"}            color="#F59E0B"               loading={loading} />
      </div>

      {/* Hiring Pipeline Kanban */}
      <div style={{ marginBottom: "1.25rem" }}>
        <Widget title="📊 Hiring Pipeline" icon={<BarChart2 size={15} />}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.75rem" }}>
            {PIPELINE_STAGES.map(stage => (
              <div key={stage.label} style={{ background: `${stage.color}08`, border: `1px solid ${stage.color}20`, borderRadius: 12, padding: "1rem", textAlign: "center" }}>
                <div style={{ fontSize: "2rem", fontWeight: 900, color: stage.color }}>{stage.count}</div>
                <div style={{ fontSize: "0.72rem", color: "#71717a", fontWeight: 600, marginTop: "0.3rem" }}>{stage.label}</div>
              </div>
            ))}
          </div>
        </Widget>
      </div>

      {/* Active Jobs */}
      <div style={{ marginBottom: "1.25rem" }}>
        <Widget title="📋 Active Job Listings" icon={<Building2 size={15} />} action={<Link href="/dashboard/jobs" style={{ fontSize: "0.75rem", color: COLOR, textDecoration: "none" }}>Manage all →</Link>}>
          {!data?.recentJobs?.length
            ? <EmptyState icon="📋" message="No jobs posted yet. Post your first job!" />
            : data.recentJobs.map((j: any, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.65rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#e4e4e7" }}>{j.title}</div>
                  <div style={{ fontSize: "0.72rem", color: "#71717a", marginTop: "0.15rem" }}>{j.company}</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontWeight: 800, fontSize: "1rem", color: COLOR }}>{j.applications}</div>
                  <div style={{ fontSize: "0.65rem", color: "#71717a" }}>applicants</div>
                </div>
                <StatusBadge status={j.status} />
              </div>
            ))
          }
        </Widget>
      </div>

      <div style={{ marginBottom: "1.25rem" }}>
        <SectionHeader title="🤖 Candidate Recommendations" subtitle="AI-matched top candidates for your open roles" />
        <AIOpportunityAgent />
      </div>
    </DashboardShell>
  );
}
