"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { socket } from "@/utils/socket";
import { API_BASE } from "@/utils/api";
import {
  Bell, MessageSquare, Search, Settings, LogOut, ChevronDown,
  Zap, Star, Shield, Home, TrendingUp, Users, Briefcase, User
} from "lucide-react";

interface DashboardShellProps {
  children: React.ReactNode;
  activeRole: string;
  onRoleSwitch?: (role: string) => void;
  allRoles?: string[];
  roleMeta: {
    label: string;
    icon: string;
    color: string;
    gradient: string;
  };
}

const ROLE_META: Record<string, { label: string; icon: string; color: string; gradient: string }> = {
  FREELANCER: { label: "Freelancer",      icon: "💼", color: "#8B5CF6", gradient: "linear-gradient(135deg,#8B5CF6,#6D28D9)" },
  STUDENT:    { label: "Student",         icon: "🎓", color: "#3B82F6", gradient: "linear-gradient(135deg,#3B82F6,#1D4ED8)" },
  DEVELOPER:  { label: "Developer",       icon: "⚡", color: "#10B981", gradient: "linear-gradient(135deg,#10B981,#059669)" },
  DESIGNER:   { label: "Designer",        icon: "🎨", color: "#F59E0B", gradient: "linear-gradient(135deg,#F59E0B,#D97706)" },
  STARTUP:    { label: "Startup Founder", icon: "🚀", color: "#EF4444", gradient: "linear-gradient(135deg,#EF4444,#DC2626)" },
  RESEARCHER: { label: "Researcher",      icon: "🔬", color: "#0EA5E9", gradient: "linear-gradient(135deg,#0EA5E9,#0284C7)" },
  MENTOR:     { label: "Mentor",          icon: "🧠", color: "#8B5CF6", gradient: "linear-gradient(135deg,#A855F7,#7C3AED)" },
  EMPLOYER:   { label: "Employer",        icon: "🏢", color: "#6366F1", gradient: "linear-gradient(135deg,#6366F1,#4F46E5)" },
  CREATOR:    { label: "Creator",         icon: "🎬", color: "#EC4899", gradient: "linear-gradient(135deg,#EC4899,#DB2777)" },
};

export function getRoleMeta(role: string) {
  return ROLE_META[role] || { label: role, icon: "👤", color: "#71717a", gradient: "linear-gradient(135deg,#71717a,#52525b)" };
}

