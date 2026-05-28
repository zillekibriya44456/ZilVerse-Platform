"use client";
import { API_BASE } from "@/utils/api";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { socket } from "../utils/socket";

const TYPE_STYLES: Record<string, { bg: string; border: string; color: string; icon: string }> = {
  announcement: { bg: "rgba(139,92,246,.15)", border: "rgba(139,92,246,.4)", color: "#c4b5fd", icon: "📢" },
  maintenance:  { bg: "rgba(245,158,11,.12)", border: "rgba(245,158,11,.4)", color: "#fbbf24", icon: "🔧" },
  update:       { bg: "rgba(6,182,212,.12)",  border: "rgba(6,182,212,.4)",  color: "#22d3ee", icon: "🚀" },
  warning:      { bg: "rgba(239,68,68,.12)",  border: "rgba(239,68,68,.4)",  color: "#f87171", icon: "⚠️" },
};

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
}

export default function GlobalNotificationBar() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    // Initial fetch
    axios.get(`${API_BASE}/api/admin/notifications`)
      .then(r => setNotifications(r.data))
      .catch(() => {});

    // Real-time socket listener
    const handleNewNotif = (notif: Notification) => {
      setNotifications(prev => [notif, ...prev]);
    };

    socket.on('new_notification', handleNewNotif);

    return () => {
      socket.off('new_notification', handleNewNotif);
    };
  }, []);

  // Load dismissed IDs from sessionStorage so they stay hidden per session
  useEffect(() => {
    const stored = sessionStorage.getItem("zv_dismissed_notifs");
    if (stored) setDismissed(JSON.parse(stored));
  }, []);

  const dismiss = (id: string) => {
    const updated = [...dismissed, id];
    setDismissed(updated);
    sessionStorage.setItem("zv_dismissed_notifs", JSON.stringify(updated));
  };

  const visible = notifications.filter(n => !dismissed.includes(n.id));
  if (visible.length === 0) return null;

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 999990, display: "flex", flexDirection: "column", gap: "10px", maxWidth: "420px", width: "calc(100vw - 48px)" }}>
      {visible.map(notif => {
        const s = TYPE_STYLES[notif.type] || TYPE_STYLES.announcement;
        return (
          <div
            key={notif.id}
            style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: "14px",
              padding: "1rem 1.1rem",
              backdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px rgba(0,0,0,.4)",
              animation: "slideUp .35s ease",
              display: "flex",
              gap: ".9rem",
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: "1.3rem", flexShrink: 0, marginTop: ".1rem" }}>{s.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: s.color, fontWeight: 700, fontSize: ".9rem", marginBottom: ".25rem" }}>{notif.title}</div>
              <div style={{ color: "#d4d4d8", fontSize: ".82rem", lineHeight: 1.5 }}>{notif.message}</div>
            </div>
            <button
              onClick={() => dismiss(notif.id)}
              style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer", fontSize: "1rem", padding: "0", flexShrink: 0, lineHeight: 1 }}
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        );
      })}
      <style>{`@keyframes slideUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}`}</style>
    </div>
  );
}
