"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, CheckCheck, Trash2, X, Zap, MessageSquare, Briefcase, DollarSign, UserPlus, AlertTriangle } from "lucide-react";
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

function typeIcon(type: string) {
  const size = 13;
  switch (type) {
    case "message":  return <MessageSquare size={size} />;
    case "job":      return <Briefcase size={size} />;
    case "payment":  return <DollarSign size={size} />;
    case "follow":   return <UserPlus size={size} />;
    case "alert":    return <AlertTriangle size={size} />;
    default:         return <Zap size={size} />;
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
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationBell() {
  const { user, token } = useAuth();
  const [open,          setOpen]          = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount,   setUnreadCount]   = useState(0);
  const [loading,       setLoading]       = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const headers = { Authorization: `Bearer ${token}` };

  // ── Fetch on open ─────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/notifications?page=1`, { headers });
      const data = await res.json();
      setNotifications(data.data || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {} finally { setLoading(false); }
  }, [token]);

  const fetchCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/notifications/unread-count`, { headers });
      const data = await res.json();
      setUnreadCount(data.count || 0);
    } catch {}
  }, [token]);

  useEffect(() => { if (user) fetchCount(); }, [user]);

  useEffect(() => { if (open) fetchNotifications(); }, [open]);

  // ── Real-time socket ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (n: Notification) => {
      setUnreadCount(c => c + 1);
      setNotifications(prev => [n, ...prev].slice(0, 20));
    };
    socket.on("new_notification", handler);
    return () => { socket.off("new_notification", handler); };
  }, []);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────
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

  const deleteOne = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));
    const wasUnread = notifications.find(n => n.id === id)?.isRead === false;
    if (wasUnread) setUnreadCount(c => Math.max(0, c - 1));
    await fetch(`${API_BASE}/api/notifications/${id}`, { method: "DELETE", headers });
  };

  if (!user) return null;

  return (
    <div style={{ position: "relative" }} ref={panelRef}>
      {/* ── Bell button ── */}
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        style={{
          width: 36, height: 36, borderRadius: 10,
          background: open ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${open ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.08)"}`,
          color: open ? "var(--primary)" : "#a1a1aa",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", transition: "all 0.2s",
        }}
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: -4, right: -4,
            minWidth: 16, height: 16, borderRadius: 8,
            background: "#EF4444", color: "#fff",
            fontSize: "0.6rem", fontWeight: 800,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 3px",
            boxShadow: "0 0 8px rgba(239,68,68,0.6)",
            animation: "pulse 2s infinite",
          }}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ── */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0,
          width: 360,
          background: "rgba(6,6,16,0.98)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)",
          zIndex: 9000,
          animation: "fadeIn 0.15s ease",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#f4f4f5" }}>
              Notifications
              {unreadCount > 0 && (
                <span style={{ marginLeft: 6, fontSize: "0.72rem", background: "rgba(239,68,68,0.15)", color: "#ef4444", padding: "2px 7px", borderRadius: 999 }}>
                  {unreadCount} new
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {unreadCount > 0 && (
                <button onClick={markAll} title="Mark all read" style={{ background: "none", border: "none", color: "var(--primary)", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.72rem", fontWeight: 600 }}>
                  <CheckCheck size={13} /> All read
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#52525b", cursor: "pointer" }}>
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={{ maxHeight: 400, overflowY: "auto" }}>
            {loading ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "#52525b", fontSize: "0.8rem" }}>Loading…</div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center" }}>
                <Bell size={28} style={{ color: "#27272a", marginBottom: 8 }} />
                <div style={{ color: "#52525b", fontSize: "0.8rem" }}>You&apos;re all caught up!</div>
              </div>
            ) : (
              notifications.map(n => (
                <div
                  key={n.id}
                  onClick={() => { if (!n.isRead) markOne(n.id); }}
                  style={{
                    padding: "0.85rem 1.25rem",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    display: "flex", gap: "0.75rem", alignItems: "flex-start",
                    background: n.isRead ? "transparent" : "rgba(139,92,246,0.04)",
                    cursor: n.isRead ? "default" : "pointer",
                    transition: "background 0.15s",
                    position: "relative",
                  }}
                >
                  {/* Type icon */}
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: `${typeColor(n.type)}18`,
                    color: typeColor(n.type),
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {typeIcon(n.type)}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {n.link ? (
                      <Link href={n.link} onClick={() => setOpen(false)} style={{ textDecoration: "none" }}>
                        <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: "0.8rem", color: "#e4e4e7", lineHeight: 1.4 }}>{n.title}</div>
                        <div style={{ fontSize: "0.72rem", color: "#71717a", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.message}</div>
                      </Link>
                    ) : (
                      <>
                        <div style={{ fontWeight: n.isRead ? 500 : 700, fontSize: "0.8rem", color: "#e4e4e7", lineHeight: 1.4 }}>{n.title}</div>
                        <div style={{ fontSize: "0.72rem", color: "#71717a", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.message}</div>
                      </>
                    )}
                    <div style={{ fontSize: "0.65rem", color: "#3f3f46", marginTop: 4 }}>{timeAgo(n.createdAt)}</div>
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && (
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)", flexShrink: 0, marginTop: 4 }} />
                  )}

                  {/* Delete */}
                  <button
                    onClick={e => deleteOne(n.id, e)}
                    style={{
                      position: "absolute", top: 8, right: 8,
                      background: "none", border: "none", color: "#3f3f46",
                      cursor: "pointer", padding: 4, borderRadius: 4, display: "flex",
                      opacity: 0, transition: "opacity 0.15s",
                    }}
                    className="notif-delete"
                  >
                    <X size={11} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: "0.75rem 1.25rem",
              borderTop: "1px solid rgba(255,255,255,0.04)",
              textAlign: "center",
            }}>
              <Link
                href="/dashboard/notifications"
                onClick={() => setOpen(false)}
                style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600, textDecoration: "none" }}
              >
                View all notifications →
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        .notif-delete:hover { color: #ef4444 !important; }
        div:hover > .notif-delete { opacity: 1 !important; }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