export default function DashboardShell({ children, activeRole, onRoleSwitch, allRoles = [] }: DashboardShellProps) {
  const { user, token, logout } = useAuth();
  const [unread, setUnread]         = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQ, setSearchQ]       = useState("");
  const meta = getRoleMeta(activeRole);

  // Real-time unread count via Socket.IO
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(d => setUnread(d.count || 0)).catch(() => {});

    const handleNotif = () => setUnread(n => n + 1);
    socket.on("new_notification", handleNotif);
    return () => { socket.off("new_notification", handleNotif); };
  }, [token]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Top Bar ──────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(9,9,11,0.9)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 1.5rem", height: 60,
        display: "flex", alignItems: "center", gap: "1rem",
      }}>
        {/* Logo + Role Badge */}
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: meta.gradient,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1rem",
          }}>{meta.icon}</div>
          <span style={{ fontWeight: 800, fontSize: "1rem", color: "#f4f4f5" }}>ZilVerse</span>
        </Link>

        <div style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30`, borderRadius: 20, padding: "0.2rem 0.75rem", fontSize: "0.72rem", fontWeight: 700, color: meta.color, flexShrink: 0 }}>
          {meta.icon} {meta.label}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Search */}
        <button onClick={() => setSearchOpen(s => !s)} style={{
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 8, padding: "0.4rem 0.8rem", color: "#71717a", cursor: "pointer",
          display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem",
          transition: "all 0.15s",
        }}>
          <Search size={14} /> Search
          <kbd style={{ fontSize: "0.6rem", background: "rgba(255,255,255,0.1)", borderRadius: 4, padding: "1px 4px", color: "#52525b" }}>⌘K</kbd>
        </button>

        {/* Nav Icons */}
        <Link href="/dashboard/notifications" style={{ position: "relative", padding: "0.5rem", borderRadius: 8, color: "#a1a1aa", display: "flex", alignItems: "center", textDecoration: "none", transition: "color 0.15s" }}>
          <Bell size={18} />
          {unread > 0 && (
            <span style={{
              position: "absolute", top: 2, right: 2,
              background: "#EF4444", color: "#fff", fontSize: "0.6rem", fontWeight: 800,
              borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center",
            }}>{unread > 9 ? "9+" : unread}</span>
          )}
        </Link>

        <Link href="/dashboard/messages" style={{ padding: "0.5rem", borderRadius: 8, color: "#a1a1aa", display: "flex", alignItems: "center", textDecoration: "none" }}>
          <MessageSquare size={18} />
        </Link>

        {/* Role Switcher — shown only for multi-role users */}
        {allRoles.length > 1 && onRoleSwitch && (
          <div style={{ display: "flex", gap: "0.25rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "0.2rem" }}>
            {allRoles.map(r => {
              const rm = getRoleMeta(r);
              return (
                <button key={r} onClick={() => onRoleSwitch(r)} title={rm.label} style={{
                  padding: "0.3rem 0.6rem", borderRadius: 7, border: "none", cursor: "pointer",
                  background: r === activeRole ? rm.color : "transparent",
                  color: r === activeRole ? "#fff" : "#71717a",
                  fontSize: "0.75rem", fontWeight: 700, transition: "all 0.15s",
                }}>
                  {rm.icon}
                </button>
              );
            })}
          </div>
        )}

        {/* Profile Menu */}
        <div style={{ position: "relative" }}>
          <button onClick={() => setProfileOpen(o => !o)} style={{
            display: "flex", alignItems: "center", gap: "0.4rem",
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, padding: "0.35rem 0.6rem", cursor: "pointer", color: "#e4e4e7",
          }}>
            {user?.avatar
              ? <img src={user.avatar} style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }} alt="" />
              : <div style={{ width: 22, height: 22, borderRadius: "50%", background: meta.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.65rem", fontWeight: 800, color: "#fff" }}>{user?.name?.[0]?.toUpperCase()}</div>
            }
            <span style={{ fontSize: "0.78rem", fontWeight: 600, maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name?.split(" ")[0]}</span>
            <ChevronDown size={12} style={{ color: "#52525b" }} />
          </button>

          {profileOpen && (
            <div style={{
              position: "absolute", top: "calc(100% + 8px)", right: 0, minWidth: 180,
              background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
              padding: "0.5rem", boxShadow: "0 16px 40px rgba(0,0,0,0.5)", zIndex: 200,
            }}>
              {[
                { icon: <User size={13} />, label: "My Profile",  href: "/profile" },
                { icon: <Settings size={13} />, label: "Settings", href: "/dashboard/settings" },
                { icon: <Shield size={13} />, label: "Security",   href: "/dashboard/security" },
              ].map(item => (
                <Link key={item.href} href={item.href} onClick={() => setProfileOpen(false)} style={{
                  display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.5rem 0.75rem",
                  borderRadius: 8, color: "#a1a1aa", textDecoration: "none", fontSize: "0.82rem",
                  transition: "all 0.15s",
                }} onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                   onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  {item.icon} {item.label}
                </Link>
              ))}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", margin: "0.4rem 0" }} />
              <button onClick={logout} style={{
                width: "100%", display: "flex", alignItems: "center", gap: "0.6rem",
                padding: "0.5rem 0.75rem", borderRadius: 8, color: "#EF4444",
                background: "none", border: "none", cursor: "pointer", fontSize: "0.82rem", fontFamily: "inherit",
              }}>
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── Search Modal ─────────────────────────────────────────────── */}
      {searchOpen && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 300,
          display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "10vh",
        }} onClick={() => setSearchOpen(false)}>
          <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16, padding: "1rem", width: "90%", maxWidth: 560, boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }}
               onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", borderBottom: "1px solid rgba(255,255,255,0.07)", paddingBottom: "0.75rem" }}>
              <Search size={16} style={{ color: "#71717a" }} />
              <input autoFocus value={searchQ} onChange={e => setSearchQ(e.target.value)}
                placeholder="Search opportunities, projects, people…"
                style={{ flex: 1, background: "none", border: "none", outline: "none", color: "#f4f4f5", fontSize: "0.95rem", fontFamily: "inherit" }} />
              <kbd style={{ fontSize: "0.7rem", background: "rgba(255,255,255,0.08)", borderRadius: 4, padding: "2px 6px", color: "#52525b" }}>Esc</kbd>
            </div>
            <div style={{ padding: "0.75rem 0", color: "#52525b", fontSize: "0.8rem", textAlign: "center" }}>
              Type to search jobs, projects, people…
            </div>
          </div>
        </div>
      )}

      {/* Close profile dropdown on outside click */}
      {profileOpen && <div style={{ position: "fixed", inset: 0, zIndex: 150 }} onClick={() => setProfileOpen(false)} />}

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "2rem 1.5rem" }}>
        {children}
      </main>
    </div>
  );
}
