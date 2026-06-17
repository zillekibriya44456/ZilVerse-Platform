"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw, Home, ArrowLeft, AlertTriangle } from "lucide-react";

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // Log to monitoring service in production
    console.error("[ZilVerse Error Boundary]", error);
  }, [error]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      textAlign: "center",
      background: "var(--background)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient glow */}
      <div style={{ position: "absolute", top: "10%", left: "20%", width: 380, height: 380, borderRadius: "50%", background: "rgba(239,68,68,0.06)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "20%", width: 300, height: 300, borderRadius: "50%", background: "rgba(245,158,11,0.05)", filter: "blur(80px)", pointerEvents: "none" }} />

      {/* Icon */}
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: "rgba(239,68,68,0.12)",
        border: "1px solid rgba(239,68,68,0.25)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: "2rem",
        animation: "pulse-glow 3s ease-in-out infinite",
      }}>
        <AlertTriangle size={36} color="#ef4444" />
      </div>

      {/* Heading */}
      <h1 style={{
        fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
        fontWeight: 800,
        fontFamily: "'Outfit', sans-serif",
        color: "#e4e4e7",
        marginBottom: "1rem",
        letterSpacing: "-0.03em",
      }}>
        Something went wrong
      </h1>

      <p style={{
        fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)",
        color: "#a1a1aa",
        maxWidth: 480,
        lineHeight: 1.7,
        marginBottom: "0.75rem",
      }}>
        An unexpected error occurred. Don't worry — your data is safe.
        You can try refreshing the page or return to the homepage.
      </p>

      {/* Error digest for debugging */}
      {error?.digest && (
        <div style={{
          padding: "0.35rem 0.9rem",
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.15)",
          borderRadius: 8,
          fontSize: "0.72rem",
          color: "#f87171",
          fontFamily: "monospace",
          marginBottom: "2rem",
        }}>
          Error ID: {error.digest}
        </div>
      )}

      {!error?.digest && <div style={{ height: "2rem" }} />}

      {/* Actions */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.85rem 1.75rem", borderRadius: "12px",
            fontSize: "0.9rem", fontWeight: 600, cursor: "pointer",
            background: "linear-gradient(135deg, #7c3aed, #a855f7)",
            border: "none", color: "#fff",
            boxShadow: "0 8px 24px rgba(124,58,237,0.35)",
            transition: "all 0.2s",
          }}
          onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
          onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
        >
          <RefreshCw size={16} /> Try Again
        </button>

        <Link
          href="/"
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none",
            padding: "0.85rem 1.75rem", borderRadius: "12px",
            fontSize: "0.9rem", fontWeight: 600,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#e4e4e7",
            transition: "all 0.2s",
          }}
          onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.09)"; }}
          onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
        >
          <Home size={16} /> Return Home
        </Link>
      </div>

      {/* Status links */}
      <div style={{ marginTop: "3rem", display: "flex", gap: "1.5rem", fontSize: "0.78rem", color: "#52525b" }}>
        <Link href="/contact" style={{ color: "inherit", textDecoration: "none" }}>Contact Support</Link>
        <span>·</span>
        <Link href="/help" style={{ color: "inherit", textDecoration: "none" }}>Help Center</Link>
      </div>
    </div>
  );
}
