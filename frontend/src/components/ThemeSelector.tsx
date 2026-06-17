"use client";
import { useState, useRef, useEffect } from "react";
import { useTheme, ThemeConfig } from "@/context/ThemeContext";

// Built-in preset themes (defined locally, no longer imported from context)
const BUILT_IN_THEMES: Array<ThemeConfig & { id: string }> = [
  { id: "cyber",   name: "Cyber Purple",   mode: "dark",  primary: "#A855F7", secondary: "#7C3AED", accent: "#3B82F6", background: "#050816", cardStyle: "rgba(17,24,39,0.6)",  borderStyle: "rgba(255,255,255,0.08)" },
  { id: "ocean",   name: "Deep Ocean",     mode: "dark",  primary: "#06B6D4", secondary: "#0891B2", accent: "#6366F1", background: "#020B18", cardStyle: "rgba(8,32,60,0.6)",   borderStyle: "rgba(6,182,212,0.15)" },
  { id: "rose",    name: "Rose Gold",      mode: "dark",  primary: "#EC4899", secondary: "#DB2777", accent: "#F59E0B", background: "#0F0008", cardStyle: "rgba(30,5,20,0.6)",   borderStyle: "rgba(236,72,153,0.15)" },
  { id: "matrix",  name: "Cyber Green",    mode: "dark",  primary: "#22C55E", secondary: "#16A34A", accent: "#06B6D4", background: "#040D0A", cardStyle: "rgba(5,20,12,0.6)",   borderStyle: "rgba(34,197,94,0.15)" },
  { id: "sunset",  name: "Sunset",         mode: "dark",  primary: "#F97316", secondary: "#EA580C", accent: "#EF4444", background: "#0D0700", cardStyle: "rgba(30,10,5,0.6)",   borderStyle: "rgba(249,115,22,0.15)" },
  { id: "light",   name: "Clean Light",    mode: "light", primary: "#6366F1", secondary: "#4F46E5", accent: "#0EA5E9", background: "#F8FAFC", cardStyle: "rgba(0,0,0,0.04)",    borderStyle: "rgba(0,0,0,0.08)" },
];

export default function ThemeSelector() {
  const { currentTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectTheme = (t: typeof BUILT_IN_THEMES[number]) => {
    const { id, ...themeConfig } = t;
    setTheme(themeConfig);
    setIsOpen(false);
  };

  const isActive = (t: typeof BUILT_IN_THEMES[number]) =>
    currentTheme.primary === t.primary && currentTheme.name === t.name;

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          borderRadius: 10,
          padding: ".45rem .65rem",
          cursor: "pointer",
          color: "var(--foreground)",
          fontSize: "1.1rem",
          display: "flex",
          alignItems: "center",
          gap: ".3rem",
          transition: "all 0.3s ease",
          boxShadow: isOpen ? "0 0 20px var(--primary)40" : "none",
        }}
        title="Theme Settings"
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.borderColor = "var(--primary)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = "var(--card-border)"; }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ animation: isOpen ? "spin-slow 4s linear infinite" : "none" }}>
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </button>

      {isOpen && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 12px)",
          right: 0,
          width: 300,
          background: "rgba(8,8,20,0.97)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          zIndex: 99999,
          boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
          overflow: "hidden",
          color: "var(--foreground)",
        }}>
          <div style={{ padding: "1rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: ".95rem" }}>Select Theme</span>
            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "#a1a1aa", cursor: "pointer", fontSize: "1rem" }}>✕</button>
          </div>

          <div style={{ maxHeight: 320, overflowY: "auto", padding: "0.5rem" }}>
            {BUILT_IN_THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => handleSelectTheme(t)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: isActive(t) ? "rgba(168,85,247,0.15)" : "transparent",
                  border: "none",
                  padding: "0.75rem 1rem",
                  borderRadius: 8,
                  color: "var(--foreground)",
                  cursor: "pointer",
                  textAlign: "left",
                  marginBottom: 4,
                  transition: "background 0.2s",
                }}
                onMouseOver={e => (e.currentTarget.style.background = isActive(t) ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.05)")}
                onMouseOut={e => (e.currentTarget.style.background = isActive(t) ? "rgba(168,85,247,0.15)" : "transparent")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${t.primary}, ${t.accent})`,
                    border: "2px solid rgba(255,255,255,0.2)"
                  }} />
                  <span style={{ fontSize: "0.9rem", fontWeight: isActive(t) ? 600 : 400 }}>{t.name}</span>
                </div>
                {isActive(t) && <span style={{ color: "var(--primary)", fontSize: "0.8rem" }}>✓</span>}
              </button>
            ))}
          </div>

          <div style={{ padding: "0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button
              onClick={() => {
                setIsOpen(false);
                document.dispatchEvent(new CustomEvent("open-theme-customizer"));
              }}
              style={{
                width: "100%", padding: "0.8rem",
                background: "linear-gradient(135deg, var(--primary), var(--accent))",
                border: "none", borderRadius: 8, color: "#fff", fontWeight: 600, cursor: "pointer",
                display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem"
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              Customize Theme
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
