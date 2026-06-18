"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/utils/api";
import DashboardShell, { getRoleMeta } from "../components/DashboardShell";
import { StatCard, Widget, SectionHeader, ActionBtn, EmptyState, StatusBadge } from "../components/DashboardWidgets";
import dynamic from "next/dynamic";
import { GraduationCap, Briefcase, BookOpen, Upload, Search, Target, Award, ArrowRight, CheckCircle, Clock } from "lucide-react";

const AIOpportunityAgent = dynamic(() => import("@/components/AIOpportunityAgent"), { ssr: false });

export default function StudentDashboard({ allRoles, onRoleSwitch }: { allRoles: string[]; onRoleSwitch: (r: string) => void }) {
  const { user, token } = useAuth();
  const [data, setData]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const COLOR = "#3B82F6";

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/dashboard/role/STUDENT`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  const stats = data?.stats || {};
  const resumeScore = stats.resumeScore || 0;

  return (
    <DashboardShell activeRole="STUDENT" allRoles={allRoles} onRoleSwitch={onRoleSwitch} roleMeta={getRoleMeta("STUDENT")}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: `${COLOR}10`, border: `1px solid ${COLOR}25`, borderRadius: 20, padding: "0.3rem 1rem", fontSize: "0.75rem", color: COLOR, fontWeight: 700, marginBottom: "0.75rem" }}>
          🎓 Student Hub
        </div>
        <h1 style={{ fontSize: "clamp(1.5rem,3vw,2rem)", fontWeight: 900, color: "#f4f4f5", margin: 0 }}>
          Your Career Journey, {user?.name?.split(" ")[0]} 🚀
        </h1>
        <p style={{ color: "#71717a", marginTop: "0.3rem", fontSize: "0.9rem" }}>Track internships, certifications and opportunities.</p>
      </div>

      {/* Quick Actions */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "2rem" }}>
        <ActionBtn icon={<Upload size={14} />}    label="Upload Resume"      href="/profile"          color={COLOR} />
        <ActionBtn icon={<BookOpen size={14} />}  label="Certifications"     href="/certifications"   color={COLOR} />
        <ActionBtn icon={<Search size={14} />}    label="Find Internships"   href="/jobs?type=intern" color={COLOR} />
        <ActionBtn icon={<Target size={14} />}    label="Track Applications" href="/dashboard/jobs"   color={COLOR} />
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <StatCard icon={<Briefcase size={18} />}    label="Total Applications"  value={stats.totalApplications ?? "—"}    color={COLOR}     href="/dashboard/jobs"     loading={loading} />
        <StatCard icon={<CheckCircle size={18} />}  label="Accepted Offers"     value={stats.acceptedApplications ?? "—"} color="#22c55e"                              loading={loading} />
        <StatCard icon={<Award size={18} />}        label="Certifications"      value={stats.certifications ?? "—"}       color="#F59E0B"    href="/certifications"     loading={loading} />
        <StatCard icon={<Target size={18} />}       label="Resume Score"        value={`${resumeScore}/100`}              color="#8B5CF6"                              loading={loading} />
      </div>

      {/* Resume Score Bar */}
      <div style={{ marginBottom: "2rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem" }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#e4e4e7" }}>📄 Resume Score</div>
            <div style={{ fontSize: "0.75rem", color: "#71717a", marginTop: "0.2rem" }}>Add certifications & skills to boost your score</div>
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 900, color: resumeScore >= 80 ? "#22c55e" : resumeScore >= 60 ? "#F59E0B" : COLOR }}>
            {resumeScore}%
          </div>
        </div>
        <div style={{ height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${resumeScore}%`, background: `linear-gradient(90deg, ${COLOR}, #22c55e)`, borderRadius: 4, transition: "width 1s ease" }} />
        </div>
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem" }}>
          {[
            { label: "Add Photo",        done: !!user?.avatar },
            { label: "Verify Email",     done: true },
            { label: "Add Skills",       done: false },
            { label: "Get Certified",    done: (stats.certifications || 0) > 0 },
            { label: "Apply 5 Jobs",     done: (stats.totalApplications || 0) >= 5 },
          ].map(step => (
            <div key={step.label} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.7rem", color: step.done ? "#22c55e" : "#52525b" }}>
              {step.done ? <CheckCircle size={11} /> : <Clock size={11} />} {step.label}
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
        {/* Recent Applications */}
        <Widget title="Recent Applications" icon={<Briefcase size={15} />} action={<Link href="/dashboard/jobs" style={{ fontSize: "0.75rem", color: COLOR, textDecoration: "none" }}>View all →</Link>}>
          {!data?.recentApplications?.length
            ? <EmptyState icon="📋" message="No applications yet — start applying!" />
            : data.recentApplications.map((a: any, i: number) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.82rem", color: "#e4e4e7" }}>{a.title}</div>
                  <div style={{ fontSize: "0.72rem", color: "#71717a" }}>{a.company} · {a.type}</div>
                </div>
                <StatusBadge status={a.status} />
              </div>
            ))
          }
        </Widget>

        {/* Career Roadmap */}
        <Widget title="Career Roadmap" icon={<Target size={15} />}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {[
              { step: 1, label: "Complete Profile",        done: true,                                 icon: "👤" },
              { step: 2, label: "Get 1st Certification",   done: (stats.certifications || 0) >= 1,    icon: "🏅" },
              { step: 3, label: "Apply to Internship",     done: (stats.totalApplications || 0) >= 1, icon: "📨" },
              { step: 4, label: "Get Accepted",            done: (stats.acceptedApplications || 0) >= 1, icon: "🎉" },
              { step: 5, label: "Build Portfolio",         done: false,                               icon: "🗂️" },
            ].map(item => (
              <div key={item.step} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: item.done ? "#22c55e20" : "rgba(255,255,255,0.05)", border: `2px solid ${item.done ? "#22c55e" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", flexShrink: 0 }}>
                  {item.done ? "✓" : item.step}
                </div>
                <div style={{ flex: 1, fontSize: "0.82rem", color: item.done ? "#22c55e" : "#71717a", fontWeight: item.done ? 600 : 400 }}>
                  {item.icon} {item.label}
                </div>
              </div>
            ))}
          </div>
        </Widget>
      </div>

      {/* AI Agent */}
      <div style={{ marginBottom: "1.25rem" }}>
        <SectionHeader title="🤖 Internship & Job Recommender" subtitle="AI-matched opportunities for students" />
        <AIOpportunityAgent />
      </div>

      {/* Scholarship / Hackathon opportunities */}
      <Widget title="🏆 Opportunities for Students" icon={<Award size={15} />}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "0.75rem" }}>
          {[
            { icon: "🎖️", title: "Hackathons",  desc: "Win prizes & build portfolio", href: "/events?type=hackathon", color: "#8B5CF6" },
            { icon: "💰", title: "Scholarships", desc: "Funding for your education",   href: "/fund",                  color: "#F59E0B" },
            { icon: "🔬", title: "Research",     desc: "Join research projects",       href: "/innovation",            color: "#0EA5E9" },
            { icon: "📜", title: "Certifications",desc: "Industry-recognized certs",   href: "/certifications",        color: "#22c55e" },
          ].map(item => (
            <Link key={item.title} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{ background: `${item.color}08`, border: `1px solid ${item.color}20`, borderRadius: 12, padding: "0.85rem", cursor: "pointer", transition: "all 0.15s" }}
                   onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
                   onMouseLeave={e => (e.currentTarget.style.transform = "none")}>
                <div style={{ fontSize: "1.25rem", marginBottom: "0.3rem" }}>{item.icon}</div>
                <div style={{ fontWeight: 700, fontSize: "0.82rem", color: item.color }}>{item.title}</div>
                <div style={{ fontSize: "0.72rem", color: "#71717a", marginTop: "0.2rem" }}>{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </Widget>
    </DashboardShell>
  );
}
