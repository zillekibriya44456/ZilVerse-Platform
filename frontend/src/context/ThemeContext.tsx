"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeType = {
  id: string;
  name: string;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardBorder: string;
    primary: string;
    primaryHover: string;
    secondary: string;
    accent: string;
    destructive: string;
    glassBg: string;
    glassBorder: string;
    glowPrimary: string;
    glowAccent: string;
  };
};

export const BUILT_IN_THEMES: ThemeType[] = [
  {
    id: "zilverse-dark",
    name: "ZilVerse Dark (Default)",
    colors: {
      background: "#09090b",
      foreground: "#fafafa",
      card: "rgba(255, 255, 255, 0.05)",
      cardBorder: "rgba(255, 255, 255, 0.1)",
      primary: "#A855F7",
      primaryHover: "#9333ea",
      secondary: "#10b981",
      accent: "#3b82f6",
      destructive: "#ef4444",
      glassBg: "rgba(15, 15, 20, 0.6)",
      glassBorder: "rgba(255, 255, 255, 0.08)",
      glowPrimary: "0 0 40px rgba(168, 85, 247, 0.35)",
      glowAccent: "0 0 40px rgba(59, 130, 246, 0.3)",
    },
  },
  {
    id: "light-pro",
    name: "Light Pro",
    colors: {
      background: "#ffffff",
      foreground: "#09090b",
      card: "rgba(0, 0, 0, 0.03)",
      cardBorder: "rgba(0, 0, 0, 0.1)",
      primary: "#2563eb",
      primaryHover: "#1d4ed8",
      secondary: "#059669",
      accent: "#7c3aed",
      destructive: "#dc2626",
      glassBg: "rgba(255, 255, 255, 0.8)",
      glassBorder: "rgba(0, 0, 0, 0.1)",
      glowPrimary: "0 0 40px rgba(37, 99, 235, 0.35)",
      glowAccent: "0 0 40px rgba(124, 58, 237, 0.3)",
    },
  },
  {
    id: "cyber-future",
    name: "Cyber Future",
    colors: {
      background: "#050510",
      foreground: "#e0e7ff",
      card: "rgba(0, 255, 255, 0.05)",
      cardBorder: "rgba(0, 255, 255, 0.2)",
      primary: "#00f0ff",
      primaryHover: "#00b8ff",
      secondary: "#ff00e5",
      accent: "#7000ff",
      destructive: "#ff003c",
      glassBg: "rgba(5, 5, 16, 0.7)",
      glassBorder: "rgba(0, 240, 255, 0.15)",
      glowPrimary: "0 0 40px rgba(0, 240, 255, 0.5)",
      glowAccent: "0 0 40px rgba(112, 0, 255, 0.5)",
    },
  },
  {
    id: "ocean-global",
    name: "Ocean Global",
    colors: {
      background: "#020617",
      foreground: "#f8fafc",
      card: "rgba(255, 255, 255, 0.05)",
      cardBorder: "rgba(56, 189, 248, 0.2)",
      primary: "#0ea5e9",
      primaryHover: "#0284c7",
      secondary: "#06b6d4",
      accent: "#3b82f6",
      destructive: "#ef4444",
      glassBg: "rgba(2, 6, 23, 0.6)",
      glassBorder: "rgba(56, 189, 248, 0.1)",
      glowPrimary: "0 0 40px rgba(14, 165, 233, 0.35)",
      glowAccent: "0 0 40px rgba(59, 130, 246, 0.3)",
    },
  },
  {
    id: "emerald-innovation",
    name: "Emerald Innovation",
    colors: {
      background: "#022c22",
      foreground: "#ecfdf5",
      card: "rgba(255, 255, 255, 0.05)",
      cardBorder: "rgba(16, 185, 129, 0.2)",
      primary: "#10b981",
      primaryHover: "#059669",
      secondary: "#34d399",
      accent: "#0ea5e9",
      destructive: "#ef4444",
      glassBg: "rgba(2, 44, 34, 0.6)",
      glassBorder: "rgba(16, 185, 129, 0.1)",
      glowPrimary: "0 0 40px rgba(16, 185, 129, 0.35)",
      glowAccent: "0 0 40px rgba(14, 165, 233, 0.3)",
    },
  },
  {
    id: "royal-premium",
    name: "Royal Premium",
    colors: {
      background: "#1e1b4b",
      foreground: "#fdf4ff",
      card: "rgba(255, 255, 255, 0.05)",
      cardBorder: "rgba(217, 119, 6, 0.3)",
      primary: "#d97706",
      primaryHover: "#b45309",
      secondary: "#f59e0b",
      accent: "#8b5cf6",
      destructive: "#ef4444",
      glassBg: "rgba(30, 27, 75, 0.6)",
      glassBorder: "rgba(217, 119, 6, 0.15)",
      glowPrimary: "0 0 40px rgba(217, 119, 6, 0.35)",
      glowAccent: "0 0 40px rgba(139, 92, 246, 0.3)",
    },
  },
  {
    id: "startup-energy",
    name: "Startup Energy",
    colors: {
      background: "#171717",
      foreground: "#fafafa",
      card: "rgba(255, 255, 255, 0.05)",
      cardBorder: "rgba(249, 115, 22, 0.2)",
      primary: "#f97316",
      primaryHover: "#ea580c",
      secondary: "#f43f5e",
      accent: "#8b5cf6",
      destructive: "#ef4444",
      glassBg: "rgba(23, 23, 23, 0.6)",
      glassBorder: "rgba(249, 115, 22, 0.1)",
      glowPrimary: "0 0 40px rgba(249, 115, 22, 0.35)",
      glowAccent: "0 0 40px rgba(139, 92, 246, 0.3)",
    },
  },
  {
    id: "midnight-ai",
    name: "Midnight AI",
    colors: {
      background: "#000000",
      foreground: "#ffffff",
      card: "rgba(255, 255, 255, 0.02)",
      cardBorder: "rgba(255, 255, 255, 0.05)",
      primary: "#6366f1",
      primaryHover: "#4f46e5",
      secondary: "#14b8a6",
      accent: "#e879f9",
      destructive: "#ef4444",
      glassBg: "rgba(0, 0, 0, 0.7)",
      glassBorder: "rgba(255, 255, 255, 0.04)",
      glowPrimary: "0 0 40px rgba(99, 102, 241, 0.35)",
      glowAccent: "0 0 40px rgba(232, 121, 249, 0.3)",
    },
  },
];

