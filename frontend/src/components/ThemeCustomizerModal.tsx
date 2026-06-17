"use client";
import React, { useState, useEffect } from "react";
import { useTheme, ThemeConfig } from "@/context/ThemeContext";

export default function ThemeCustomizerModal() {
  const { currentTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [colors, setColors] = useState({
    primary:    currentTheme.primary,
    secondary:  currentTheme.secondary,
    accent:     currentTheme.accent,
    background: currentTheme.background,
  });

  useEffect(() => {
    const handleOpen = () => {
      setColors({
        primary:    currentTheme.primary,
        secondary:  currentTheme.secondary,
        accent:     currentTheme.accent,
        background: currentTheme.background,
      });
      setIsOpen(true);
    };
    document.addEventListener("open-theme-customizer", handleOpen);
    return () => document.removeEventListener("open-theme-customizer", handleOpen);
  }, [currentTheme]);

  if (!isOpen) return null;

  const handleChange = (key: keyof typeof colors, value: string) => {
    const next = { ...colors, [key]: value };
    setColors(next);
    // Live CSS preview
    const root = document.documentElement;
    root.style.setProperty(`--${key}`, value);
  };

  const handleSave = () => {
    setTheme(colors);
    setIsOpen(false);
  };

  const handleClose = () => {
    // Revert live preview
    const root = document.documentElement;
    root.style.setProperty("--primary",    currentTheme.primary);
    root.style.setProperty("--secondary",  currentTheme.secondary);
    root.style.setProperty("--accent",     currentTheme.accent);
    root.style.setProperty("--background", currentTheme.background);
    setIsOpen(false);
  };

  const FIELDS: { key: keyof typeof colors; label: string }[] = [
    { key: "primary",    label: "Primary Brand Color" },
    { key: "secondary",  label: "Secondary Color" },
    { key: "accent",     label: "Accent Color (Gradients)" },
    { key: "background", label: "Background Color" },
  ];

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
      display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100000
    }}>
      <div style={{
        background: "rgba(11,11,20,0.98)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 20, width: "90%", maxWidth: 480,
        boxShadow: "0 25px 60px rgba(0,0,0,0.7)", overflow: "hidden", color: "#e4e4e7"
      }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: "1.2rem", margin: 0, fontWeight: 700 }}>🎨 Theme Studio</h2>
          <button onClick={handleClose} style={{ background: "none", border: "none", color: "#a1a1aa", fontSize: "1.4rem", cursor: "pointer" }}>✕</button>
        </div>

        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {FIELDS.map(({ key, label }) => (
            <div key={key}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.85rem", fontWeight: 600, color: "#a1a1aa" }}>{label}</label>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <input type="color" value={colors[key]} onChange={e => handleChange(key, e.target.value)}
                  style={{ width: 40, height: 40, padding: 0, border: "none", borderRadius: 8, cursor: "pointer", flexShrink: 0 }} />
                <input type="text" value={colors[key]} onChange={e => handleChange(key, e.target.value)}
                  style={{ flex: 1, padding: "0.65rem 0.85rem", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#e4e4e7", fontFamily: "monospace" }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", gap: "1rem" }}>
          <button onClick={handleClose} style={{ flex: 1, padding: "0.75rem", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, color: "#e4e4e7", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button onClick={handleSave}  style={{ flex: 1, padding: "0.75rem", background: "linear-gradient(135deg, var(--primary), var(--accent))", border: "none", borderRadius: 10, color: "#fff", fontWeight: 700, cursor: "pointer" }}>Save &amp; Apply</button>
        </div>
      </div>
    </div>
  );
}
