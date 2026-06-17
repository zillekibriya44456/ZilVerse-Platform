"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '@/utils/api';

type ThemeMode = 'dark' | 'light' | 'auto';

export interface ThemeConfig {
  name: string;
  mode: ThemeMode;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  cardStyle: string;
  borderStyle: string;
}

interface ThemeContextProps {
  currentTheme: ThemeConfig;
  setTheme: (config: Partial<ThemeConfig>) => void;
}

const defaultTheme: ThemeConfig = {
  name: 'Cyber Green',
  mode: 'dark',
  primary: '#22C55E',
  secondary: '#06B6D4',
  accent: '#3B82F6',
  background: '#050816',
  cardStyle: 'rgba(17, 24, 39, 0.6)',
  borderStyle: 'rgba(255, 255, 255, 0.08)',
};

const ThemeContext = createContext<ThemeContextProps>({
  currentTheme: defaultTheme,
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTheme, setCurrentThemeState] = useState<ThemeConfig>(defaultTheme);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 1. Try to load from Local Storage first (instant load)
    const saved = localStorage.getItem('zilverse_theme');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrentThemeState(parsed);
      } catch (e) {}
    }

    // 2. Fetch from DB if user is logged in
    const fetchDbTheme = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/auth/theme`, { withCredentials: true });
        if (res.data && res.data.theme) {
          const dbTheme = {
            name: res.data.theme.themeName || defaultTheme.name,
            mode: res.data.theme.mode || defaultTheme.mode,
            primary: res.data.theme.primary || defaultTheme.primary,
            secondary: res.data.theme.secondary || defaultTheme.secondary,
            accent: res.data.theme.accent || defaultTheme.accent,
            background: res.data.theme.background || defaultTheme.background,
            cardStyle: res.data.theme.cardStyle || defaultTheme.cardStyle,
            borderStyle: res.data.theme.borderStyle || defaultTheme.borderStyle,
          };
          setCurrentThemeState(dbTheme);
          localStorage.setItem('zilverse_theme', JSON.stringify(dbTheme));
        }
      } catch (err) {
        // User not logged in or endpoint doesn't exist, ignore
      }
    };
    
    fetchDbTheme();
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    
    const root = document.documentElement;
    root.style.setProperty('--primary', currentTheme.primary);
    root.style.setProperty('--secondary', currentTheme.secondary);
    root.style.setProperty('--highlight', currentTheme.primary); // use primary for highlight often
    root.style.setProperty('--accent', currentTheme.accent);
    root.style.setProperty('--background', currentTheme.background);
    root.style.setProperty('--card', currentTheme.cardStyle);
    root.style.setProperty('--card-border', currentTheme.borderStyle);

    if (currentTheme.mode === 'light') {
      root.style.setProperty('--foreground', '#000000');
      root.style.setProperty('--surface', '#FFFFFF');
    } else {
      root.style.setProperty('--foreground', '#FFFFFF');
      root.style.setProperty('--surface', '#0B1020');
    }
  }, [currentTheme, isLoaded]);

  const setTheme = (newConfig: Partial<ThemeConfig>) => {
    const updatedTheme = { ...currentTheme, ...newConfig };
    setCurrentThemeState(updatedTheme);
    localStorage.setItem('zilverse_theme', JSON.stringify(updatedTheme));

    // Async save to DB
    axios.post(`${API_BASE}/api/auth/theme`, updatedTheme, { withCredentials: true })
      .catch(() => {});
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
