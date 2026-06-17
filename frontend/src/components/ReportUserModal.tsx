"use client";
import React, { useState } from "react";
import { X, Flag, AlertTriangle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { API_BASE } from "@/utils/api";

const REASONS = [
  { id: "spam",          label: "Spam",                  desc: "Sending unsolicited messages or content" },
  { id: "scam",          label: "Scam / Fraud",          desc: "Attempting to deceive or defraud" },
  { id: "fake",          label: "Fake Profile",          desc: "Impersonating someone or using false identity" },
  { id: "harassment",    label: "Harassment",            desc: "Bullying, intimidation or persistent unwanted contact" },
  { id: "abuse",         label: "Abuse / Hate Speech",   desc: "Hateful, violent, or discriminatory content" },
  { id: "inappropriate", label: "Inappropriate Content", desc: "Adult, explicit or otherwise inappropriate material" },
];

interface Props {
  reportedUserId: string;
  reportedUserName: string;
  onClose: () => void;
}

export default function ReportUserModal({ reportedUserId, reportedUserName, onClose }: Props) {
  const { token } = useAuth();
  const [reason,   setReason]   = useState("");
  const [details,  setDetails]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(false);
  const [error,    setError]    = useState("");

  const submit = async () => {
    if (!reason) { setError("Please select a reason"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/api/safety/report`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ reportedUserId, reason, details }),
      });
      const data = await res.json();
      if (res.ok) setSuccess(true);
      else setError(data.message || "Failed to submit report");
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: "100%", maxWidth: 480, background: "rgba(8,8,20,0.98)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.7)" }}>
        {/* Header */}
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Flag size={15} style={{ color: "#ef4444" }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#f4f4f5" }}>Report User</div>
              <div style={{ fontSize: "0.7rem", color: "#52525b" }}>Reporting: {reportedUserName}</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer" }}><X size={18} /></button>
        </div>

        <div style={{ padding: "1.5rem" }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                <Flag size={24} style={{ color: "#22c55e" }} />
              </div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "#f4f4f5", marginBottom: 8 }}>Report Submitted</div>
              <div style={{ fontSize: "0.8rem", color: "#71717a", marginBottom: "1.5rem" }}>
                Our team will review your report within 24 hours. Thank you for keeping ZilVerse safe.
              </div>
              <button onClick={onClose} style={{ padding: "0.75rem 2rem", borderRadius: 10, background: "linear-gradient(135deg, var(--primary), var(--accent))", border: "none", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Done
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div style={{ padding: "0.65rem 1rem", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444", fontSize: "0.8rem", marginBottom: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <AlertTriangle size={14} /> {error}
                </div>
              )}

              <p style={{ fontSize: "0.8rem", color: "#a1a1aa", marginBottom: "1rem" }}>
                Why are you reporting <strong style={{ color: "#e4e4e7" }}>{reportedUserName}</strong>?
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem" }}>
                {REASONS.map(r => (
                  <div
                    key={r.id}
                    onClick={() => setReason(r.id)}
                    style={{
                      padding: "0.85rem 1rem",
                      borderRadius: 10,
                      border: `1px solid ${reason === r.id ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.06)"}`,
                      background: reason === r.id ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.02)",
                      cursor: "pointer", transition: "all 0.15s",
                      display: "flex", alignItems: "center", gap: "0.75rem",
                    }}
                  >
                    <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${reason === r.id ? "#ef4444" : "rgba(255,255,255,0.2)"}`, background: reason === r.id ? "#ef4444" : "transparent", flexShrink: 0, transition: "all 0.15s" }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "#e4e4e7" }}>{r.label}</div>
                      <div style={{ fontSize: "0.7rem", color: "#71717a" }}>{r.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom: "1.25rem" }}>
                <label style={{ fontSize: "0.75rem", color: "#a1a1aa", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", display: "block", marginBottom: "0.4rem" }}>
                  Additional details (optional)
                </label>
                <textarea
                  value={details} onChange={e => setDetails(e.target.value)}
                  placeholder="Provide any additional context..."
                  rows={3}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#e4e4e7", fontSize: "0.82rem", resize: "vertical", outline: "none", fontFamily: "inherit" }}
                />
              </div>

              <div style={{ display: "flex", gap: "0.6rem" }}>
                <button onClick={onClose} style={{ flex: 1, padding: "0.75rem", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#a1a1aa", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                <button onClick={submit} disabled={loading || !reason} style={{ flex: 2, padding: "0.75rem", borderRadius: 10, background: reason ? "rgba(239,68,68,0.9)" : "rgba(239,68,68,0.3)", border: "none", color: "#fff", fontWeight: 700, cursor: reason ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
                  {loading ? "Submitting…" : "Submit Report"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
