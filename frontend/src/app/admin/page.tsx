"use client";
import { API_BASE } from "@/utils/api";
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./admin.module.css";
import { socket } from "@/utils/socket";

const API = `${API_BASE}/api/admin`;



const SIDEBAR_ITEMS: { id: string; icon: string; label: string; badge?: string | number }[] = [
  { id: "overview",       icon: "⚡",  label: "Overview" },
  { id: "users",          icon: "👥",  label: "Users" },
  { id: "projects",       icon: "🚀",  label: "Projects" },
  { id: "jobs",           icon: "💼",  label: "Jobs" },
  { id: "applications",   icon: "📋",  label: "Applications" },
  { id: "contacts",       icon: "📬",  label: "Inquiries" },
  { id: "analytics",      icon: "📊",  label: "Analytics" },
  { id: "safety",         icon: "🚨",  label: "Trust & Safety" },
  { id: "moderation",     icon: "🛡️",  label: "Content Moderation" },
  { id: "notifications",  icon: "🔔",  label: "Notifications" },
  { id: "payments",       icon: "💰",  label: "Payments Escrow" },
  { id: "server",         icon: "🖥️",  label: "Server Status" },
];

export default function AdminDashboard() {
  const [token, setToken] = useState<string | null>(null);
  const [loginData, setLoginData] = useState({ email: "", password: "", totpCode: "" });
  const [loginError, setLoginError] = useState("");
  const [activeSection, setActiveSection] = useState("overview");
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [financials, setFinancials] = useState<any>(null);
  
  const [toast, setToast] = useState("");
  const [notify, setNotify] = useState({ title: "", message: "", type: "announcement" });
  const [sentNotifs, setSentNotifs] = useState<any[]>([]);
  const [paySummary, setPaySummary] = useState<any>(null);

  // Trust & Safety state
  const [reports, setReports]         = useState<any[]>([]);
  const [reportsTotal, setReportsTotal] = useState(0);
  const [safetyFilter, setSafetyFilter] = useState<"PENDING"|"REVIEWED"|"DISMISSED"|"ACTION_TAKEN"|"ALL">("PENDING");
  const [safetyUsers, setSafetyUsers] = useState<any[]>([]);
  const [safetyTab, setSafetyTab]     = useState<"reports"|"users">("reports");

  useEffect(() => {
    const t = localStorage.getItem("zv_admin_token");
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;
    const fetchAll = () => {
      axios.get(`${API}/stats`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => { setStats(r.data); setActivity(r.data.activityFeed || []); }).catch(() => {});
      axios.get(`${API}/users`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setUsers(r.data.users || [])).catch(() => {});
      axios.get(`${API}/contacts`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setContacts(r.data)).catch(() => {});
      axios.get(`${API}/notifications`)
        .then(r => setSentNotifs(r.data)).catch(() => {});
      axios.get(`${API_BASE}/api/payments/admin/summary`)
        .then(r => setPaySummary(r.data)).catch(() => {});
      axios.get(`${API}/projects`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setProjects(r.data)).catch(() => {});
      axios.get(`${API}/jobs`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setJobs(r.data)).catch(() => {});
      axios.get(`${API}/applications`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setApplications(r.data)).catch(() => {});
      axios.get(`${API}/analytics`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setAnalytics(r.data)).catch(() => {});
      axios.get(`${API}/financials`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setFinancials(r.data)).catch(() => {});
    };

    fetchAll();

    // Load safety data
    axios.get(`${API_BASE}/api/safety/reports?status=PENDING&page=1`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { setReports(r.data.data || []); setReportsTotal(r.data.total || 0); }).catch(() => {});
    axios.get(`${API_BASE}/api/safety/admin/users?page=1`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setSafetyUsers(r.data.data || [])).catch(() => {});

    // Socket listeners for real-time admin sync
    const handlePayUpdate = () => {
      console.log("[SOCKET] Payment action triggered, reloading summary...");
      axios.get(`${API_BASE}/api/payments/admin/summary`)
        .then(r => setPaySummary(r.data)).catch(() => {});
    };

    const handleNotifUpdate = (newNotif: any) => {
      console.log("[SOCKET] New global notification dispatched:", newNotif);
      setSentNotifs(prev => [newNotif, ...prev]);
    };

    const handleNewUser = (data: any) => {
      console.log("[SOCKET] New user registered:", data);
      setStats((prev: any) => prev ? { ...prev, totalUsers: (prev.totalUsers || 0) + 1 } : null);
      setActivity(prev => [
        { icon: "👥", text: `New user registered: ${data.name || data.email}`, color: "#7c3aed", time: new Date().toISOString() },
        ...prev
      ]);
      showToast(`👥 New user registered: ${data.name || data.email}`);
    };

    const handleNewApplication = (data: any) => {
      console.log("[SOCKET] New job application received:", data);
      setActivity(prev => [
        { icon: "📋", text: `New job application submitted`, color: "#22d3ee", time: new Date().toISOString() },
        ...prev
      ]);
      setApplications(prev => [data, ...prev]);
      showToast(`📋 New job application submitted`);
    };

    const handleNewReport = (data: any) => {
      console.log("[SOCKET] New safety report filed:", data);
      setReports(prev => [data, ...prev]);
      setReportsTotal(prev => prev + 1);
      setActivity(prev => [
        { icon: "🚨", text: `Safety Report Filed: ${data.reason}`, color: "#ef4444", time: new Date().toISOString() },
        ...prev
      ]);
      showToast(`🚨 ALERT: New safety report filed for: ${data.reason}`);
    };

    const handleNewOrder = (data: any) => {
      console.log("[SOCKET] New payment order completed:", data);
      setStats((prev: any) => prev ? { ...prev, totalRevenue: (prev.totalRevenue || 0) + data.amount } : null);
      setActivity(prev => [
        { icon: "💰", text: `Order completed: $${data.amount.toFixed(2)} - ${data.description}`, color: "#10b981", time: new Date().toISOString() },
        ...prev
      ]);
      showToast(`💰 Payment Received: $${data.amount.toFixed(2)}`);
    };

    socket.connect();
    socket.on('admin_payment_update', handlePayUpdate);
    socket.on('new_notification', handleNotifUpdate);
    socket.on('new_user', handleNewUser);
    socket.on('new_application', handleNewApplication);
    socket.on('new_report', handleNewReport);
    socket.on('new_order', handleNewOrder);

    return () => {
      socket.off('admin_payment_update', handlePayUpdate);
      socket.off('new_notification', handleNotifUpdate);
      socket.off('new_user', handleNewUser);
      socket.off('new_application', handleNewApplication);
      socket.off('new_report', handleNewReport);
      socket.off('new_order', handleNewOrder);
    };
  }, [token]);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const handleLogin = async () => {
    setLoginError("");
    try {
      const r = await axios.post(`${API}/login`, loginData);
      localStorage.setItem("zv_admin_token", r.data.token);
      setToken(r.data.token);
    } catch (e: any) {
      setLoginError(e.response?.data?.error || "Login failed");
    }
  };

  const handleLogout = () => { localStorage.removeItem("zv_admin_token"); setToken(null); };

  const handleSendNotify = async () => {
    if (!notify.title || !notify.message) return showToast("Please fill in title and message!");
    try {
      await axios.post(`${API}/notify`, notify, { headers: { Authorization: `Bearer ${token}` } });
      showToast("✅ Notification sent to all users!");
      setNotify({ title: "", message: "", type: "announcement" });
      const r = await axios.get(`${API}/notifications`);
      setSentNotifs(r.data);
    } catch {
      showToast("❌ Failed to send notification.");
    }
  };

  const handleDeleteNotif = async (id: string) => {
    try {
      await axios.delete(`${API}/notifications/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      showToast("Notification dismissed from website!");
      setSentNotifs(prev => prev.filter(n => n.id !== id));
    } catch {
      showToast("Failed to delete notification.");
    }
  };

  const handleLoadPaySummary = () => {
    axios.get(`${API_BASE}/api/payments/admin/summary`)
      .then(r => setPaySummary(r.data)).catch(() => {});
  };

  const handleApproveWithdrawal = async (id: string) => {
    try {
      await axios.post(`${API_BASE}/api/payments/admin/withdrawals/${id}/approve`);
      showToast("Withdrawal approved successfully!");
      handleLoadPaySummary();
    } catch {
      showToast("Failed to approve withdrawal.");
    }
  };

  const handleRejectWithdrawal = async (id: string) => {
    try {
      await axios.post(`${API_BASE}/api/payments/admin/withdrawals/${id}/reject`);
      showToast("Withdrawal rejected & refunded!");
      handleLoadPaySummary();
    } catch {
      showToast("Failed to reject withdrawal.");
    }
  };

  const handleResolveDispute = async (id: string, resolution: string) => {
    try {
      await axios.post(`${API_BASE}/api/payments/admin/disputes/${id}/resolve`, { resolution });
      showToast(`Dispute resolved in favor of ${resolution.toLowerCase()}!`);
      handleLoadPaySummary();
    } catch {
      showToast("Failed to resolve dispute.");
    }
  };

  if (!token) return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.loginLogo}>
          <h1>⚡ ZilVerse</h1>
          <p>Super Admin Control Center</p>
        </div>
        {loginError && <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", color: "#f87171", padding: ".8rem 1rem", borderRadius: "8px", marginBottom: "1rem", fontSize: ".88rem" }}>{loginError}</div>}
        <div className={styles.formGroup}><label>Admin Email</label><input type="email" placeholder="admin@zilverse.com" value={loginData.email} onChange={e => setLoginData({ ...loginData, email: e.target.value })} /></div>
        <div className={styles.formGroup}><label>Password</label><input type="password" placeholder="••••••••" value={loginData.password} onChange={e => setLoginData({ ...loginData, password: e.target.value })} /></div>
        <div className={styles.formGroup}><label>2FA Code</label><input type="text" placeholder="Enter 2FA code" value={loginData.totpCode} onChange={e => setLoginData({ ...loginData, totpCode: e.target.value })} /></div>
        <button className={styles.loginBtn} onClick={handleLogin}>Access Control Center →</button>
        <p className={styles.loginHint}>Demo: admin@zilverse.com / Zil@Admin2026 / 2FA26</p>
      </div>
    </div>
  );

  const allUsers = users;
  const allContacts = contacts;
  const BARS = financials?.monthlyBreakdown?.map((m: any) => (m.revenue / (Math.max(...financials.monthlyBreakdown.map((x: any) => x.revenue)) || 1)) * 100) || [0,0,0,0,0,0,0,0,0,0,0,0];

  return (
    <div className={styles.shell}>
      {toast && <div className={styles.toast}>✅ {toast}</div>}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}><h2>⚡ ZilVerse</h2><span>Super Admin Panel</span></div>
        <div className={styles.navSection}>
          <div className={styles.navLabel}>Control Center</div>
          {SIDEBAR_ITEMS.map(item => (
            <div key={item.id} className={`${styles.navItem} ${activeSection === item.id ? styles.active : ""}`} onClick={() => setActiveSection(item.id)}>
              <span className={styles.navIcon}>{item.icon}</span>{item.label}
              {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
            </div>
          ))}
        </div>
        <div style={{ marginTop: "auto", padding: "1rem 1.5rem", borderTop: "1px solid rgba(255,255,255,.05)" }}>
          <div style={{ color: "#52525b", fontSize: ".75rem", marginBottom: ".5rem" }}>Signed in as</div>
          <div style={{ color: "#a78bfa", fontWeight: 700, fontSize: ".85rem" }}>Super Admin</div>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <h1>{SIDEBAR_ITEMS.find(s => s.id === activeSection)?.label || "Dashboard"}</h1>
            <p>ZilVerse Global Platform — Enterprise Control</p>
          </div>
          <div className={styles.topbarRight}>
            <div className={styles.statusPill}><span className={styles.statusDot}></span>Live</div>
            <button className={styles.logoutBtn} onClick={handleLogout}>Sign Out</button>
          </div>
        </div>

        {activeSection === "overview" && (
          <>
            <div className={styles.statsGrid}>
              {[
                { icon: "👥", label: "Total Users", value: stats?.totalUsers || "0", change: stats?.monthlyGrowth || "+0%", up: true, accent: "linear-gradient(90deg,#7c3aed,#a78bfa)" },
                { icon: "🌐", label: "Live Visitors", value: stats?.liveVisitors || "0", change: "Real-time", up: true, accent: "linear-gradient(90deg,#0891b2,#22d3ee)" },
                { icon: "💼", label: "Active Freelancers", value: stats?.totalFreelancers || "0", change: "Active Profiles", up: true, accent: "linear-gradient(90deg,#7c3aed,#22d3ee)" },
                { icon: "🚀", label: "Total Projects", value: stats?.totalProjects || "0", change: "Live", up: true, accent: "linear-gradient(90deg,#059669,#34d399)" },
                { icon: "💰", label: "Total Revenue", value: `$${stats?.totalRevenue?.toLocaleString() || "0"}`, change: "All Time", up: true, accent: "linear-gradient(90deg,#d97706,#fbbf24)" },
                { icon: "💬", label: "Discussions", value: stats?.totalDiscussions || "0", change: "Community", up: true, accent: "linear-gradient(90deg,#db2777,#f472b6)" },
                { icon: "📋", label: "Open Jobs", value: stats?.totalJobs || "0", change: "Posted", up: true, accent: "linear-gradient(90deg,#7c3aed,#a78bfa)" },
                { icon: "⚡", label: "Uptime", value: stats?.uptime || "100%", change: "Since boot", up: true, accent: "linear-gradient(90deg,#0891b2,#22d3ee)" },
              ].map((s, i) => (
                <div key={i} className={styles.statCard} style={{ "--card-accent": s.accent } as any}>
                  <div className={styles.statIcon}>{s.icon}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                  <div className={styles.statValue}>{s.value}</div>
                  <div className={`${styles.statChange} ${s.up ? styles.up : styles.down}`}>{s.up ? "▲" : "▼"} {s.change}</div>
                </div>
              ))}
            </div>

            <div className={styles.analyticsGrid} style={{ marginBottom: "2rem" }}>
              <div className={styles.analyticsCard}>
                <h3>📊 Monthly Revenue (2026)</h3>
                <div className={styles.barChart}>
                  {BARS.map((h: number, i: number) => <div key={i} className={styles.bar} style={{ height: `${h}%` }} />)}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: ".5rem" }}>
                  {financials?.monthlyBreakdown?.map((m: any) => (
                    <span key={m.month} style={{ color: "#52525b", fontSize: ".65rem" }}>{m.month}</span>
                  )) || ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map(m => (
                    <span key={m} style={{ color: "#52525b", fontSize: ".65rem" }}>{m}</span>
                  ))}
                </div>
              </div>
              <div className={styles.analyticsCard}>
                <h3>🌍 Top Countries</h3>
                {[["🇵🇰 Pakistan","32%",32],["🇮🇳 India","24%",24],["🇺🇸 USA","18%",18],["🇬🇧 UK","10%",10],["🇳🇬 Nigeria","8%",8],["🌐 Others","8%",8]].map(([c, p, w]) => (
                  <div key={String(c)} style={{ marginBottom: ".7rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#d4d4d8", fontSize: ".85rem", marginBottom: ".3rem" }}><span>{c}</span><span style={{ color: "#a78bfa" }}>{p}</span></div>
                    <div style={{ height: "4px", background: "rgba(255,255,255,.08)", borderRadius: "2px" }}>
                      <div style={{ height: "100%", width: `${w}%`, background: "linear-gradient(90deg,#7c3aed,#22d3ee)", borderRadius: "2px" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}><span className={styles.sectionTitle}>⚡ Live Activity Feed</span><span className={styles.sectionBadge}>Real-time</span></div>
              <div className={styles.activityFeed}>
                {activity.length === 0 ? <p style={{color: "#52525b", padding: "1rem"}}>No recent activity.</p> : activity.map((a, i) => (
                  <div key={i} className={styles.activityItem}>
                    <div className={styles.activityDot} style={{ background: a.color }} />
                    <div><div className={styles.activityText}>{a.icon} {a.text}</div><div className={styles.activityTime}>{new Date(a.time).toLocaleString()}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeSection === "users" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}><span className={styles.sectionTitle}>All Users</span><span className={styles.sectionBadge}>{allUsers.length} total</span></div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                <tbody>
                  {allUsers.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600, color: "#fff" }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className={styles.badge + " " + styles.badgeBlue}>{u.role || "User"}</span></td>
                      <td><span className={`${styles.badge} ${u.status === "Suspended" ? styles.badgeRed : u.status === "Verified" ? styles.badgeGreen : styles.badgeBlue}`}>{u.status || "Active"}</span></td>
                      <td>{u.joined || new Date(u.createdAt).toLocaleDateString()}</td>
                      <td style={{ display: "flex", gap: ".5rem" }}>
                        <button className={`${styles.actionBtn} ${styles.btnPrimary}`}>Edit</button>
                        <button className={`${styles.actionBtn} ${styles.btnDanger}`}>Suspend</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === "contacts" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}><span className={styles.sectionTitle}>Inquiries & Contact</span><span className={styles.sectionBadge}>{allContacts.length} messages</span></div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Name</th><th>Email</th><th>Subject</th><th>Message</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>
                  {allContacts.map((c: any) => (
                    <tr key={c.id}>
                      <td style={{ color: "#fff", fontWeight: 600 }}>{c.name}</td>
                      <td>{c.email}</td>
                      <td><span className={styles.badge + " " + styles.badgePurple}>{c.subject}</span></td>
                      <td style={{ maxWidth: "240px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.message}</td>
                      <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
                      <td><button className={`${styles.actionBtn} ${styles.btnPrimary}`}>Reply</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === "analytics" && (
          <div>
            <div className={styles.analyticsGrid} style={{ marginBottom: "1.5rem" }}>
              <div className={styles.analyticsCard}>
                <h3>📊 Revenue Trend</h3>
                <div className={styles.barChart}>{[60,75,55,85,70,95,80,100,88,72,90,95].map((h,i)=><div key={i} className={styles.bar} style={{height:`${h}%`}}/>)}</div>
              </div>
              <div className={styles.analyticsCard}>
                <h3>👥 User Growth (Last 30 Days)</h3>
                <div className={styles.barChart}>{analytics?.userGrowth?.map((g: any, i: number) => {
                  const maxGrowth = Math.max(...analytics.userGrowth.map((x: any) => x.count)) || 1;
                  const h = (g.count / maxGrowth) * 100;
                  return <div key={i} className={styles.bar} style={{height:`${h}%`,background:"linear-gradient(180deg,#22d3ee,#0891b2)"}} title={`${g.date}: ${g.count} users`}/>;
                }) || []}</div>
              </div>
            </div>
            <div className={styles.mapBox}>
              <div className={styles.mapGlow}/>
              <div className={styles.mapLabel}>🌍 Global Activity Map</div>
              <div className={styles.mapDots}>Active in 48 countries · 342 live visitors · 127 active sessions</div>
              <div style={{ display:"flex", gap:"1.5rem", marginTop:"1.5rem", zIndex:1, position:"relative", flexWrap:"wrap", justifyContent:"center" }}>
                {[["🇵🇰","Karachi","89 users"],["🇮🇳","Mumbai","64 users"],["🇺🇸","New York","52 users"],["🇬🇧","London","38 users"],["🇦🇪","Dubai","31 users"]].map(([f,c,u])=>(
                  <div key={String(c)} style={{ textAlign:"center" }}>
                    <div style={{ fontSize:"1.5rem" }}>{f}</div>
                    <div style={{ color:"#22d3ee", fontSize:".78rem", fontWeight:700 }}>{c}</div>
                    <div style={{ color:"#52525b", fontSize:".72rem" }}>{u}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Trust & Safety Tab ── */}
        {activeSection === "safety" && (
          <div>
            {/* Sub-tabs */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
              {(["reports", "users"] as const).map(t => (
                <button key={t} onClick={() => setSafetyTab(t)} style={{
                  padding: "0.55rem 1.25rem", borderRadius: 8, border: "none", cursor: "pointer",
                  background: safetyTab === t ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.04)",
                  color: safetyTab === t ? "#ef4444" : "#71717a",
                  fontWeight: 700, fontSize: "0.82rem", fontFamily: "inherit", textTransform: "capitalize",
                }}>{t === "reports" ? `📋 User Reports (${reportsTotal})` : "⚡ Fraud Dashboard"}</button>
              ))}
            </div>

            {/* Reports sub-tab */}
            {safetyTab === "reports" && (
              <div>
                {/* Status filters */}
                <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                  {(["PENDING","REVIEWED","DISMISSED","ACTION_TAKEN","ALL"] as const).map(s => (
                    <button key={s} onClick={() => {
                      setSafetyFilter(s);
                      axios.get(`${API_BASE}/api/safety/reports?status=${s}&page=1`, { headers: { Authorization: `Bearer ${token}` } })
                        .then(r => { setReports(r.data.data || []); setReportsTotal(r.data.total || 0); }).catch(() => {});
                    }} style={{
                      padding: "0.4rem 0.85rem", borderRadius: 999, border: "1px solid",
                      cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, fontFamily: "inherit",
                      borderColor: safetyFilter === s ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)",
                      background: safetyFilter === s ? "rgba(239,68,68,0.12)" : "transparent",
                      color: safetyFilter === s ? "#ef4444" : "#71717a",
                    }}>{s}</button>
                  ))}
                </div>

                {reports.length === 0 ? (
                  <div style={{ padding: "3rem", textAlign: "center", color: "#52525b" }}>No reports found for this status.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {reports.map((r: any) => (
                      <div key={r.id} style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        borderRadius: 14, padding: "1.25rem",
                      }}>
                        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-start", flexWrap: "wrap" }}>
                          {/* Reporter */}
                          <div style={{ flex: 1, minWidth: 220 }}>
                            <div style={{ fontSize: "0.7rem", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Reporter</div>
                            <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#e4e4e7" }}>{r.reporter?.name || "Unknown"}</div>
                            <div style={{ fontSize: "0.72rem", color: "#71717a" }}>{r.reporter?.email}</div>
                          </div>
                          {/* Arrow */}
                          <div style={{ color: "#ef4444", fontSize: "1.2rem", paddingTop: 16 }}>→</div>
                          {/* Reported */}
                          <div style={{ flex: 1, minWidth: 220 }}>
                            <div style={{ fontSize: "0.7rem", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Reported User</div>
                            <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#e4e4e7" }}>{r.reportedUser?.name || "Unknown"}</div>
                            <div style={{ fontSize: "0.72rem", color: "#71717a" }}>{r.reportedUser?.email}</div>
                            <div style={{ fontSize: "0.7rem", marginTop: 4 }}>
                              <span style={{ color: r.reportedUser?.isBanned ? "#ef4444" : r.reportedUser?.isSuspended ? "#f59e0b" : "#22c55e", fontWeight: 700 }}>
                                {r.reportedUser?.isBanned ? "🔴 Banned" : r.reportedUser?.isSuspended ? "🟡 Suspended" : "🟢 Active"}
                              </span>
                              <span style={{ color: "#52525b", marginLeft: 8 }}>Trust: {r.reportedUser?.trustScore ?? 100}</span>
                            </div>
                          </div>
                          {/* Reason + details */}
                          <div style={{ flex: 2, minWidth: 200 }}>
                            <div style={{ fontSize: "0.7rem", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Reason</div>
                            <span style={{ padding: "0.3rem 0.75rem", borderRadius: 999, background: "rgba(239,68,68,0.12)", color: "#ef4444", fontSize: "0.75rem", fontWeight: 700 }}>{r.reason}</span>
                            {r.details && <div style={{ fontSize: "0.75rem", color: "#a1a1aa", marginTop: 6 }}>{r.details}</div>}
                            <div style={{ fontSize: "0.65rem", color: "#52525b", marginTop: 6 }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        {r.status === "PENDING" && (
                          <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
                            <button onClick={() => {
                              axios.post(`${API_BASE}/api/safety/admin/suspend/${r.reportedUserId}`, { reason: r.reason }, { headers: { Authorization: `Bearer ${token}` } })
                                .then(() => { showToast(`${r.reportedUser?.name} suspended`); setReports(prev => prev.filter(x => x.id !== r.id)); }).catch(() => showToast("Failed"));
                            }} style={{ padding: "0.45rem 1rem", borderRadius: 8, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, fontFamily: "inherit" }}>⚠️ Suspend</button>
                            <button onClick={() => {
                              axios.post(`${API_BASE}/api/safety/admin/ban/${r.reportedUserId}`, { reason: r.reason }, { headers: { Authorization: `Bearer ${token}` } })
                                .then(() => { showToast(`${r.reportedUser?.name} banned`); setReports(prev => prev.filter(x => x.id !== r.id)); }).catch(() => showToast("Failed"));
                            }} style={{ padding: "0.45rem 1rem", borderRadius: 8, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, fontFamily: "inherit" }}>🔨 Ban</button>
                            <button onClick={() => {
                              axios.post(`${API_BASE}/api/safety/reports/${r.id}/review`, { status: "REVIEWED" }, { headers: { Authorization: `Bearer ${token}` } })
                                .then(() => { showToast("Marked reviewed"); setReports(prev => prev.filter(x => x.id !== r.id)); }).catch(() => {});
                            }} style={{ padding: "0.45rem 1rem", borderRadius: 8, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, fontFamily: "inherit" }}>✓ Review Only</button>
                            <button onClick={() => {
                              axios.post(`${API_BASE}/api/safety/reports/${r.id}/review`, { status: "DISMISSED" }, { headers: { Authorization: `Bearer ${token}` } })
                                .then(() => { showToast("Dismissed"); setReports(prev => prev.filter(x => x.id !== r.id)); }).catch(() => {});
                            }} style={{ padding: "0.45rem 1rem", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#71717a", cursor: "pointer", fontSize: "0.78rem", fontFamily: "inherit" }}>Dismiss</button>
                          </div>
                        )}
                        {r.status !== "PENDING" && (
                          <div style={{ marginTop: 8, fontSize: "0.72rem", color: "#52525b" }}>Status: <span style={{ color: r.status === "ACTION_TAKEN" ? "#ef4444" : r.status === "REVIEWED" ? "#22c55e" : "#71717a", fontWeight: 700 }}>{r.status}</span></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Fraud users sub-tab */}
            {safetyTab === "users" && (
              <div>
                <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                  {(["banned","suspended","low-trust",""] as const).map(f => (
                    <button key={f} onClick={() => {
                      axios.get(`${API_BASE}/api/safety/admin/users${f ? `?filter=${f}` : ""}`, { headers: { Authorization: `Bearer ${token}` } })
                        .then(r => setSafetyUsers(r.data.data || [])).catch(() => {});
                    }} style={{
                      padding: "0.4rem 0.85rem", borderRadius: 999, border: "1px solid rgba(255,255,255,0.08)",
                      cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, fontFamily: "inherit",
                      background: "transparent", color: f ? "#a1a1aa" : "#71717a",
                    }}>{f === "banned" ? "🔴 Banned" : f === "suspended" ? "🟡 Suspended" : f === "low-trust" ? "⚠️ Low Trust" : "All Users"}</button>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {safetyUsers.map((u: any) => (
                    <div key={u.id} style={{
                      background: "rgba(255,255,255,0.02)",
                      border: `1px solid ${u.isBanned ? "rgba(239,68,68,0.15)" : u.isSuspended ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.06)"}`,
                      borderRadius: 12, padding: "1rem 1.25rem",
                      display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap",
                    }}>
                      <div style={{ flex: 1, minWidth: 200 }}>
                        <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#e4e4e7" }}>{u.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "#71717a" }}>{u.email}</div>
                        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                          <span style={{ fontSize: "0.68rem", color: u.isBanned ? "#ef4444" : u.isSuspended ? "#f59e0b" : "#22c55e", fontWeight: 700 }}>
                            {u.isBanned ? "Banned" : u.isSuspended ? "Suspended" : "Active"}
                          </span>
                          <span style={{ fontSize: "0.68rem", color: "#71717a" }}>Trust Score: {u.trustScore}</span>
                        </div>
                        {u.suspendedReason && <div style={{ fontSize: "0.68rem", color: "#f59e0b", marginTop: 2 }}>Reason: {u.suspendedReason}</div>}
                      </div>
                      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                        {!u.isBanned && !u.isSuspended && (
                          <>
                            <button onClick={() => {
                              axios.post(`${API_BASE}/api/safety/admin/suspend/${u.id}`, { reason: "Admin action" }, { headers: { Authorization: `Bearer ${token}` } })
                                .then(() => { showToast(`${u.name} suspended`); setSafetyUsers(prev => prev.map(x => x.id === u.id ? { ...x, isSuspended: true } : x)); }).catch(() => {});
                            }} style={{ padding: "0.4rem 0.75rem", borderRadius: 7, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", color: "#f59e0b", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700, fontFamily: "inherit" }}>Suspend</button>
                            <button onClick={() => {
                              axios.post(`${API_BASE}/api/safety/admin/ban/${u.id}`, { reason: "Admin action" }, { headers: { Authorization: `Bearer ${token}` } })
                                .then(() => { showToast(`${u.name} banned`); setSafetyUsers(prev => prev.map(x => x.id === u.id ? { ...x, isBanned: true } : x)); }).catch(() => {});
                            }} style={{ padding: "0.4rem 0.75rem", borderRadius: 7, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700, fontFamily: "inherit" }}>Ban</button>
                          </>
                        )}
                        {(u.isBanned || u.isSuspended) && (
                          <button onClick={() => {
                            axios.post(`${API_BASE}/api/safety/admin/restore/${u.id}`, {}, { headers: { Authorization: `Bearer ${token}` } })
                              .then(() => { showToast(`${u.name} restored`); setSafetyUsers(prev => prev.map(x => x.id === u.id ? { ...x, isBanned: false, isSuspended: false } : x)); }).catch(() => {});
                          }} style={{ padding: "0.4rem 0.75rem", borderRadius: 7, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700, fontFamily: "inherit" }}>Restore</button>
                        )}
                      </div>
                    </div>
                  ))}
                  {safetyUsers.length === 0 && <div style={{ textAlign: "center", color: "#52525b", padding: "2rem" }}>No users in this category.</div>}
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === "moderation" && (
          <div>
            <div className={styles.aiPanel} style={{ marginBottom: "1.5rem" }}>
              <h3>🤖 AI Moderation Engine</h3>
              {stats && (
                <>
                  <div className={styles.aiInsight}>
                    <span style={{ fontSize: "1.2rem" }}>🚀</span>
                    <p>User growth trend is positive with a {stats.monthlyGrowth} increase in the last 30 days.</p>
                  </div>
                  <div className={styles.aiInsight}>
                    <span style={{ fontSize: "1.2rem" }}>🛡️</span>
                    <p>{stats.openDisputes} active escrow disputes detected requiring attention.</p>
                  </div>
                  <div className={styles.aiInsight}>
                    <span style={{ fontSize: "1.2rem" }}>📈</span>
                    <p>Total Revenue is ${stats.totalRevenue}, with ${stats.escrowHeld} currently held securely in active escrows.</p>
                  </div>
                </>
              )}
            </div>
            <div className={styles.section}>
              <div className={styles.sectionHeader}><span className={styles.sectionTitle}>🚨 Flagged Content</span><span className={styles.sectionBadge}>AI Detected</span></div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead><tr><th>Type</th><th>Content</th><th>Risk Level</th><th>Action</th></tr></thead>
                  <tbody>
                    {[
                      ["Fake User","Account @user4821 posted 12 jobs in 1hr","High"],
                      ["Spam Listing","Duplicate service posted 8x in 24hrs","Medium"],
                      ["Fraud Pattern","Unusual payment withdrawals detected","Critical"],
                      ["Plagiarism","Portfolio content copied from external site","Low"],
                    ].map(([t,c,r],i)=>(
                      <tr key={i}>
                        <td><span className={styles.badge + " " + styles.badgePurple}>{t}</span></td>
                        <td>{c}</td>
                        <td><span className={`${styles.badge} ${r==="Critical"||r==="High"?styles.badgeRed:r==="Medium"?styles.badgeYellow:styles.badgeBlue}`}>{r}</span></td>
                        <td style={{ display:"flex", gap:".5rem" }}>
                          <button className={`${styles.actionBtn} ${styles.btnDanger}`} onClick={()=>showToast("Content removed!")}>Remove</button>
                          <button className={`${styles.actionBtn} ${styles.btnPrimary}`} onClick={()=>showToast("Marked as reviewed")}>Ignore</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSection === "notifications" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}><span className={styles.sectionTitle}>📤 Send Global Notification</span><span className={styles.sectionBadge}>{sentNotifs.length} active</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "start" }}>
              {/* Send Form */}
              <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:"16px", padding:"2rem" }}>
                <h3 style={{ color:"#a78bfa", marginBottom:"1.2rem", fontSize:".9rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".05em" }}>Compose Message</h3>
                <div className={styles.notifyForm}>
                  <select value={notify.type} onChange={e=>setNotify({...notify,type:e.target.value})}>
                    <option value="announcement">📢 Announcement</option>
                    <option value="maintenance">🔧 Maintenance Alert</option>
                    <option value="update">🚀 Platform Update</option>
                    <option value="warning">⚠️ Warning</option>
                  </select>
                  <input placeholder="Notification Title *" value={notify.title} onChange={e=>setNotify({...notify,title:e.target.value})} />
                  <textarea placeholder="Message content *" value={notify.message} onChange={e=>setNotify({...notify,message:e.target.value})} />
                  <button className={styles.sendBtn} onClick={handleSendNotify}>📤 Broadcast to All Users</button>
                </div>
              </div>

              {/* Sent Notifications List */}
              <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:"16px", padding:"2rem" }}>
                <h3 style={{ color:"#a78bfa", marginBottom:"1.2rem", fontSize:".9rem", fontWeight:700, textTransform:"uppercase", letterSpacing:".05em" }}>Live on Website</h3>
                {sentNotifs.length === 0 ? (
                  <div style={{ color:"#52525b", fontSize:".88rem", textAlign:"center", padding:"2rem 0" }}>No active notifications.<br/>Send one to display it on the website.</div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:".8rem" }}>
                    {sentNotifs.map((n:any) => (
                      <div key={n.id} style={{ background:"rgba(0,0,0,.3)", border:"1px solid rgba(139,92,246,.15)", borderRadius:"12px", padding:"1rem" }}>
                        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:".5rem" }}>
                          <div>
                            <div style={{ color:"#fff", fontWeight:700, fontSize:".88rem", marginBottom:".3rem" }}>
                              {n.type === "announcement" ? "📢" : n.type === "maintenance" ? "🔧" : n.type === "update" ? "🚀" : "⚠️"} {n.title}
                            </div>
                            <div style={{ color:"#a1a1aa", fontSize:".8rem", lineHeight:1.5 }}>{n.message}</div>
                            <div style={{ color:"#52525b", fontSize:".72rem", marginTop:".5rem" }}>{new Date(n.createdAt).toLocaleString()}</div>
                          </div>
                          <button
                            onClick={() => handleDeleteNotif(n.id)}
                            className={`${styles.actionBtn} ${styles.btnDanger}`}
                            style={{ flexShrink:0 }}
                          >Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === "payments" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Stats Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem" }}>
              <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "16px", padding: "1.5rem" }}>
                <span style={{ fontSize: ".75rem", color: "#a1a1aa", textTransform: "uppercase" }}>Transaction Volume (USD base)</span>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#22d3ee", marginTop: ".5rem" }}>
                  ${paySummary?.volume?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "16px", padding: "1.5rem" }}>
                <span style={{ fontSize: ".75rem", color: "#a1a1aa", textTransform: "uppercase" }}>Escrow Held Volume</span>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#fbbf24", marginTop: ".5rem" }}>
                  ${paySummary?.activeEscrowVolume?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || "0.00"}
                </div>
              </div>
              <div style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.07)", borderRadius: "16px", padding: "1.5rem" }}>
                <span style={{ fontSize: ".75rem", color: "#a1a1aa", textTransform: "uppercase" }}>Active Disputes</span>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "#f87171", marginTop: ".5rem" }}>
                  {paySummary?.disputes?.filter((d: any) => d.status === "OPEN").length || 0}
                </div>
              </div>
            </div>

            {/* Disputes Management */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}><span className={styles.sectionTitle}>🛡️ Escrow Dispute Settlement Center</span></div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Project Milestone</th>
                      <th>Reason</th>
                      <th>Raised By</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!paySummary?.disputes || paySummary.disputes.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: "#52525b" }}>No disputes raised.</td></tr>
                    ) : (
                      paySummary.disputes.map((disp: any) => (
                        <tr key={disp.id}>
                          <td style={{ color: "#fff", fontWeight: 600 }}>{disp.escrow?.projectTitle} ({disp.escrow?.amount} USD)</td>
                          <td>{disp.reason}</td>
                          <td>{disp.raisedBy?.name || "Client"}</td>
                          <td>
                            <span style={{
                              padding: "2px 8px", borderRadius: "99px", fontSize: ".75rem", fontWeight: 700,
                              background: disp.status === "OPEN" ? "rgba(239,68,68,.15)" : "rgba(16,185,129,.15)",
                              color: disp.status === "OPEN" ? "#f87171" : "#34d399"
                            }}>{disp.status}</span>
                          </td>
                          <td style={{ display: "flex", gap: ".5rem" }}>
                            {disp.status === "OPEN" ? (
                              <>
                                <button className={`${styles.actionBtn} ${styles.btnPrimary}`} onClick={() => handleResolveDispute(disp.id, "FREELANCER")}>Release to Freelancer</button>
                                <button className={`${styles.actionBtn} ${styles.btnDanger}`} onClick={() => handleResolveDispute(disp.id, "CLIENT")}>Refund Client</button>
                              </>
                            ) : (
                              <span style={{ color: "#71717a", fontSize: ".85rem" }}>Resolved</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Withdrawal Approval Center */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}><span className={styles.sectionTitle}>💸 Withdrawal Approval Center</span></div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Amount</th>
                      <th>Method</th>
                      <th>Account Details</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!paySummary?.withdrawals || paySummary.withdrawals.length === 0 ? (
                      <tr><td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "#52525b" }}>No withdrawal requests submitted.</td></tr>
                    ) : (
                      paySummary.withdrawals.map((w: any) => (
                        <tr key={w.id}>
                          <td style={{ color: "#fff", fontWeight: 600 }}>{w.user?.name}</td>
                          <td>${w.amount.toFixed(2)}</td>
                          <td><span className={styles.badge + " " + styles.badgePurple}>{w.method}</span></td>
                          <td style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.details}</td>
                          <td>
                            <span style={{
                              padding: "2px 8px", borderRadius: "99px", fontSize: ".75rem", fontWeight: 700,
                              background: w.status === "PENDING" ? "rgba(245,158,11,.15)" : w.status === "APPROVED" ? "rgba(16,185,129,.15)" : "rgba(239,68,68,.15)",
                              color: w.status === "PENDING" ? "#fbbf24" : w.status === "APPROVED" ? "#34d399" : "#f87171"
                            }}>{w.status}</span>
                          </td>
                          <td style={{ display: "flex", gap: ".5rem" }}>
                            {w.status === "PENDING" ? (
                              <>
                                <button className={`${styles.actionBtn} ${styles.btnPrimary}`} onClick={() => handleApproveWithdrawal(w.id)}>Approve</button>
                                <button className={`${styles.actionBtn} ${styles.btnDanger}`} onClick={() => handleRejectWithdrawal(w.id)}>Reject</button>
                              </>
                            ) : (
                              <span style={{ color: "#71717a", fontSize: ".85rem" }}>Completed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Financial Fraud Detection Log */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}><span className={styles.sectionTitle}>🚨 AI Fraud Detection Ledger</span></div>
              <div className={styles.activityFeed}>
                {[
                  { color: "#34d399", text: "Stripe payout simulation cleared. No abnormalities found.", time: "Just now" },
                  { color: "#fbbf24", text: "Flagged: User requested $1,500 withdrawal within 1 hour of deposit.", time: "12 min ago" },
                  { color: "#34d399", text: "Wise webhook verification: Success.", time: "1 hr ago" },
                  { color: "#f87171", text: "Auto-Block: Blocked IP 85.12.xx.xx trying to bypass local currency detection.", time: "3 hr ago" },
                ].map((a, i) => (
                  <div key={i} className={styles.activityItem}>
                    <div className={styles.activityDot} style={{ background: a.color }} />
                    <div><div className={styles.activityText}>{a.text}</div><div className={styles.activityTime}>{a.time}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === "server" && (
          <div>
            <div className={styles.serverGrid} style={{ marginBottom:"1.5rem" }}>
              {[
                { name:"CPU Usage", value:"34%", fill:34 },
                { name:"Memory", value:"61%", fill:61 },
                { name:"Storage", value:"22%", fill:22 },
                { name:"API Response", value:"120ms", fill:20 },
                { name:"DB Queries/s", value:"847", fill:70 },
                { name:"Uptime", value:"99.97%", fill:99 },
              ].map(s=>(
                <div key={s.name} className={styles.serverCard}>
                  <div className={styles.serverName}>{s.name}</div>
                  <div className={styles.serverValue}>{s.value}</div>
                  <div className={styles.serverBar}><div className={styles.serverBarFill} style={{ width:`${s.fill}%` }}/></div>
                </div>
              ))}
            </div>
            <div className={styles.section}>
              <div className={styles.sectionHeader}><span className={styles.sectionTitle}>🔒 Security Logs</span><span className={styles.sectionBadge}>Last 24h</span></div>
              <div className={styles.activityFeed}>
                {[
                  { color:"#34d399", text:"Admin login from 203.215.xx.xx — Karachi, PK", time:"Just now" },
                  { color:"#fbbf24", text:"Failed login attempt: 3x from 91.108.xx.xx", time:"18 min ago" },
                  { color:"#a78bfa", text:"API rate limit hit: /api/jobs endpoint", time:"1 hr ago" },
                  { color:"#34d399", text:"Database backup completed successfully", time:"3 hr ago" },
                  { color:"#f87171", text:"Suspicious IP blocked: 5.187.xx.xx", time:"6 hr ago" },
                ].map((a,i)=>(
                  <div key={i} className={styles.activityItem}>
                    <div className={styles.activityDot} style={{ background:a.color }}/>
                    <div><div className={styles.activityText}>{a.text}</div><div className={styles.activityTime}>{a.time}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === "projects" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}><span className={styles.sectionTitle}>All Projects & Listings</span></div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Title</th><th>Owner</th><th>Category</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {projects.length === 0 ? (
                    <tr><td colSpan={5} style={{textAlign: "center", padding: "2rem", color: "#52525b"}}>No projects found.</td></tr>
                  ) : projects.map((p: any) => (
                    <tr key={p.id}>
                      <td style={{ color:"#fff", fontWeight:600 }}>{p.title}</td>
                      <td>{p.seller?.name || 'Unknown'}</td>
                      <td><span className={styles.badge+" "+styles.badgeBlue}>{p.techStack?.split(',')[0] || "General"}</span></td>
                      <td><span className={`${styles.badge} ${p.status==="Suspended"?styles.badgeRed:p.status==="Under Review"?styles.badgeYellow:styles.badgeGreen}`}>{p.status || "Active"}</span></td>
                      <td style={{ display:"flex", gap:".5rem" }}>
                        <button className={`${styles.actionBtn} ${styles.btnPrimary}`} onClick={()=>showToast("Approved!")}>Approve</button>
                        <button className={`${styles.actionBtn} ${styles.btnDanger}`} onClick={()=>showToast("Removed!")}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === "jobs" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}><span className={styles.sectionTitle}>Global Jobs</span></div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Job Title</th><th>Company</th><th>Type</th><th>Location</th><th>Salary</th><th>Action</th></tr></thead>
                <tbody>
                  {jobs.length === 0 ? (
                    <tr><td colSpan={6} style={{textAlign: "center", padding: "2rem", color: "#52525b"}}>No jobs posted.</td></tr>
                  ) : jobs.map((j: any) => (
                    <tr key={j.id}>
                      <td style={{ color:"#fff", fontWeight:600 }}>{j.title}</td>
                      <td>{j.company || j.employer?.name || 'Unknown'}</td>
                      <td><span className={styles.badge+" "+styles.badgePurple}>{j.type || 'Full-time'}</span></td>
                      <td>{j.location || 'Remote'}</td>
                      <td>{j.salary || '-'}</td>
                      <td><button className={`${styles.actionBtn} ${styles.btnDanger}`} onClick={()=>showToast("Job Removed!")}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === "applications" && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}><span className={styles.sectionTitle}>Job Applications</span></div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead><tr><th>Applicant</th><th>Job Title</th><th>Company</th><th>Status</th><th>Applied Date</th></tr></thead>
                <tbody>
                  {applications.length === 0 ? (
                    <tr><td colSpan={5} style={{textAlign: "center", padding: "2rem", color: "#52525b"}}>No applications found.</td></tr>
                  ) : applications.map((a: any) => (
                    <tr key={a.id}>
                      <td style={{ color:"#fff", fontWeight:600 }}>{a.applicant?.name || 'Unknown'}</td>
                      <td>{a.job?.title || 'Deleted Job'}</td>
                      <td>{a.job?.company || 'Unknown'}</td>
                      <td><span className={`${styles.badge} ${a.status==="REJECTED"?styles.badgeRed:a.status==="HIRED"?styles.badgeGreen:styles.badgeYellow}`}>{a.status || 'PENDING'}</span></td>
                      <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
