"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";

// Lazy-load all 9 role dashboards
const FreelancerDashboard = dynamic(() => import("./roles/FreelancerDashboard"), { ssr: false });
const StudentDashboard    = dynamic(() => import("./roles/StudentDashboard"),    { ssr: false });
const DeveloperDashboard  = dynamic(() => import("./roles/DeveloperDashboard"),  { ssr: false });
const DesignerDashboard   = dynamic(() => import("./roles/DesignerDashboard"),   { ssr: false });
const StartupDashboard    = dynamic(() => import("./roles/StartupDashboard"),    { ssr: false });
const ResearcherDashboard = dynamic(() => import("./roles/ResearcherDashboard"), { ssr: false });
const MentorDashboard     = dynamic(() => import("./roles/MentorDashboard"),     { ssr: false });
const EmployerDashboard   = dynamic(() => import("./roles/EmployerDashboard"),   { ssr: false });
const CreatorDashboard    = dynamic(() => import("./roles/CreatorDashboard"),    { ssr: false });

// Maps each role string to its dashboard component
const ROLE_DASHBOARDS: Record<string, React.ComponentType<{ allRoles: string[]; onRoleSwitch: (r: string) => void }>> = {
  FREELANCER: FreelancerDashboard,
  STUDENT:    StudentDashboard,
  DEVELOPER:  DeveloperDashboard,
  DESIGNER:   DesignerDashboard,
  STARTUP:    StartupDashboard,
  RESEARCHER: ResearcherDashboard,
  MENTOR:     MentorDashboard,
  EMPLOYER:   EmployerDashboard,
  CREATOR:    CreatorDashboard,
};

// Parse the JSON roles array stored on the user object
function parseRoles(user: any): string[] {
  // Try the roles array first (new system)
  if (user?.roles) {
    try {
      const parsed = typeof user.roles === "string" ? JSON.parse(user.roles) : user.roles;
      if (Array.isArray(parsed) && parsed.length > 0) return parsed.map((r: string) => r.toUpperCase());
    } catch {}
  }
  // Fall back to single role field
  if (user?.role && user.role !== "USER") return [user.role.toUpperCase()];
  return ["FREELANCER"]; // default
}

// Loading skeleton
function DashboardSkeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", display: "flex", flexDirection: "column" }}>
      {/* Skeleton top bar */}
      <div style={{ height: 60, background: "rgba(9,9,11,0.9)", borderBottom: "1px solid rgba(255,255,255,0.06)" }} />
      <div style={{ maxWidth: 1400, margin: "2rem auto", padding: "0 1.5rem", width: "100%" }}>
        {/* Skeleton header */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "2rem" }}>
          <div style={{ width: 120, height: 24, background: "rgba(255,255,255,0.06)", borderRadius: 20 }} />
          <div style={{ width: 300, height: 36, background: "rgba(255,255,255,0.06)", borderRadius: 8 }} />
          <div style={{ width: 200, height: 18, background: "rgba(255,255,255,0.04)", borderRadius: 6 }} />
        </div>
        {/* Skeleton stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1rem", marginBottom: "2rem" }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: 120, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16 }} />
          ))}
        </div>
        {/* Skeleton widgets */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
          {[1,2].map(i => (
            <div key={i} style={{ height: 240, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Role selection screen (for new users / no role set)
function RoleSelector({ onSelect }: { onSelect: (role: string) => void }) {
  const ROLES = [
    { id: "FREELANCER", label: "Freelancer",      icon: "💼", desc: "Offer services & earn",       color: "#8B5CF6" },
    { id: "STUDENT",    label: "Student",          icon: "🎓", desc: "Internships & learning",      color: "#3B82F6" },
    { id: "DEVELOPER",  label: "Developer",        icon: "⚡", desc: "Build & sell projects",       color: "#10B981" },
    { id: "DESIGNER",   label: "Designer",         icon: "🎨", desc: "Create & sell designs",       color: "#F59E0B" },
    { id: "STARTUP",    label: "Startup Founder",  icon: "🚀", desc: "Build & fund startups",       color: "#EF4444" },
    { id: "RESEARCHER", label: "Researcher",       icon: "🔬", desc: "Publish & collaborate",       color: "#0EA5E9" },
    { id: "MENTOR",     label: "Mentor",           icon: "🧠", desc: "Guide & inspire others",      color: "#A855F7" },
    { id: "EMPLOYER",   label: "Employer",         icon: "🏢", desc: "Hire top talent",             color: "#6366F1" },
    { id: "CREATOR",    label: "Creator",          icon: "🎬", desc: "Share content & monetize",    color: "#EC4899" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
      <div style={{ maxWidth: 700, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🌐</div>
          <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#f4f4f5", margin: 0 }}>Choose Your Role</h1>
          <p style={{ color: "#71717a", marginTop: "0.5rem" }}>Select your primary role to customize your dashboard experience.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "0.85rem" }}>
          {ROLES.map(role => (
            <button key={role.id} onClick={() => onSelect(role.id)} style={{
              background: `${role.color}08`, border: `1px solid ${role.color}25`,
              borderRadius: 16, padding: "1.25rem", cursor: "pointer", textAlign: "left",
              transition: "all 0.2s", fontFamily: "inherit",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 8px 24px ${role.color}20`; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "none"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
            >
              <div style={{ fontSize: "1.75rem", marginBottom: "0.5rem" }}>{role.icon}</div>
              <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "#f4f4f5" }}>{role.label}</div>
              <div style={{ fontSize: "0.75rem", color: "#71717a", marginTop: "0.2rem" }}>{role.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, isHydrated } = useAuth();
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<string | null>(null);
  const [allRoles, setAllRoles]     = useState<string[]>([]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) { router.push("/login"); return; }

    const roles = parseRoles(user);
    setAllRoles(roles);

    // Restore last active role from localStorage, or default to first role
    const stored = localStorage.getItem("zilverse_active_role");
    if (stored && roles.includes(stored)) {
      setActiveRole(stored);
    } else {
      setActiveRole(roles[0] ?? null);
    }
  }, [user, isHydrated, router]);

  const handleRoleSwitch = (role: string) => {
    setActiveRole(role);
    localStorage.setItem("zilverse_active_role", role);
  };

  const handleRoleSelect = (role: string) => {
    setAllRoles([role]);
    setActiveRole(role);
    localStorage.setItem("zilverse_active_role", role);
  };

  // Not yet hydrated
  if (!isHydrated || !user) return <DashboardSkeleton />;

  // No role determined yet (loading)
  if (!activeRole) return <DashboardSkeleton />;

  // User has no recognized role — show selector
  if (activeRole === "USER" || !ROLE_DASHBOARDS[activeRole]) {
    return <RoleSelector onSelect={handleRoleSelect} />;
  }

  // Render the appropriate role dashboard
  const RoleDashboard = ROLE_DASHBOARDS[activeRole];
  return <RoleDashboard allRoles={allRoles} onRoleSwitch={handleRoleSwitch} />;
}
