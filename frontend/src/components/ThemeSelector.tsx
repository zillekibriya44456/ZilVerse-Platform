"use client";
import { useState, useRef, useEffect } from "react";
import { useTheme, BUILT_IN_THEMES } from "@/context/ThemeContext";

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

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          borderRadius: "10px",
          padding: ".45rem .65rem",
          cursor: "pointer",
          color: "var(--foreground)",
          fontSize: "1.1rem",
          display: "flex",
          alignItems: "center",
          gap: ".3rem",
          transition: "all 0.3s ease",
          boxShadow: isOpen ? "var(--glow-primary)" : "none",
        }}
        title="Theme Settings"
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'var(--card-border)'; }}
      >
        <svg 
          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ animation: isOpen ? "spin-slow 4s linear infinite" : "none" }}
        >
          <circle cx="12" cy="12" r="5" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 12px)",
            right: 0,
            width: "300px",
            background: "var(--glass-bg)",
            border: "1px solid var(--primary)",
            borderRadius: "16px",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            zIndex: 99999,
            boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
            overflow: "hidden",
            color: "var(--foreground)",
          }}
        >
          <div style={{ padding: "1rem", borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: ".95rem" }}>Select Theme</span>
            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "var(--foreground)", cursor: "pointer", fontSize: "1rem" }}>✕</button>
          </div>
          
          <div style={{ maxHeight: "320px", overflowY: "auto", padding: "0.5rem" }}>
            {BUILT_IN_THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTheme(t.id); setIsOpen(false); }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: currentTheme.id === t.id ? "rgba(168,85,247,0.15)" : "transparent",
                  border: "none",
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  color: "var(--foreground)",
                  cursor: "pointer",
                  textAlign: "left",
                  marginBottom: "4px",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = currentTheme.id === t.id ? "rgba(168,85,247,0.15)" : "var(--card)")}
                onMouseOut={(e) => (e.currentTarget.style.background = currentTheme.id === t.id ? "rgba(168,85,247,0.15)" : "transparent")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ 
                    width: "16px", 
                    height: "16px", 
                    borderRadius: "50%", 
                    background: `linear-gradient(135deg, ${t.colors.primary}, ${t.colors.accent})`,
                    border: "2px solid rgba(255,255,255,0.2)"
                  }} />
                  <span style={{ fontSize: "0.9rem", fontWeight: currentTheme.id === t.id ? 600 : 400 }}>{t.name}</span>
                </div>
                {currentTheme.id === t.id && <span style={{ color: "var(--primary)", fontSize: "0.8rem" }}>✓</span>}
              </button>
            ))}
          </div>
          <div style={{ padding: "0.5rem", borderTop: "1px solid var(--card-border)" }}>
            <button
              onClick={() => {
                setIsOpen(false);
                // Dispatch custom event to open customize modal
                document.dispatchEvent(new CustomEvent("open-theme-customizer"));
              }}
              style={{
                width: "100%", padding: "0.8rem", background: "linear-gradient(135deg, var(--primary), var(--accent))",
                border: "none", borderRadius: "8px", color: "#fff", fontWeight: 600, cursor: "pointer",
                display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem"
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              Customize Theme
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
