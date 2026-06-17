"use client";
import { useTheme } from "@/context/ThemeContext";
import { Palette } from "lucide-react";

export default function ThemeStudioButton() {
  const { openStudio } = useTheme();

  return (
    <button
      onClick={openStudio}
      aria-label="Open Theme Studio"
      title="Theme Studio"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 9990,
        width: 52,
        height: 52,
        borderRadius: "50%",
        background: "linear-gradient(135deg, var(--primary), var(--accent))",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 24px var(--primary)60, 0 0 0 1px rgba(255,255,255,0.08)",
        transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s",
        color: "#fff",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "scale(1.12)";
        e.currentTarget.style.boxShadow = "0 8px 32px var(--primary)80, 0 0 0 1px rgba(255,255,255,0.12)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "0 4px 24px var(--primary)60, 0 0 0 1px rgba(255,255,255,0.08)";
      }}
    >
      <Palette size={22} />
    </button>
  );
}
