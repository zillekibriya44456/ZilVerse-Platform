"use client";
import React, { useState, useEffect } from "react";
import { ShieldOff, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/utils/api";

interface BlockedUser {
  id: string;
  blocked: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  createdAt: string;
}

export default function PrivacyPage() {
  const { user, token } = useAuth();
  const [blocks,    setBlocks]    = useState<BlockedUser[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [msg,       setMsg]       = useState("");

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/api/safety/blocks`, { headers })
      .then(r => r.json())
      .then(setBlocks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const unblock = async (blockedId: string, name: string) => {
    await fetch(`${API_BASE}/api/safety/block/${blockedId}`, { method: "DELETE", headers });
    setBlocks(prev => prev.filter(b => b.blocked.id !== blockedId));
    setMsg(`${name} has been unblocked`);
    setTimeout(() => setMsg(""), 3000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", padding: "2rem 1.5rem", paddingTop: "7rem" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#f4f4f5", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <ShieldOff size={24} style={{ color: "var(--primary)" }} /> Privacy & Blocked Users
          </h1>
          <p style={{ color: "#71717a", marginTop: 6 }}>Blocked users cannot message, follow, or interact with you</p>
        </div>

        {msg && (
          <div style={{ padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1rem", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e", fontSize: "0.85rem" }}>
            {msg}
          </div>
        )}

        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
          <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#e4e4e7" }}>Blocked Users</div>
            <div style={{ fontSize: "0.75rem", color: "#71717a" }}>{blocks.length} blocked</div>
          </div>

          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "#52525b" }}>Loading…</div>
          ) : blocks.length === 0 ? (
            <div style={{ padding: "3rem", textAlign: "center" }}>
              <ShieldOff size={32} style={{ color: "#27272a", marginBottom: 12 }} />
              <div style={{ color: "#52525b", fontSize: "0.85rem" }}>You haven&apos;t blocked anyone</div>
            </div>
          ) : (
            blocks.map((b, i) => (
              <div key={b.id} style={{
                padding: "1rem 1.25rem",
                borderBottom: i < blocks.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                display: "flex", alignItems: "center", gap: "0.85rem",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
                  background: "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {b.blocked.avatar ? (
                    <img src={b.blocked.avatar} alt={b.blocked.name || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: "1rem", fontWeight: 800, color: "var(--primary)" }}>
                      {(b.blocked.name || "U")[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#e4e4e7" }}>{b.blocked.name || "Unknown User"}</div>
                  <div style={{ fontSize: "0.72rem", color: "#71717a" }}>{b.blocked.email}</div>
                </div>
                <button
                  onClick={() => unblock(b.blocked.id, b.blocked.name || "User")}
                  style={{ padding: "0.45rem 1rem", borderRadius: 8, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "var(--primary)", cursor: "pointer", fontSize: "0.78rem", fontWeight: 600, fontFamily: "inherit", display: "flex", alignItems: "center", gap: "0.35rem" }}
                >
                  <RefreshCw size={12} /> Unblock
                </button>
              </div>
            ))
          )}
        </div>

        {/* Info card */}
        <div style={{ marginTop: "1.5rem", padding: "1rem 1.25rem", borderRadius: 12, background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
            <AlertCircle size={16} style={{ color: "#3b82f6", flexShrink: 0, marginTop: 2 }} />
            <div style={{ fontSize: "0.78rem", color: "#a1a1aa", lineHeight: 1.6 }}>
              You can block any user from their profile page. Blocked users will not know they are blocked.
              They will still be able to see your public content but cannot interact with you.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
