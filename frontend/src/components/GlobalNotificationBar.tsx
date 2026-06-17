"use client";
import { API_BASE } from "@/utils/api";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { socket } from "../utils/socket";
import { X, Bell } from "lucide-react";

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

const MAX_VISIBLE = 3; // Max stacked at once

export default function GlobalNotificationBar() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  // Load dismissed IDs from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem("zv_dismissed_notifs");
    if (stored) {
      try { setDismissed(JSON.parse(stored)); } catch {}
    }
  }, []);

  useEffect(() => {
    axios.get(`${API_BASE}/api/admin/notifications`)
      .then(r => { if (Array.isArray(r.data)) setNotifications(r.data); })
      .catch(() => {});

    const handleNewNotif = (notif: Notification) => {
      setNotifications(prev => [notif, ...prev].slice(0, 20));
      setCollapsed(false); // expand on new notification
    };

    const handleNewJob = (job: any) => {
      handleNewNotif({
        id: `job-${job.id}-${Date.now()}`,
        title: "New Job Posted",
        message: `${job.title} at ${job.company}`,
        type: "update"
      });
    };

    const handleNewApp = () => {
      handleNewNotif({
        id: `app-${Date.now()}`,
        title: "New Application Received",
        message: "Someone applied to your job posting!",
        type: "update"
      });
    };

    socket.on("new_notification", handleNewNotif);
    socket.on("new_job", handleNewJob);
    socket.on("new_application", handleNewApp);

    return () => {
      socket.off("new_notification", handleNewNotif);
      socket.off("new_job", handleNewJob);
      socket.off("new_application", handleNewApp);
    };
  }, []);

  const dismiss = (id: string) => {
    const updated = [...dismissed, id];
    setDismissed(updated);
    sessionStorage.setItem("zv_dismissed_notifs", JSON.stringify(updated));
  };

  const dismissAll = () => {
    const ids = visible.map(n => n.id);
    const updated = [...dismissed, ...ids];
    setDismissed(updated);
    sessionStorage.setItem("zv_dismissed_notifs", JSON.stringify(updated));
  };

  const visible = notifications.filter(n => !dismissed.includes(n.id));

  if (visible.length === 0) return null;

  const shown = collapsed ? [] : visible.slice(0, MAX_VISIBLE);
  const hiddenCount = visible.length - MAX_VISIBLE;

  return (
    <div style={{
      position: "fixed",
      top: "88px",        // below the navbar
      right: "20px",
      zIndex: 99990,      // below modals (99999) but above content
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      maxWidth: "380px",
      width: "calc(100vw - 40px)"
    }}>
      {/* Header row — collapse / dismiss all */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.4rem 0.75rem",
        background: "rgba(10,10,16,0.85)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "10px",
        backdropFilter: "blur(12px)"
      }}>
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            background: "none", border: "none", color: "#a1a1aa",
            cursor: "pointer", display: "flex", alignItems: "center",
            gap: "0.4rem", fontSize: "0.8rem", fontWeight: 600
          }}
        >
          <Bell size={13} />
          {visible.length} notification{visible.length !== 1 ? "s" : ""}
          <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>
            {collapsed ? "▼" : "▲"}
          </span>
        </button>
        <button
          onClick={dismissAll}
          style={{
            background: "none", border: "none", color: "#71717a",
            cursor: "pointer", fontSize: "0.75rem", fontWeight: 500
          }}
        >
          Clear all
        </button>
      </div>

      {/* Notification cards */}
      {!collapsed && shown.map(notif => {
        const s = TYPE_STYLES[notif.type] || TYPE_STYLES.announcement;
        return (
          <div
            key={notif.id}
            style={{
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: "12px",
              padding: "0.85rem 1rem",
              backdropFilter: "blur(20px)",
              boxShadow: "0 4px 20px rgba(0,0,0,.35)",
              animation: "fadeInUp .3s ease",
              display: "flex",
              gap: "0.75rem",
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: "1.15rem", flexShrink: 0, marginTop: "0.1rem" }}>
              {s.icon}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: s.color, fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.2rem" }}>
                {notif.title}
              </div>
              <div style={{ color: "#d4d4d8", fontSize: "0.78rem", lineHeight: 1.4 }}>
                {notif.message}
              </div>
            </div>
            <button
              onClick={() => dismiss(notif.id)}
              style={{
                background: "none", border: "none", color: "#71717a",
                cursor: "pointer", padding: "0", flexShrink: 0,
                display: "flex", alignItems: "center"
              }}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}

      {/* "X more" indicator */}
      {!collapsed && hiddenCount > 0 && (
        <div style={{
          textAlign: "center", fontSize: "0.75rem", color: "#71717a",
          padding: "0.3rem", cursor: "pointer"
        }}
          onClick={() => setCollapsed(false)}
        >
          + {hiddenCount} more notification{hiddenCount !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
