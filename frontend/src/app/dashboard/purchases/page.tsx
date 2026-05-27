"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../dashboard.module.css";
import { useAuth } from "@/context/AuthContext";

const DEMO_PURCHASES = [
  { id: "ORD-001", name: "Full E-Commerce Platform", price: 4999, date: "2025-04-20", status: "Delivered", icon: "🛒" },
  { id: "ORD-002", name: "SaaS Starter Boilerplate", price: 7999, date: "2025-04-15", status: "Delivered", icon: "🚀" },
  { id: "ORD-003", name: "Hospital Management System", price: 1499, date: "2025-04-10", status: "Delivered", icon: "🏥" },
  { id: "ORD-004", name: "Admin Dashboard Template", price: 2499, date: "2025-04-05", status: "Processing", icon: "📈" },
];

export default function PurchasesPage() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!user) router.push("/login"); }, [user, router]);
  if (!user) return null;

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>🛒 Purchased Items</h1>
        <p className={styles.pageSub}>All your downloaded projects and source code</p>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableHeader}>
          <span>{DEMO_PURCHASES.length} purchases</span>
          <Link href="/projects" className="btn btn-primary" style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}>
            + Buy More
          </Link>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Project</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_PURCHASES.map(p => (
              <tr key={p.id}>
                <td><code className={styles.orderId}>{p.id}</code></td>
                <td>
                  <div className={styles.projectCell}>
                    <span>{p.icon}</span>
                    <span>{p.name}</span>
                  </div>
                </td>
                <td className={styles.muted}>{p.date}</td>
                <td className={styles.price}>₹{p.price.toLocaleString()}</td>
                <td>
                  <span className={`${styles.badge} ${p.status === "Delivered" ? styles.badgeGreen : styles.badgeYellow}`}>
                    {p.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-secondary" style={{ fontSize: "0.78rem", padding: "0.35rem 0.75rem" }}>
                    ⬇ Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={`glass-panel ${styles.summaryBox}`}>
        <div className={styles.summaryItem}>
          <span>Total Spent</span>
          <strong className={styles.price}>₹{DEMO_PURCHASES.reduce((s, p) => s + p.price, 0).toLocaleString()}</strong>
        </div>
        <div className={styles.summaryItem}>
          <span>Projects Owned</span>
          <strong>{DEMO_PURCHASES.length}</strong>
        </div>
        <div className={styles.summaryItem}>
          <span>Support</span>
          <a href="https://wa.me/917091780179" target="_blank" rel="noreferrer" className="btn btn-primary" style={{ fontSize: "0.85rem" }}>
            💬 WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
