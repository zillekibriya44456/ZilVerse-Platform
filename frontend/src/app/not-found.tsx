"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, Search, Briefcase, Users, Box } from "lucide-react";

const SUGGESTIONS = [
  { label: "Browse Jobs",       href: "/jobs",        icon: Briefcase, color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  { label: "Find Freelancers",  href: "/freelancers", icon: Users,     color: "#a855f7", bg: "rgba(168,85,247,0.12)" },
  { label: "Marketplace",       href: "/projects",    icon: Box,       color: "#22c55e", bg: "rgba(34,197,94,0.12)"  },
];

export default function NotFound() {
  const router = useRouter();

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
      {/* Ambient glow blobs */}
      <div style={{ position: "absolute", top: "10%", left: "15%", width: 400, height: 400, borderRadius: "50%", background: "rgba(124,58,237,0.08)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "15%", width: 350, height: 350, borderRadius: "50%", background: "rgba(6,182,212,0.07)", filter: "blur(80px)", pointerEvents: "none" }} />

      {/* 404 Number */}
      <div style={{ position: "relative", marginBottom: "1.5rem" }}>
        <h1 style={{
          fontSize: "clamp(6rem, 20vw, 10rem)",
          fontWeight: 900,
          fontFamily: "'Outfit', sans-serif",
          background: "linear-gradient(135deg, #a78bfa 0%, #22d3ee 50%, #4ade80 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          margin: 0,
          lineHeight: 1,
          letterSpacing: "-0.05em",
          animation: "pulse-glow 3s ease-in-out infinite",
        }}>404</h1>
        {/* Floating emoji */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontSize: "2.5rem",
          animation: "float 4s ease-in-out infinite",
          pointerEvents: "none",
        }}>🌌</div>
      </div>

      {/* Message */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "0.6rem 1.5rem",
        marginBottom: "1rem",
        backdropFilter: "blur(10px)",
      }}>
        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#a1a1aa", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Page Not Found
        </span>
      </div>

      <p style={{
        fontSize: "clamp(1rem, 2vw, 1.15rem)",
        color: "#a1a1aa",
        maxWidth: 480,
        lineHeight: 1.7,
        marginBottom: "2.5rem",
      }}>
        The page you're looking for doesn't exist or may have been moved. Let's get you back to the ZilVerse ecosystem.
      </p>

      {/* Primary Actions */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center", marginBottom: "3rem" }}>
        <button
          onClick={() => router.back()}
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.85rem 1.75rem", borderRadius: "12px",
            fontSize: "0.9rem", fontWeight: 600,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#e4e4e7", cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseOver={e => { e.currentTarget.style.background = "rgba(255,255,255,0.09)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; }}
          onMouseOut={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
        >
          <ArrowLeft size={16} /> Go Back
        </button>

        <Link
          href="/"
          style={{
            display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none",
            padding: "0.85rem 1.75rem", borderRadius: "12px",
            fontSize: "0.9rem", fontWeight: 600,
            background: "linear-gradient(135deg, #7c3aed, #3b82f6)",
            color: "#fff",
            boxShadow: "0 8px 24px rgba(124,58,237,0.35)",
            transition: "all 0.2s",
          }}
          onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(124,58,237,0.45)"; }}
          onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(124,58,237,0.35)"; }}
        >
          <Home size={16} /> Return Home
        </Link>
      </div>

      {/* Suggestions */}
      <div style={{ width: "100%", maxWidth: 480 }}>
        <p style={{ fontSize: "0.78rem", color: "#52525b", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, marginBottom: "1rem" }}>
          Or explore →
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
          {SUGGESTIONS.map(s => {
            const Icon = s.icon;
            return (
              <Link
                key={s.href}
                href={s.href}
                style={{
                  display: "flex", alignItems: "center", gap: "0.5rem",
                  padding: "0.55rem 1.1rem", borderRadius: "99px",
                  background: s.bg,
                  border: `1px solid ${s.color}30`,
                  color: s.color,
                  textDecoration: "none",
                  fontSize: "0.825rem", fontWeight: 600,
                  transition: "transform 0.2s",
                }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
              >
                <Icon size={14} /> {s.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
