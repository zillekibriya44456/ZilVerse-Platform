"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Bell, Check, CheckCheck, Trash2, Filter, X, MessageSquare, Briefcase, DollarSign, UserPlus, AlertTriangle, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { socket } from "@/utils/socket";
import { API_BASE } from "@/utils/api";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

const TYPE_FILTERS = ["all", "message", "job", "payment", "follow", "system", "alert"];

function typeIcon(type: string) {
  switch (type) {
    case "message":  return <MessageSquare size={16} />;
    case "job":      return <Briefcase size={16} />;
    case "payment":  return <DollarSign size={16} />;
    case "follow":   return <UserPlus size={16} />;
    case "alert":    return <AlertTriangle size={16} />;
    default:         return <Zap size={16} />;
  }
}

function typeColor(type: string) {
  switch (type) {
    case "message":  return "#8B5CF6";
    case "job":      return "#3B82F6";
    case "payment":  return "#22C55E";
    case "follow":   return "#06B6D4";
    case "alert":    return "#EF4444";
    default:         return "#A855F7";
  }
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function NotificationsPage() {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [total,         setTotal]         = useState(0);
  const [page,          setPage]          = useState(1);
  const [loading,       setLoading]       = useState(true);
  const [typeFilter,    setTypeFilter]    = useState("all");
  const [showUnread,    setShowUnread]    = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchNotifications = useCallback(async (p = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/api/notifications?page=${p}`, { headers });
      const data = await res.json();
      if (p === 1) setNotifications(data.data || []);
      else         setNotifications(prev => [...prev, ...(data.data || [])]);
      setTotal(data.total || 0);
      setUnreadCount(data.unreadCount || 0);
      setPage(p);
    } catch {} finally { setLoading(false); }
  }, [token]);

  useEffect(() => { if (user) fetchNotifications(1); }, [user]);

  // Real-time
  useEffect(() => {
    const handler = (n: Notification) => {
      setNotifications(prev => [n, ...prev]);
      setUnreadCount(c => c + 1);
      setTotal(t => t + 1);
    };
    socket.on("new_notification", handler);
    return () => { socket.off("new_notification", handler); };
  }, []);

  const markOne = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnreadCount(c => Math.max(0, c - 1));
    await fetch(`${API_BASE}/api/notifications/read/${id}`, { method: "POST", headers });
  };

  const markAll = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
    await fetch(`${API_BASE}/api/notifications/read-all`, { method: "POST", headers });
  };

  const deleteOne = async (id: string) => {
    const n = notifications.find(x => x.id === id);
    setNotifications(prev => prev.filter(x => x.id !== id));
    if (n && !n.isRead) setUnreadCount(c => Math.max(0, c - 1));
    setTotal(t => t - 1);
    await fetch(`${API_BASE}/api/notifications/${id}`, { method: "DELETE", headers });
  };

  const clearAll = async () => {
    setNotifications([]);
    setUnreadCount(0);
    setTotal(0);
    await fetch(`${API_BASE}/api/notifications/clear-all`, { method: "DELETE", headers });
  };

  const filtered = notifications.filter(n => {
    if (showUnread && n.isRead) return false;
    if (typeFilter !== "all" && n.type !== typeFilter) return false;
    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", paddingTop: "7rem", padding: "7rem 1.5rem 2rem" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#f4f4f5", display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Bell size={22} style={{ color: "var(--primary)" }} />
              Notifications
              {unreadCount > 0 && (
                <span style={{ fontSize: "0.75rem", background: "rgba(239,68,68,0.15)", color: "#ef4444", padding: "3px 10px", borderRadius: 999, fontWeight: 700 }}>
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p style={{ color: "#71717a", fontSize: "0.82rem", marginTop: 4 }}>{total} total notifications</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {unreadCount > 0 && (
              <button onClick={markAll} style={{ padding: "0.5rem 1rem", borderRadius: 8, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", color: "var(--primary)", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
            {total > 0 && (
              <button onClick={clearAll} style={{ padding: "0.5rem 1rem", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, fontFamily: "inherit", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <Trash2 size={13} /> Clear all
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "0.4rem", marginBottom: "1.25rem", flexWrap: "wrap", alignItems: "center" }}>
          <button
            onClick={() => setShowUnread(s => !s)}
            style={{ padding: "0.4rem 0.85rem", borderRadius: 999, border: `1px solid ${showUnread ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"}`, background: showUnread ? "rgba(139,92,246,0.12)" : "transparent", color: showUnread ? "var(--primary)" : "#71717a", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700, fontFamily: "inherit" }}
          >
            Unread only
          </button>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.06)" }} />
          {TYPE_FILTERS.map(f => (
            <button key={f} onClick={() => setTypeFilter(f)} style={{
              padding: "0.4rem 0.85rem", borderRadius: 999,
              border: `1px solid ${typeFilter === f ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)"}`,
              background: typeFilter === f ? "rgba(139,92,246,0.12)" : "transparent",
              color: typeFilter === f ? "var(--primary)" : "#71717a",
              cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, fontFamily: "inherit",
              textTransform: "capitalize",
            }}>{f}</button>
          ))}
        </div>

        {/* List */}
        {loading && page === 1 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#52525b" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <Bell size={36} style={{ color: "#27272a", marginBottom: 12 }} />
            <div style={{ color: "#52525b", fontSize: "0.9rem" }}>No notifications{typeFilter !== "all" ? ` for "${typeFilter}"` : ""}</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {filtered.map(n => (
              <div key={n.id} style={{
                background: n.isRead ? "rgba(255,255,255,0.02)" : "rgba(139,92,246,0.05)",
                border: `1px solid ${n.isRead ? "rgba(255,255,255,0.06)" : "rgba(139,92,246,0.15)"}`,
                borderRadius: 14, padding: "1rem 1.25rem",
                display: "flex", gap: "0.85rem", alignItems: "flex-start",
                position: "relative",
                transition: "background 0.15s",
              }}>
                {/* Icon */}
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: `${typeColor(n.type)}18`,
                  color: typeColor(n.type),
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {typeIcon(n.type)}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {n.link ? (
                    <Link href={n.link} style={{ textDecoration: "none" }}>
                      <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: "0.9rem", color: "#e4e4e7", lineHeight: 1.4 }}>{n.title}</div>
                      <div style={{ fontSize: "0.78rem", color: "#71717a", marginTop: 3 }}>{n.message}</div>
                    </Link>
                  ) : (
                    <>
                      <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: "0.9rem", color: "#e4e4e7", lineHeight: 1.4 }}>{n.title}</div>
                      <div style={{ fontSize: "0.78rem", color: "#71717a", marginTop: 3 }}>{n.message}</div>
                    </>
                  )}
                  <div style={{ fontSize: "0.68rem", color: "#3f3f46", marginTop: 6 }}>{timeAgo(n.createdAt)}</div>
                </div>

                {/* Unread dot */}
                {!n.isRead && (
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--primary)", flexShrink: 0, marginTop: 6 }} />
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.3rem", flexShrink: 0 }}>
                  {!n.isRead && (
                    <button onClick={() => markOne(n.id)} title="Mark read" style={{ padding: "0.3rem", background: "none", border: "none", color: "#52525b", cursor: "pointer", borderRadius: 6 }}>
                      <Check size={14} />
                    </button>
                  )}
                  <button onClick={() => deleteOne(n.id)} title="Delete" style={{ padding: "0.3rem", background: "none", border: "none", color: "#52525b", cursor: "pointer", borderRadius: 6 }}>
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}

            {/* Load more */}
            {filtered.length < total && (
              <button
                onClick={() => fetchNotifications(page + 1)}
                disabled={loading}
                style={{ padding: "0.75rem", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#a1a1aa", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: "0.82rem" }}
              >
                {loading ? "Loading…" : "Load more"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
