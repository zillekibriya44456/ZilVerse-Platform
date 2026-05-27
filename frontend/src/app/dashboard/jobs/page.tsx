"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../dashboard.module.css";
import { useAuth } from "@/context/AuthContext";

const DEMO_JOBS = [
  { id: 1, title: "React Developer", company: "TechNova Pvt Ltd", location: "Bengaluru (Remote)", salary: "₹6–10 LPA", applied: "2025-04-18", status: "Interview Scheduled" },
  { id: 2, title: "Full Stack Intern", company: "StartupHub India", location: "Remote", salary: "₹15,000/month", applied: "2025-04-15", status: "Under Review" },
  { id: 3, title: "Node.js Backend Developer", company: "CloudSoft Solutions", location: "Hyderabad", salary: "₹8–14 LPA", applied: "2025-04-10", status: "Applied" },
  { id: 4, title: "Mobile App Developer (Flutter)", company: "AppFusion", location: "Mumbai (Hybrid)", salary: "₹7–12 LPA", applied: "2025-04-06", status: "Rejected" },
  { id: 5, title: "UI/UX Designer", company: "DesignMind", location: "Bengaluru", salary: "₹5–8 LPA", applied: "2025-04-01", status: "Offer Received" },
];

const statusColor: Record<string, string> = {
  "Interview Scheduled": "badgeBlue",
  "Under Review": "badgeYellow",
  "Applied": "badgePurple",
  "Rejected": "badgeRed",
  "Offer Received": "badgeGreen",
};

export default function JobsPage() {
  const { user } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!user) router.push("/login"); }, [user, router]);
  if (!user) return null;

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>💼 Job Applications</h1>
        <p className={styles.pageSub}>Track all your job applications and their current status</p>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statMini}><span>📨</span><strong>5</strong><p>Total Applied</p></div>
        <div className={styles.statMini}><span>🎤</span><strong>1</strong><p>Interview</p></div>
        <div className={styles.statMini}><span>🎉</span><strong>1</strong><p>Offer Received</p></div>
        <div className={styles.statMini}><span>❌</span><strong>1</strong><p>Rejected</p></div>
      </div>

      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Job Title</th>
              <th>Company</th>
              <th>Location</th>
              <th>Salary</th>
              <th>Applied</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_JOBS.map(j => (
              <tr key={j.id}>
                <td className={styles.bold}>{j.title}</td>
                <td>{j.company}</td>
                <td className={styles.muted}>{j.location}</td>
                <td className={styles.price}>{j.salary}</td>
                <td className={styles.muted}>{j.applied}</td>
                <td>
                  <span className={`${styles.badge} ${styles[statusColor[j.status]]}`}>{j.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
        <Link href="/jobs" className="btn btn-primary">Browse More Jobs →</Link>
      </div>
    </>
  );
}
