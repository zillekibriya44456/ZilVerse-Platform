import styles from "./dashboard.module.css";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>ZilVerse</div>
        <nav className={styles.nav}>
          <Link href="/dashboard" className={styles.navItem}>📊 Overview</Link>
          <Link href="/dashboard/messages" className={styles.navItem}>💬 Messages & Chat</Link>
          <Link href="/dashboard/wallet" className={styles.navItem}>💳 Wallet & Payments</Link>
          <Link href="/dashboard/purchases" className={styles.navItem}>🛒 Purchased Items</Link>
          <Link href="/dashboard/orders" className={styles.navItem}>📋 My Orders</Link>
          <Link href="/dashboard/jobs" className={styles.navItem}>💼 Job Applications</Link>
          <Link href="/dashboard/certificates" className={styles.navItem}>🎓 Certificates</Link>
          <Link href="/dashboard/vault" className={styles.navItem}>🔐 Skill Vault</Link>
          <Link href="/dashboard/settings" className={styles.navItem}>⚙️ Settings</Link>
        </nav>
        <div className={styles.sidebarFooter}>
          <Link href="/" className="btn btn-secondary" style={{ width: "100%", fontSize: "0.875rem", textAlign: "center" }}>
            ← Back to Home
          </Link>
        </div>
      </aside>
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
