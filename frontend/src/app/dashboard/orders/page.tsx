"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../dashboard.module.css";
import { useAuth } from "@/context/AuthContext";

const DEMO_ORDERS = [
  { id: "SVC-101", service: "Website Development", client: "Rahul Kapoor", amount: 15000, due: "2025-05-01", status: "In Progress", progress: 65 },
  { id: "SVC-102", service: "Mobile App UI Design", client: "Priya Sharma", amount: 8000, due: "2025-04-28", status: "Review", progress: 90 },
  { id: "SVC-103", service: "Backend API Development", client: "Zara Noor", amount: 12000, due: "2025-05-10", status: "In Progress", progress: 40 },
  { id: "SVC-104", service: "SEO Optimization", client: "Mohammed Hassan", amount: 5000, due: "2025-04-22", status: "Completed", progress: 100 },
];

const statusColor: Record<string, string> = {
  "In Progress": "badgeBlue",
  "Review": "badgeYellow",
  "Completed": "badgeGreen",
};

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!user) router.push("/login"); }, [user, router]);
  if (!user) return null;

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>📋 My Orders</h1>
        <p className={styles.pageSub}>Track your active service orders and deliverables</p>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statMini}><span>🔄</span><strong>2</strong><p>In Progress</p></div>
        <div className={styles.statMini}><span>👀</span><strong>1</strong><p>Under Review</p></div>
        <div className={styles.statMini}><span>✅</span><strong>1</strong><p>Completed</p></div>
        <div className={styles.statMini}><span>💰</span><strong>₹40,000</strong><p>Total Value</p></div>
      </div>

      <div className={styles.orderCards}>
        {DEMO_ORDERS.map(o => (
          <div key={o.id} className={`glass-panel ${styles.orderCard}`}>
            <div className={styles.orderTop}>
              <div>
                <h3>{o.service}</h3>
                <p className={styles.muted}>Client: {o.client} · Due: {o.due}</p>
              </div>
              <div className={styles.orderRight}>
                <span className={`${styles.badge} ${styles[statusColor[o.status]]}`}>{o.status}</span>
                <strong className={styles.price}>₹{o.amount.toLocaleString()}</strong>
              </div>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${o.progress}%` }} />
            </div>
            <div className={styles.progressLabel}>
              <span className={styles.muted}>Progress</span>
              <span>{o.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
