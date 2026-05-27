"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../dashboard.module.css";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!user) router.push("/login"); }, [user, router]);
  if (!user) return null;

  const [saved, setSaved] = useState(false);
  const [notif, setNotif] = useState({ email: true, whatsapp: true, jobs: false, orders: true });
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState("+91 ");

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  return (
    <>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>⚙️ Account Settings</h1>
        <p className={styles.pageSub}>Manage your profile, notifications, and account preferences</p>
      </div>

      {/* Profile Section */}
      <div className={`glass-panel ${styles.settingsSection}`}>
        <h3 className={styles.sectionTitle}>👤 Profile Information</h3>
        <div className={styles.settingsGrid}>
          <div className={styles.settingsField}>
            <label>Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className={styles.settingsField}>
            <label>Email Address</label>
            <input type="email" value={user.email} disabled />
          </div>
          <div className={styles.settingsField}>
            <label>Phone / WhatsApp</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXXXXXXX" />
          </div>
          <div className={styles.settingsField}>
            <label>Account Role</label>
            <input type="text" value={user.role} disabled />
          </div>
        </div>
        <div className={styles.settingsField} style={{ maxWidth: "100%" }}>
          <label>Bio</label>
          <textarea rows={3} placeholder="Tell clients about yourself..." />
        </div>
      </div>

      {/* Notifications */}
      <div className={`glass-panel ${styles.settingsSection}`}>
        <h3 className={styles.sectionTitle}>🔔 Notification Preferences</h3>
        <div className={styles.toggleList}>
          {[
            { key: "email", label: "Email Notifications", desc: "Get updates via email" },
            { key: "whatsapp", label: "WhatsApp Alerts", desc: "Receive order updates on WhatsApp" },
            { key: "jobs", label: "Job Alerts", desc: "Get notified about new job postings" },
            { key: "orders", label: "Order Updates", desc: "Track your orders in real-time" },
          ].map(n => (
            <div key={n.key} className={styles.toggleRow}>
              <div>
                <strong>{n.label}</strong>
                <p className={styles.muted}>{n.desc}</p>
              </div>
              <button
                onClick={() => setNotif(prev => ({ ...prev, [n.key]: !prev[n.key as keyof typeof prev] }))}
                className={`${styles.toggle} ${notif[n.key as keyof typeof notif] ? styles.toggleOn : ""}`}
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className={`glass-panel ${styles.settingsSection}`}>
        <h3 className={styles.sectionTitle}>🔐 Security</h3>
        <div className={styles.settingsGrid}>
          <div className={styles.settingsField}>
            <label>Current Password</label>
            <input type="password" placeholder="••••••••" />
          </div>
          <div className={styles.settingsField}>
            <label>New Password</label>
            <input type="password" placeholder="Min 8 characters" />
          </div>
        </div>
      </div>

      <div className={styles.settingsActions}>
        {saved && <span className={styles.savedMsg}>✅ Settings saved!</span>}
        <button className="btn btn-secondary" onClick={() => { logout(); router.push("/"); }}>
          🚪 Sign Out
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          💾 Save Changes
        </button>
      </div>
    </>
  );
}
