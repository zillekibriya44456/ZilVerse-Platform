"use client";
import React, { useState, useEffect } from "react";
import { useTheme, ThemeType } from "@/context/ThemeContext";

export default function ThemeCustomizerModal() {
  const { currentTheme, applyCustomTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  
  const [customColors, setCustomColors] = useState({
    background: "#09090b",
    foreground: "#fafafa",
    primary: "#A855F7",
    accent: "#3b82f6",
    glassBg: "rgba(15, 15, 20, 0.6)",
  });

  useEffect(() => {
    const handleOpen = () => {
      setCustomColors({
        background: currentTheme.colors.background,
        foreground: currentTheme.colors.foreground,
        primary: currentTheme.colors.primary,
        accent: currentTheme.colors.accent,
        glassBg: currentTheme.colors.glassBg,
      });
      setIsOpen(true);
    };

    document.addEventListener("open-theme-customizer", handleOpen);
    return () => document.removeEventListener("open-theme-customizer", handleOpen);
  }, [currentTheme]);

  if (!isOpen) return null;

  const handleChange = (key: string, value: string) => {
    const newColors = { ...customColors, [key]: value };
    setCustomColors(newColors);
    
    // Live Preview
    const root = document.documentElement;
    root.style.setProperty(`--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`, value);
  };

  const handleSave = () => {
    const newTheme: ThemeType = {
      id: "custom",
      name: "My Custom Theme",
      colors: {
        ...currentTheme.colors,
        ...customColors,
        // Calculate derivatives
        card: customColors.background === "#ffffff" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.05)",
        cardBorder: customColors.background === "#ffffff" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)",
        glassBorder: customColors.background === "#ffffff" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.08)",
        glowPrimary: `0 0 40px ${customColors.primary}80`,
        glowAccent: `0 0 40px ${customColors.accent}80`,
      }
    };
    applyCustomTheme(newTheme);
    setIsOpen(false);
  };

  const handleClose = () => {
    // Revert preview
    const root = document.documentElement;
    Object.entries(currentTheme.colors).forEach(([key, val]) => {
      root.style.setProperty(`--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`, val);
    });
    setIsOpen(false);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
      display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100000
    }}>
      <div style={{
        background: "var(--glass-bg)", border: "1px solid var(--card-border)",
        borderRadius: "20px", width: "90%", maxWidth: "500px",
        boxShadow: "0 25px 50px rgba(0,0,0,0.5)", overflow: "hidden", color: "var(--foreground)"
      }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid var(--card-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.25rem", margin: 0 }}>🎨 Theme Studio</h2>
          <button onClick={handleClose} style={{ background: "none", border: "none", color: "var(--foreground)", fontSize: "1.5rem", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>Background Color</label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <input type="color" value={customColors.background} onChange={(e) => handleChange("background", e.target.value)} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "8px", cursor: "pointer" }} />
              <input type="text" value={customColors.background} onChange={(e) => handleChange("background", e.target.value)} style={{ flex: 1, padding: "0.75rem", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: "8px", color: "var(--foreground)" }} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>Text (Foreground) Color</label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <input type="color" value={customColors.foreground} onChange={(e) => handleChange("foreground", e.target.value)} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "8px", cursor: "pointer" }} />
              <input type="text" value={customColors.foreground} onChange={(e) => handleChange("foreground", e.target.value)} style={{ flex: 1, padding: "0.75rem", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: "8px", color: "var(--foreground)" }} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>Primary Brand Color</label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <input type="color" value={customColors.primary} onChange={(e) => handleChange("primary", e.target.value)} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "8px", cursor: "pointer" }} />
              <input type="text" value={customColors.primary} onChange={(e) => handleChange("primary", e.target.value)} style={{ flex: 1, padding: "0.75rem", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: "8px", color: "var(--foreground)" }} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>Accent Color (Gradients)</label>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <input type="color" value={customColors.accent} onChange={(e) => handleChange("accent", e.target.value)} style={{ width: "40px", height: "40px", padding: 0, border: "none", borderRadius: "8px", cursor: "pointer" }} />
              <input type="text" value={customColors.accent} onChange={(e) => handleChange("accent", e.target.value)} style={{ flex: 1, padding: "0.75rem", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: "8px", color: "var(--foreground)" }} />
            </div>
          </div>

        </div>

        <div style={{ padding: "1.5rem", borderTop: "1px solid var(--card-border)", display: "flex", gap: "1rem", background: "var(--card)" }}>
          <button onClick={handleClose} style={{ flex: 1, padding: "0.8rem", background: "transparent", border: "1px solid var(--card-border)", borderRadius: "8px", color: "var(--foreground)", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSave} style={{ flex: 1, padding: "0.8rem", background: "linear-gradient(135deg, var(--primary), var(--accent))", border: "none", borderRadius: "8px", color: "#fff", fontWeight: 600, cursor: "pointer", boxShadow: "var(--glow-primary)" }}>Save & Apply</button>
        </div>
      </div>
    </div>
  );
}