type ThemeContextType = {
  currentTheme: ThemeType;
  setTheme: (themeId: string) => void;
  applyCustomTheme: (theme: ThemeType) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeType>(BUILT_IN_THEMES[0]);

  useEffect(() => {
    // Load theme from localStorage
    const savedThemeId = localStorage.getItem("zilverse_theme_id");
    const savedCustomTheme = localStorage.getItem("zilverse_custom_theme");

    if (savedCustomTheme) {
      try {
        const parsed = JSON.parse(savedCustomTheme);
        setCurrentTheme(parsed);
      } catch (e) {
        console.error("Failed to parse custom theme");
      }
    } else if (savedThemeId) {
      const found = BUILT_IN_THEMES.find((t) => t.id === savedThemeId);
      if (found) setCurrentTheme(found);
    }
  }, []);

  useEffect(() => {
    // Apply theme variables to root element
    const root = document.documentElement;
    const colors = currentTheme.colors;
    
    root.style.setProperty("--background", colors.background);
    root.style.setProperty("--foreground", colors.foreground);
    root.style.setProperty("--card", colors.card);
    root.style.setProperty("--card-border", colors.cardBorder);
    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--primary-hover", colors.primaryHover);
    root.style.setProperty("--secondary", colors.secondary);
    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--destructive", colors.destructive);
    root.style.setProperty("--glass-bg", colors.glassBg);
    root.style.setProperty("--glass-border", colors.glassBorder);
    root.style.setProperty("--glow-primary", colors.glowPrimary);
    root.style.setProperty("--glow-accent", colors.glowAccent);

    // Ensure smooth transitions for color changes
    root.style.setProperty("transition", "background-color 0.3s ease, color 0.3s ease");
  }, [currentTheme]);

  const setTheme = (themeId: string) => {
    const found = BUILT_IN_THEMES.find((t) => t.id === themeId);
    if (found) {
      setCurrentTheme(found);
      localStorage.setItem("zilverse_theme_id", themeId);
      localStorage.removeItem("zilverse_custom_theme");
    }
  };

  const applyCustomTheme = (theme: ThemeType) => {
    setCurrentTheme(theme);
    localStorage.setItem("zilverse_custom_theme", JSON.stringify(theme));
    localStorage.setItem("zilverse_theme_id", "custom");
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, applyCustomTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
