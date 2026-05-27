"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./dashboard.module.css";
import { useAuth } from "@/context/AuthContext";
import { MOCK_USER_BADGES } from "@/data/exchange";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const roleLabel = user.role === "SELLER" ? "Seller" : user.role === "FREELANCER" ? "Freelancer" : "Buyer";

  return (
    <>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Good evening, {user.name.split(" ")[0]} 👋</h1>
          <p className={styles.subtitle}>
            <span className={styles.roleBadge}>{roleLabel}</span>
            {user.email}
          </p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">Sign Out</button>
      </header>

      {/* Stats Grid */}
      <div className={styles.grid}>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>💰</span>
          <h3>Total Earnings</h3>
          <div className={styles.statValue}>$0.00</div>
          <p className={styles.statNote}>No transactions yet</p>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>📦</span>
          <h3>Active Projects</h3>
          <div className={styles.statValue}>0</div>
          <p className={styles.statNote}>No active projects</p>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>💼</span>
          <h3>Job Applications</h3>
          <div className={styles.statValue}>0</div>
          <p className={styles.statNote}>No applications yet</p>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statIcon}>⭐</span>
          <h3>Reviews</h3>
          <div className={styles.statValue}>—</div>
          <p className={styles.statNote}>Complete work to earn reviews</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={`glass-panel ${styles.quickActions}`}>
        <h2>Quick Actions</h2>
        <div className={styles.actionBtns}>
          <Link href="/projects" className="btn btn-secondary">Browse Projects</Link>
          <Link href="/freelancers" className="btn btn-secondary">Find Freelancers</Link>
          <Link href="/jobs" className="btn btn-secondary">Browse Jobs</Link>
          <Link href="/exchange" className="btn btn-secondary">Skills Exchange</Link>
        </div>
      </div>

      {/* Badges & Recognition */}
      <div className={`glass-panel ${styles.badgesSection}`}>
        <h2>Badges & Recognition</h2>
        <p className={styles.badgesDesc}>Earned through teaching and global impact projects.</p>
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

      {/* Recent Activity */}
      <div className={`glass-panel ${styles.activity}`}>
        <h2>Recent Activity</h2>
        <div className={styles.emptyState}>
          <span>🌙</span>
          <p>No recent activity yet. Start exploring the marketplace!</p>
          <Link href="/projects" className="btn btn-primary">Explore Projects</Link>
        </div>
      </div>
    </>
  );
}
