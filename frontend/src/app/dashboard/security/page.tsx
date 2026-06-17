"use client";
import React, { useState, useEffect } from "react";
import { Monitor, Smartphone, Globe2, Clock, Trash2, LogOut, ShieldCheck, ShieldAlert, AlertCircle, QrCode, KeyRound, ToggleLeft, ToggleRight, History, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/utils/api";

interface Session {
  id: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  country: string;
  lastActive: string;
  createdAt: string;
}

interface LoginEvent {
  id: string;
  deviceName: string;
  browser: string;
  os: string;
  ipAddress: string;
  country: string;
  status: "SUCCESS" | "FAILED" | "BLOCKED";
  failReason?: string;
  createdAt: string;
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(ts).toLocaleDateString();
}

export default function SecurityPage() {
  const { user, token } = useAuth();
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const [tab, setTab] = useState<"devices" | "2fa" | "history">("devices");

  // Sessions
  const [sessions, setSessions]     = useState<Session[]>([]);
  const [sessLoading, setSessLoading] = useState(true);

  // 2FA
  const [twoFA, setTwoFA]           = useState(false);
  const [qrData, setQrData]         = useState("");
  const [secret, setSecret]         = useState("");
  const [code2FA, setCode2FA]       = useState("");
  const [backup, setBackup]         = useState<string[]>([]);
  const [showBackup, setShowBackup] = useState(false);
  const [tfaStep, setTfaStep]       = useState<"idle" | "setup" | "verify" | "done">("idle");
  const [tfaMsg, setTfaMsg]         = useState("");

  // Login history
  const [history, setHistory]       = useState<LoginEvent[]>([]);
  const [histLoading, setHistLoading] = useState(false);

  const [msg, setMsg] = useState<{ text: string; type: "ok" | "err" }>({ text: "", type: "ok" });

  useEffect(() => {
    if (!token) return;
    // Load sessions
    fetch(`${API_BASE}/api/auth/sessions`, { headers })
      .then(r => r.json()).then(setSessions).catch(() => {}).finally(() => setSessLoading(false));
    // Load 2FA status
    setTwoFA(user?.twoFactorEnabled ?? false);
  }, [token]);

  const fetchHistory = async () => {
    setHistLoading(true);
    const res = await fetch(`${API_BASE}/api/auth/login-history`, { headers });
    const data = await res.json();
    setHistory(data.data || []);
    setHistLoading(false);
  };

  useEffect(() => { if (tab === "history") fetchHistory(); }, [tab]);

  // ── Revoke session ─────────────────────────────────────────────────────────
  const revokeSession = async (id: string) => {
    await fetch(`${API_BASE}/api/auth/sessions/${id}`, { method: "DELETE", headers });
    setSessions(s => s.filter(x => x.id !== id));
    setMsg({ text: "Session revoked", type: "ok" });
  };

  const revokeAll = async () => {
    await fetch(`${API_BASE}/api/auth/logout-all`, { method: "POST", headers });
    setSessions([]);
    setMsg({ text: "Logged out from all devices", type: "ok" });
  };

  // ── 2FA Setup ─────────────────────────────────────────────────────────────
  const setup2FA = async () => {
    const res = await fetch(`${API_BASE}/api/auth/2fa/setup`, { method: "POST", headers });
    const data = await res.json();
    setQrData(data.qrDataUrl);
    setSecret(data.secret);
    setTfaStep("setup");
  };

  const verify2FA = async () => {
    const res  = await fetch(`${API_BASE}/api/auth/2fa/verify`, {
      method: "POST", headers, body: JSON.stringify({ code: code2FA }),
    });
    const data = await res.json();
    if (res.ok) {
      setTwoFA(true);
      setBackup(data.backupCodes);
      setTfaStep("done");
      setTfaMsg("2FA enabled successfully!");
    } else {
      setTfaMsg(data.message || "Invalid code");
    }
  };

  const disable2FA = async () => {
    if (!code2FA) { setTfaMsg("Enter your current TOTP code"); return; }
    const res  = await fetch(`${API_BASE}/api/auth/2fa/disable`, {
      method: "POST", headers, body: JSON.stringify({ code: code2FA }),
    });
    const data = await res.json();
    if (res.ok) { setTwoFA(false); setTfaStep("idle"); setTfaMsg("2FA disabled"); }
    else setTfaMsg(data.message || "Failed");
  };

  const TABS = [
    { id: "devices", label: "Active Devices", icon: Monitor },
    { id: "2fa",     label: "Two-Factor Auth", icon: ShieldCheck },
    { id: "history", label: "Login History",   icon: History },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)", padding: "2rem 1.5rem", paddingTop: "7rem" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "#f4f4f5", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <ShieldCheck size={24} style={{ color: "var(--primary)" }} /> Account Security
          </h1>
          <p style={{ color: "#71717a", marginTop: 6 }}>Manage your sessions, 2FA, and login activity</p>
        </div>

        {msg.text && (
          <div style={{ padding: "0.75rem 1rem", borderRadius: 10, marginBottom: "1rem", background: msg.type === "ok" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${msg.type === "ok" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, color: msg.type === "ok" ? "#22c55e" : "#ef4444", fontSize: "0.85rem" }}>
            {msg.text}
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0.5rem" }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id as any)} style={{
              padding: "0.6rem 1rem", borderRadius: 8, border: "none", cursor: "pointer",
              background: tab === id ? "rgba(139,92,246,0.15)" : "transparent",
              color: tab === id ? "var(--primary)" : "#71717a",
              fontWeight: 600, fontSize: "0.85rem", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: "0.4rem",
              transition: "all 0.2s",
            }}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* ── Devices Tab ── */}
        {tab === "devices" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div style={{ color: "#a1a1aa", fontSize: "0.85rem" }}>{sessions.length} active session{sessions.length !== 1 ? "s" : ""}</div>
              {sessions.length > 1 && (
                <button onClick={revokeAll} style={{ padding: "0.5rem 1rem", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", cursor: "pointer", fontSize: "0.8rem", fontWeight: 600, fontFamily: "inherit" }}>
                  <LogOut size={13} style={{ marginRight: 4 }} />Logout All Devices
                </button>
              )}
            </div>

            {sessLoading ? (
              <div style={{ color: "#52525b", textAlign: "center", padding: "2rem" }}>Loading…</div>
            ) : sessions.length === 0 ? (
              <div style={{ color: "#52525b", textAlign: "center", padding: "2rem" }}>No active sessions found</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {sessions.map((s, i) => (
                  <div key={s.id} style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 12, padding: "1rem 1.25rem",
                    display: "flex", alignItems: "center", gap: "1rem",
                  }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(139,92,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {s.os.toLowerCase().includes("android") || s.os.toLowerCase().includes("ios") ? <Smartphone size={18} style={{ color: "var(--primary)" }} /> : <Monitor size={18} style={{ color: "var(--primary)" }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#e4e4e7" }}>
                        {s.deviceName}
                        {i === 0 && <span style={{ marginLeft: 8, fontSize: "0.65rem", background: "rgba(34,197,94,0.15)", color: "#22c55e", padding: "2px 6px", borderRadius: 999 }}>Current</span>}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#71717a", marginTop: 2 }}>
                        {s.ipAddress} · {s.country} · Active {timeAgo(s.lastActive)}
                      </div>
                    </div>
                    {i !== 0 && (
                      <button onClick={() => revokeSession(s.id)} title="Revoke session" style={{ padding: "0.4rem 0.7rem", borderRadius: 7, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444", cursor: "pointer", fontSize: "0.72rem", fontFamily: "inherit" }}>
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 2FA Tab ── */}
        {tab === "2fa" && (
          <div style={{ maxWidth: 520 }}>
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "#f4f4f5" }}>Authenticator App</div>
                  <div style={{ fontSize: "0.75rem", color: "#71717a", marginTop: 3 }}>Use Google Authenticator or Authy</div>
                </div>
                <div style={{
                  padding: "0.35rem 0.85rem", borderRadius: 999,
                  background: twoFA ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.1)",
                  color: twoFA ? "#22c55e" : "#ef4444",
                  fontSize: "0.72rem", fontWeight: 700,
                }}>
                  {twoFA ? "Enabled" : "Disabled"}
                </div>
              </div>

              {tfaMsg && <div style={{ padding: "0.6rem 0.85rem", borderRadius: 8, marginBottom: "1rem", background: "rgba(139,92,246,0.1)", color: "var(--primary)", fontSize: "0.8rem" }}>{tfaMsg}</div>}

              {/* Idle — not enabled */}
              {!twoFA && tfaStep === "idle" && (
                <button onClick={setup2FA} style={{ width: "100%", padding: "0.875rem", borderRadius: 10, background: "linear-gradient(135deg, var(--primary), var(--accent))", border: "none", color: "#fff", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit" }}>
                  Enable 2FA
                </button>
              )}

              {/* Setup — show QR */}
              {tfaStep === "setup" && (
                <div>
                  <p style={{ fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "1rem" }}>
                    Scan this QR code with your authenticator app, then enter the 6-digit code.
                  </p>
                  <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                    {qrData && <img src={qrData} alt="QR Code" style={{ width: 180, height: 180, borderRadius: 12 }} />}
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: "0.6rem 0.85rem", marginBottom: "1rem", fontFamily: "monospace", fontSize: "0.78rem", color: "#a1a1aa", wordBreak: "break-all" }}>
                    Manual key: {secret}
                  </div>
                  <input
                    type="text" placeholder="Enter 6-digit code" value={code2FA}
                    onChange={e => setCode2FA(e.target.value)} maxLength={6}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f4f4f5", fontSize: "1.1rem", fontFamily: "monospace", textAlign: "center", outline: "none", marginBottom: "0.75rem", letterSpacing: "0.2em" }}
                  />
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button onClick={() => setTfaStep("idle")} style={{ flex: 1, padding: "0.75rem", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#a1a1aa", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                    <button onClick={verify2FA} style={{ flex: 2, padding: "0.75rem", borderRadius: 8, background: "linear-gradient(135deg, var(--primary), var(--accent))", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Verify & Enable</button>
                  </div>
                </div>
              )}

              {/* Done — show backup codes */}
              {tfaStep === "done" && backup.length > 0 && (
                <div>
                  <div style={{ padding: "0.75rem", borderRadius: 8, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e", fontSize: "0.8rem", marginBottom: "1rem" }}>
                    ✓ 2FA is now active. Save your backup codes!
                  </div>
                  <div style={{ marginBottom: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", color: "#a1a1aa" }}>Backup Codes (save these!)</span>
                    <button onClick={() => setShowBackup(b => !b)} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer" }}>
                      {showBackup ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {backup.map((c, i) => (
                      <div key={i} style={{ padding: "0.5rem 0.75rem", borderRadius: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", fontFamily: "monospace", fontSize: "0.8rem", color: showBackup ? "#e4e4e7" : "transparent", userSelect: showBackup ? "text" : "none" }}>
                        {c}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Already enabled — disable */}
              {twoFA && tfaStep === "idle" && (
                <div>
                  <p style={{ fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "1rem" }}>
                    Enter your current TOTP code to disable 2FA.
                  </p>
                  <input
                    type="text" placeholder="000000" value={code2FA}
                    onChange={e => setCode2FA(e.target.value)} maxLength={6}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#f4f4f5", fontSize: "1.1rem", fontFamily: "monospace", textAlign: "center", outline: "none", marginBottom: "0.75rem", letterSpacing: "0.2em" }}
                  />
                  <button onClick={disable2FA} style={{ width: "100%", padding: "0.75rem", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", cursor: "pointer", fontWeight: 700, fontFamily: "inherit" }}>
                    Disable 2FA
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Login History Tab ── */}
        {tab === "history" && (
          <div>
            <div style={{ marginBottom: "1rem", color: "#a1a1aa", fontSize: "0.85rem" }}>Last 20 login events</div>
            {histLoading ? (
              <div style={{ textAlign: "center", color: "#52525b", padding: "2rem" }}>Loading…</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {history.map(e => (
                  <div key={e.id} style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${e.status === "SUCCESS" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)"}`,
                    borderRadius: 10, padding: "0.85rem 1.25rem",
                    display: "flex", alignItems: "center", gap: "0.85rem",
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: e.status === "SUCCESS" ? "#22c55e" : "#ef4444", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.8rem", color: "#e4e4e7" }}>{e.deviceName}</div>
                      <div style={{ fontSize: "0.7rem", color: "#71717a" }}>{e.ipAddress} · {e.country}</div>
                      {e.failReason && <div style={{ fontSize: "0.68rem", color: "#ef4444", marginTop: 2 }}>{e.failReason}</div>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "0.68rem", fontWeight: 700, color: e.status === "SUCCESS" ? "#22c55e" : "#ef4444" }}>{e.status}</div>
                      <div style={{ fontSize: "0.65rem", color: "#52525b" }}>{timeAgo(e.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
