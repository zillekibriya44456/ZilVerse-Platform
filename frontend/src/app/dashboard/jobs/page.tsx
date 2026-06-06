"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "../dashboard.module.css";
import { useAuth } from "@/context/AuthContext";



const statusColor: Record<string, string> = {
  "Interview Scheduled": "badgeBlue",
  "Under Review": "badgeYellow",
  "Applied": "badgePurple",
  "Rejected": "badgeRed",
  "Offer Received": "badgeGreen",
};

export default function JobsPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<any[]>([]);
  
  useEffect(() => { 
    if (!user) router.push("/login"); 
    else {
      const activeToken = token || localStorage.getItem("zilverse_token") || "";
      if (activeToken) {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/jobs/applications`, {
          headers: { Authorization: `Bearer ${activeToken}` }
        })
        .then(res => res.json())
        .then(data => {
          if(Array.isArray(data)) setApplications(data);
        })
        .catch(err => console.error("Failed to load applications:", err));
      }
    }
  }, [user, router, token]);
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
            {applications.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>No applications found. Apply to jobs to see them here!</td></tr>
            ) : (
              applications.map(app => (
                <tr key={app.id}>
                  <td className={styles.bold}>{app.job?.title || "Unknown Job"}</td>
                  <td>{app.job?.company || "Unknown Company"}</td>
                  <td className={styles.muted}>{app.job?.location || "Remote"}</td>
                  <td className={styles.price}>{app.job?.salary || "-"}</td>
                  <td className={styles.muted}>{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[statusColor[app.status] || "badgePurple"]}`}>{app.status}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
        <Link href="/jobs" className="btn btn-primary">Browse More Jobs →</Link>
      </div>
    </>
  );
}
