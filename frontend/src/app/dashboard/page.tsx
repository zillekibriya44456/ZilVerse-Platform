"use client";
import { API_BASE } from "@/utils/api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import styles from "./dashboard.module.css";
import { useAuth } from "@/context/AuthContext";
import { MOCK_USER_BADGES } from "@/data/exchange";
import dynamic from "next/dynamic";
import {
  Wallet, Briefcase, Box, MessageSquare, Play,
  RefreshCw, MessageCircle, Star, TrendingUp, Clock,
  ArrowUpRight, Zap, ShieldCheck, ShieldOff, Bell, History
} from "lucide-react";

const DashboardAnalytics = dynamic(() => import("@/components/DashboardAnalytics"), { ssr: false });

function getGreeting(name: string) {
  const hour = new Date().getHours();
  const first = name?.split(" ")[0] || "there";
  if (hour < 12) return `Good morning, ${first} ☀️`;
  if (hour < 17) return `Good afternoon, ${first} 👋`;
  if (hour < 21) return `Good evening, ${first} 🌆`;
  return `Good night, ${first} 🌙`;
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    Pending: styles.badgeYellow,
    PENDING: styles.badgeYellow,
    Applied: styles.badgeBlue,
    Accepted: styles.badgeGreen,
    COMPLETED: styles.badgeGreen,
    Rejected: styles.badgeRed,
    REJECTED: styles.badgeRed,
    Active: styles.badgeGreen,
  };
  return (
    <span className={`${styles.badge} ${colorMap[status] || styles.badgePurple}`}>
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const { user, logout, token } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    const activeToken = token || localStorage.getItem("zilverse_token") || "";
    axios.get(`${API_BASE}/api/dashboard/stats`, {
      headers: { Authorization: `Bearer ${activeToken}` }
    })
      .then(res => setStats(res.data))
      .catch(err => console.error("Dashboard stats failed:", err))
      .finally(() => setLoading(false));
  }, [user, router, token]);

  if (!user) return null;

  const roleLabel = user.role === "SELLER" ? "Seller" : user.role === "FREELANCER" ? "Freelancer" : "Buyer";

  const statCards = [
    {
      icon: <Wallet size={20} />,
      label: "Wallet Balance",
      value: loading ? "..." : `$${(stats?.wallet?.balance || 0).toFixed(2)}`,
      note: `$${(stats?.wallet?.pending || 0).toFixed(2)} pending`,
      color: "#a855f7",
      bg: "rgba(168, 85, 247, 0.12)",
      href: "/dashboard/wallet"
    },
    {
      icon: <Briefcase size={20} />,
      label: "Job Applications",
      value: loading ? "..." : String(stats?.counts?.jobApplications || 0),
      note: "Total submitted",
      color: "#3b82f6",
      bg: "rgba(59, 130, 246, 0.12)",
      href: "/dashboard/jobs"
    },
    {
      icon: <Box size={20} />,
      label: "Listings",
      value: loading ? "..." : String((stats?.counts?.projects || 0) + (stats?.counts?.services || 0)),
      note: `${stats?.counts?.projects || 0} projects · ${stats?.counts?.services || 0} services`,
      color: "#22c55e",
      bg: "rgba(34, 197, 94, 0.12)",
      href: "/projects"
    },
    {
      icon: <MessageSquare size={20} />,
      label: "Messages",
      value: loading ? "..." : String(stats?.counts?.messages || 0),
      note: "Total conversations",
      color: "#06b6d4",
      bg: "rgba(6, 182, 212, 0.12)",
      href: "/dashboard/messages"
    },
    {
      icon: <Play size={20} />,
      label: "InnoReels",
      value: loading ? "..." : String(stats?.counts?.reels || 0),
      note: "Videos published",
      color: "#ec4899",
      bg: "rgba(236, 72, 153, 0.12)",
      href: "/reels"
    },
    {
      icon: <MessageCircle size={20} />,
      label: "Discussions",
      value: loading ? "..." : String(stats?.counts?.discussionPosts || 0),
      note: "Posts authored",
      color: "#f59e0b",
      bg: "rgba(245, 158, 11, 0.12)",
      href: "/discussions"
    },
  ];

  return (
    <>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{getGreeting(user.name)}</h1>
          <p className={styles.subtitle}>
            <span className={styles.roleBadge}>{roleLabel}</span>
            {user.email}
            {user.verified && (
              <span style={{ color: "#22c55e", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                ✓ Verified
              </span>
            )}
          </p>
        </div>
        <button onClick={async () => { await logout(); router.push("/"); }} className="btn btn-secondary">
          Sign Out
        </button>
      </header>

      {/* Live Stats Grid */}
      <div className={styles.grid}>
        {statCards.map((card, idx) => (
          <Link key={idx} href={card.href} style={{ textDecoration: "none" }}>
            <div className={styles.statCard} style={{ borderColor: `${card.color}22`, cursor: "pointer" }}>
              <div style={{
                width: 40, height: 40, borderRadius: "10px",
                background: card.bg, color: card.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: "0.5rem"
              }}>
                {card.icon}
              </div>
              <h3>{card.label}</h3>
              <div className={styles.statValue} style={{ color: card.color }}>
                {card.value}
              </div>
              <p className={styles.statNote}>{card.note}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={`glass-panel ${styles.quickActions}`}>
        <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Zap size={18} color="#f59e0b" /> Quick Actions
        </h2>
        <div className={styles.actionBtns}>
          {user.role === "FREELANCER" ? (
            <>
              <Link href="/projects" className="btn btn-secondary">📦 Sell Project</Link>
              <Link href="/services" className="btn btn-secondary">⚡ Offer Service</Link>
              <Link href="/jobs" className="btn btn-secondary">💼 Find Jobs</Link>
              <Link href="/reels" className="btn btn-secondary">🎬 Upload Reel</Link>
            </>
          ) : (
            <>
              <Link href="/projects" className="btn btn-secondary">📦 Buy Projects</Link>
              <Link href="/freelancers" className="btn btn-secondary">👤 Hire Talent</Link>
              <Link href="/jobs/post" className="btn btn-secondary">📝 Post Job</Link>
            </>
          )}
          <Link href="/exchange" className="btn btn-secondary">🔄 Skills Exchange</Link>
          <Link href="/dashboard/wallet" className="btn btn-primary">💳 Wallet</Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`glass-panel ${styles.activity}`} style={{ marginBottom: "2rem" }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <Clock size={18} color="#a855f7" /> Recent Activity
        </h2>
        {loading ? (
          <div className={styles.emptyState}>
            <div style={{ color: "#a855f7", fontSize: "0.9rem" }}>Loading activity...</div>
          </div>
        ) : !stats?.recentActivity?.length ? (
          <div className={styles.emptyState}>
            <span>🌙</span>
            <p>No recent activity yet. Start exploring the marketplace!</p>
            <Link href="/projects" className="btn btn-primary">Explore Projects</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {stats.recentActivity.map((item: any, idx: number) => (
              <div key={idx} style={{
                display: "flex", alignItems: "center", gap: "1rem",
                padding: "0.85rem 1.25rem",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "10px",
                transition: "background 0.2s"
              }}>
                <span style={{ fontSize: "1.4rem", flexShrink: 0 }}>{item.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: "#e4e4e7", fontSize: "0.875rem", fontWeight: 500, marginBottom: "0.15rem" }}>
                    {item.title}
                  </p>
                  <p style={{ color: "#71717a", fontSize: "0.75rem" }}>
                    {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analytics Chart */}
      <div className={`glass-panel ${styles.analyticsSection}`} style={{ marginBottom: "2rem" }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <TrendingUp size={18} color="#22c55e" /> Performance Overview
        </h2>
        <p className={styles.badgesDesc}>Track your profile views and engagement over time.</p>
        <DashboardAnalytics role={user.role} />
      </div>

      {/* Badges Section */}
      <div className={`glass-panel ${styles.badgesSection}`}>
        <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Star size={18} color="#f59e0b" /> Badges & Recognition
        </h2>
        <p className={styles.badgesDesc}>Earned through learning, collaboration, and global impact.</p>
        <div className={styles.badgesGrid}>
          {MOCK_USER_BADGES.map(badge => (
            <div key={badge.id} className={styles.badgeCard}>
              <div className={styles.badgeIcon}>{badge.icon}</div>
              <div className={styles.badgeInfo}>
                <h4>{badge.name}</h4>
                <p>{badge.description}</p>
                <span className={styles.badgeDate}>Earned: {badge.earnedDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Hub */}
      <div className="glass-panel" style={{ marginTop: "1.5rem", padding: "1.5rem" }}>
        <h2 style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", fontSize: "1rem", color: "#e4e4e7" }}>
          <ShieldCheck size={18} style={{ color: "var(--primary)" }} /> Account Security
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
          {[
            { href: "/dashboard/security", icon: <ShieldCheck size={18} />, label: "2FA & Sessions",   desc: "Manage two-factor auth and active devices", color: "#22c55e" },
            { href: "/dashboard/security", icon: <History size={18} />,      label: "Login History",    desc: "See all your recent login events",          color: "#3b82f6" },
            { href: "/dashboard/privacy",  icon: <ShieldOff size={18} />,    label: "Blocked Users",   desc: "Manage your blocked user list",             color: "#a855f7" },
          ].map(item => (
            <Link key={item.href + item.label} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{
                padding: "1rem", borderRadius: 12,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                display: "flex", alignItems: "flex-start", gap: "0.75rem",
                transition: "border-color 0.2s, background 0.2s",
                cursor: "pointer",
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: `${item.color}18`, color: item.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#e4e4e7", marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: "0.72rem", color: "#71717a", lineHeight: 1.4 }}>{item.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
