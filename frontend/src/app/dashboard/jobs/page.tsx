"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/utils/api";
import { socket } from "@/utils/socket";
import {
  Briefcase, Search, Filter, ChevronRight, ExternalLink,
  Building2, MapPin, DollarSign, Calendar, RefreshCw
} from "lucide-react";

// Kanban column definitions
const COLUMNS = [
  { id: "APPLIED",    label: "Applied",      icon: "📨", color: "#3B82F6" },
  { id: "REVIEWING",  label: "Under Review",  icon: "🔍", color: "#F59E0B" },
  { id: "INTERVIEW",  label: "Interview",     icon: "🎤", color: "#A855F7" },
  { id: "OFFERED",    label: "Offer Received",icon: "🎁", color: "#10B981" },
  { id: "ACCEPTED",   label: "Accepted",      icon: "✅", color: "#22c55e" },
  { id: "REJECTED",   label: "Rejected",      icon: "❌", color: "#EF4444" },
];

type Application = {
  id: string;
  status: string;
  createdAt: string;
  coverLetter?: string;
  job?: {
    id: string; title: string; company: string; location: string;
    salary?: string; type?: string; logo?: string;
  };
};

function AppCard({ app, onStatusChange }: { app: Application; onStatusChange: (id: string, status: string) => void }) {
  const [dragging, setDragging] = useState(false);
  const col = COLUMNS.find(c => c.id === app.status) || COLUMNS[0];

  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.setData("applicationId", app.id); setDragging(true); }}
      onDragEnd={() => setDragging(false)}
      style={{
        background: "rgba(255,255,255,0.03)", border: `1px solid ${col.color}25`,
        borderRadius: 12, padding: "0.85rem", cursor: "grab",
        opacity: dragging ? 0.5 : 1,
        transition: "all 0.15s", boxShadow: dragging ? `0 8px 24px ${col.color}20` : "none",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#f4f4f5", marginBottom: "0.25rem" }}>
        {app.job?.title || "Job"}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.73rem", color: "#71717a", marginBottom: "0.4rem" }}>
        <Building2 size={11} /> {app.job?.company}
      </div>
      {app.job?.location && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.72rem", color: "#52525b" }}>
          <MapPin size={11} /> {app.job.location}
        </div>
      )}
      {app.job?.salary && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.72rem", color: "#52525b", marginTop: "0.2rem" }}>
          <DollarSign size={11} /> {app.job.salary}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.65rem" }}>
        <div style={{ fontSize: "0.65rem", color: "#3f3f46", display: "flex", alignItems: "center", gap: "0.25rem" }}>
          <Calendar size={10} /> {new Date(app.createdAt).toLocaleDateString()}
        </div>
        {app.job?.id && (
          <Link href={`/jobs/${app.job.id}`} style={{ color: "#71717a", display: "flex", alignItems: "center" }} title="View Job">
            <ExternalLink size={12} />
          </Link>
        )}
      </div>
      {/* Quick status change dropdown */}
      <select
        value={app.status}
        onChange={e => onStatusChange(app.id, e.target.value)}
        onClick={e => e.stopPropagation()}
        style={{
          marginTop: "0.5rem", width: "100%", background: "#18181b",
          border: `1px solid ${col.color}30`, color: col.color,
          borderRadius: 8, padding: "0.25rem 0.5rem", fontSize: "0.7rem",
          fontWeight: 700, cursor: "pointer", outline: "none", fontFamily: "inherit",
        }}
      >
        {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
      </select>
    </div>
  );
}

function KanbanColumn({
  column, apps, onDrop, onStatusChange,
}: {
  column: typeof COLUMNS[0];
  apps: Application[];
  onDrop: (colId: string, appId: string) => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => {
        e.preventDefault();
        setDragOver(false);
        const appId = e.dataTransfer.getData("applicationId");
        if (appId) onDrop(column.id, appId);
      }}
      style={{
        minWidth: 240, maxWidth: 280, flex: "1 0 240px",
        background: dragOver ? `${column.color}08` : "rgba(255,255,255,0.02)",
        border: `1px solid ${dragOver ? column.color : "rgba(255,255,255,0.06)"}`,
        borderRadius: 16, padding: "0.85rem",
        transition: "all 0.15s",
      }}
    >
      {/* Column Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.85rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 800, fontSize: "0.82rem", color: "#e4e4e7" }}>
          <span>{column.icon}</span> {column.label}
        </div>
        <div style={{ background: `${column.color}20`, color: column.color, fontWeight: 800, fontSize: "0.7rem", borderRadius: 20, padding: "2px 8px" }}>
          {apps.length}
        </div>
      </div>

      {/* Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", minHeight: 80 }}>
        {apps.length === 0 ? (
          <div style={{ textAlign: "center", padding: "1.5rem 0", color: "#3f3f46", fontSize: "0.75rem", border: "2px dashed rgba(255,255,255,0.06)", borderRadius: 10 }}>
            Drop here
          </div>
        ) : (
          apps.map(app => <AppCard key={app.id} app={app} onStatusChange={onStatusChange} />)
        )}
      </div>
    </div>
  );
}

export default function JobsPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"kanban" | "table">("kanban");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  const fetchApps = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/jobs/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!user) { router.push("/login"); return; }
    fetchApps();

    // Real-time status update via Socket.IO
    const handleStatusUpdate = ({ applicationId, status }: { applicationId: string; status: string }) => {
      setApplications(prev => prev.map(a => a.id === applicationId ? { ...a, status } : a));
    };
    socket.on("application_status_update", handleStatusUpdate);
    return () => { socket.off("application_status_update", handleStatusUpdate); };
  }, [user, router, fetchApps]);

  const updateStatus = async (appId: string, status: string) => {
    if (!token) return;
    // Optimistic update
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    try {
      await fetch(`${API_BASE}/api/jobs/application/${appId}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      console.error(e);
      fetchApps(); // Revert on error
    }
  };

  const handleDrop = (colId: string, appId: string) => updateStatus(appId, colId);

  // Filter & search
  const filtered = applications.filter(a => {
    const matchSearch = !search || [a.job?.title, a.job?.company].some(s => s?.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === "ALL" || a.status === filter;
    return matchSearch && matchFilter;
  });

  // Stats
  const stats = COLUMNS.map(c => ({ ...c, count: applications.filter(a => a.status === c.id).length }));

  if (!user) return null;

  return (
    <div style={{ padding: "1.5rem", maxWidth: 1600, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#3B82F610", border: "1px solid #3B82F625", borderRadius: 20, padding: "0.3rem 1rem", fontSize: "0.75rem", color: "#3B82F6", fontWeight: 700, marginBottom: "0.75rem" }}>
          💼 Application Tracker
        </div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#f4f4f5", margin: 0 }}>Job & Internship Kanban</h1>
        <p style={{ color: "#71717a", marginTop: "0.3rem", fontSize: "0.9rem" }}>Drag & drop applications across stages. Updates save instantly.</p>
      </div>

      {/* Stats Strip */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {stats.map(s => (
          <div key={s.id} style={{ background: `${s.color}08`, border: `1px solid ${s.color}20`, borderRadius: 12, padding: "0.6rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1rem" }}>{s.icon}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.1rem", color: s.color }}>{s.count}</div>
              <div style={{ fontSize: "0.65rem", color: "#71717a" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#71717a" }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by job title or company…"
            style={{ width: "100%", paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, color: "#f4f4f5", fontSize: "0.85rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
          />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", color: "#e4e4e7", borderRadius: 10, padding: "0.45rem 0.85rem", fontSize: "0.82rem", outline: "none", fontFamily: "inherit", cursor: "pointer" }}>
          <option value="ALL">All Status</option>
          {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, overflow: "hidden" }}>
          {(["kanban", "table"] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: "0.45rem 0.85rem", background: view === v ? "rgba(255,255,255,0.1)" : "none", border: "none", color: view === v ? "#f4f4f5" : "#71717a", cursor: "pointer", fontWeight: 700, fontSize: "0.78rem", fontFamily: "inherit", textTransform: "capitalize" }}>
              {v === "kanban" ? "⠿ Kanban" : "☰ Table"}
            </button>
          ))}
        </div>
        <button onClick={fetchApps} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#71717a", borderRadius: 10, padding: "0.45rem 0.65rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <RefreshCw size={14} />
        </button>
        <Link href="/jobs" style={{ background: "linear-gradient(135deg,#8B5CF6,#6D28D9)", color: "#fff", borderRadius: 10, padding: "0.5rem 1rem", textDecoration: "none", fontWeight: 700, fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.35rem" }}>
          <Briefcase size={14} /> Browse Jobs
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem", color: "#52525b" }}>Loading applications…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
          <h3 style={{ color: "#f4f4f5", marginBottom: "0.5rem" }}>No applications yet</h3>
          <p style={{ color: "#71717a", marginBottom: "1.5rem" }}>Apply to jobs and internships to track them here.</p>
          <Link href="/jobs" style={{ background: "linear-gradient(135deg,#3B82F6,#1D4ED8)", color: "#fff", padding: "0.65rem 1.5rem", borderRadius: 10, textDecoration: "none", fontWeight: 700 }}>
            Browse Opportunities
          </Link>
        </div>
      ) : view === "kanban" ? (
        /* ── Kanban Board ──────────────────────────────────────────────── */
        <div style={{ display: "flex", gap: "0.85rem", overflowX: "auto", paddingBottom: "1rem" }}>
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              column={col}
              apps={filtered.filter(a => a.status === col.id)}
              onDrop={handleDrop}
              onStatusChange={updateStatus}
            />
          ))}
        </div>
      ) : (
        /* ── Table View ────────────────────────────────────────────────── */
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Job Title", "Company", "Location", "Salary", "Type", "Applied", "Status", "Action"].map(h => (
                  <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 700, color: "#71717a", fontSize: "0.75rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(app => {
                const col = COLUMNS.find(c => c.id === app.status) || COLUMNS[0];
                return (
                  <tr key={app.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "0.75rem 1rem", fontWeight: 700, color: "#f4f4f5" }}>{app.job?.title || "—"}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#a1a1aa" }}>{app.job?.company || "—"}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#71717a" }}>{app.job?.location || "Remote"}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#71717a" }}>{app.job?.salary || "—"}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#71717a" }}>{app.job?.type || "—"}</td>
                    <td style={{ padding: "0.75rem 1rem", color: "#52525b", fontSize: "0.78rem" }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <span style={{ background: `${col.color}18`, border: `1px solid ${col.color}30`, color: col.color, borderRadius: 20, padding: "0.15rem 0.6rem", fontSize: "0.7rem", fontWeight: 700 }}>{col.icon} {col.label}</span>
                    </td>
                    <td style={{ padding: "0.75rem 1rem" }}>
                      <select value={app.status} onChange={e => updateStatus(app.id, e.target.value)} style={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", color: "#a1a1aa", borderRadius: 8, padding: "0.2rem 0.4rem", fontSize: "0.72rem", cursor: "pointer", outline: "none", fontFamily: "inherit" }}>
                        {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
