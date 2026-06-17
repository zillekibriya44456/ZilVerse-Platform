"use client";
import React, {
  createContext, useContext, useEffect, useState, useCallback, useRef
} from 'react';
import axios from 'axios';
import { API_BASE } from '@/utils/api';

// ── Types ────────────────────────────────────────────────────────────────────

export interface ThemePreset {
  id: string;
  name: string;
  emoji: string;
  mode: 'dark' | 'light';
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  surface: string;
  card: string;
  cardBorder: string;
  glassBg: string;
  glowPrimary: string;
  bodyGradient: string;
}

export interface AdvancedOptions {
  glassmorphism: boolean;
  gradients: boolean;
  animations: boolean;
  particles: boolean;
  compactLayout: boolean;
}

export interface ThemeConfig {
  presetId: string;
  name: string;
  mode: 'dark' | 'light';
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  surface: string;
  card: string;
  cardBorder: string;
  glassBg: string;
  glowPrimary: string;
  bodyGradient: string;
  advanced: AdvancedOptions;
  dynamicTheme: boolean;
}

interface ThemeContextProps {
  currentTheme: ThemeConfig;
  presets: ThemePreset[];
  applyPreset: (preset: ThemePreset) => void;
  setCustomColors: (colors: Partial<ThemeConfig>) => void;
  setAdvanced: (opts: Partial<AdvancedOptions>) => void;
  toggleDynamic: (on: boolean) => void;
  isStudioOpen: boolean;
  openStudio: () => void;
  closeStudio: () => void;
}

// ── Preset Themes ────────────────────────────────────────────────────────────

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'dark',
    name: 'Dark Mode',
    emoji: '🌑',
    mode: 'dark',
    primary:    '#8B5CF6',
    secondary:  '#06B6D4',
    accent:     '#3B82F6',
    background: '#050816',
    foreground: '#FFFFFF',
    surface:    '#0B1020',
    card:       'rgba(17,24,39,0.6)',
    cardBorder: 'rgba(255,255,255,0.08)',
    glassBg:    'rgba(11,16,32,0.7)',
    glowPrimary:'0 0 30px rgba(139,92,246,0.25)',
    bodyGradient: 'radial-gradient(circle at 15% 0%,rgba(124,58,237,0.12) 0,transparent 40%),radial-gradient(circle at 85% 0%,rgba(6,182,212,0.08) 0,transparent 40%)',
  },
  {
    id: 'light',
    name: 'Light Mode',
    emoji: '☀️',
    mode: 'light',
    primary:    '#7C3AED',
    secondary:  '#0891B2',
    accent:     '#2563EB',
    background: '#F8FAFC',
    foreground: '#0F172A',
    surface:    '#FFFFFF',
    card:       'rgba(255,255,255,0.9)',
    cardBorder: 'rgba(0,0,0,0.08)',
    glassBg:    'rgba(255,255,255,0.7)',
    glowPrimary:'0 0 30px rgba(124,58,237,0.15)',
    bodyGradient: 'radial-gradient(circle at 15% 0%,rgba(124,58,237,0.06) 0,transparent 40%),radial-gradient(circle at 85% 0%,rgba(6,182,212,0.04) 0,transparent 40%)',
  },
  {
    id: 'midnight',
    name: 'Midnight Blue',
    emoji: '🌊',
    mode: 'dark',
    primary:    '#3B82F6',
    secondary:  '#6366F1',
    accent:     '#8B5CF6',
    background: '#020B18',
    foreground: '#E2E8F0',
    surface:    '#041028',
    card:       'rgba(4,16,40,0.8)',
    cardBorder: 'rgba(59,130,246,0.12)',
    glassBg:    'rgba(2,11,24,0.8)',
    glowPrimary:'0 0 30px rgba(59,130,246,0.3)',
    bodyGradient: 'radial-gradient(circle at 20% 0%,rgba(59,130,246,0.15) 0,transparent 50%),radial-gradient(circle at 80% 100%,rgba(99,102,241,0.1) 0,transparent 50%)',
  },
  {
    id: 'cyber',
    name: 'Cyber Green',
    emoji: '🟢',
    mode: 'dark',
    primary:    '#22C55E',
    secondary:  '#10B981',
    accent:     '#06B6D4',
    background: '#020D05',
    foreground: '#DCFCE7',
    surface:    '#041208',
    card:       'rgba(4,18,8,0.8)',
    cardBorder: 'rgba(34,197,94,0.15)',
    glassBg:    'rgba(2,13,5,0.75)',
    glowPrimary:'0 0 30px rgba(34,197,94,0.3)',
    bodyGradient: 'radial-gradient(circle at 15% 0%,rgba(34,197,94,0.12) 0,transparent 40%),radial-gradient(circle at 85% 100%,rgba(6,182,212,0.08) 0,transparent 40%)',
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    emoji: '🌊',
    mode: 'dark',
    primary:    '#06B6D4',
    secondary:  '#0891B2',
    accent:     '#3B82F6',
    background: '#010B12',
    foreground: '#CFFAFE',
    surface:    '#021522',
    card:       'rgba(2,21,34,0.8)',
    cardBorder: 'rgba(6,182,212,0.15)',
    glassBg:    'rgba(1,11,18,0.8)',
    glowPrimary:'0 0 30px rgba(6,182,212,0.35)',
    bodyGradient: 'radial-gradient(circle at 20% 10%,rgba(6,182,212,0.15) 0,transparent 50%),radial-gradient(circle at 80% 90%,rgba(59,130,246,0.08) 0,transparent 50%)',
  },
  {
    id: 'royal',
    name: 'Royal Purple',
    emoji: '👑',
    mode: 'dark',
    primary:    '#A855F7',
    secondary:  '#9333EA',
    accent:     '#EC4899',
    background: '#07020F',
    foreground: '#FAF5FF',
    surface:    '#0F0520',
    card:       'rgba(15,5,32,0.8)',
    cardBorder: 'rgba(168,85,247,0.15)',
    glassBg:    'rgba(7,2,15,0.8)',
    glowPrimary:'0 0 35px rgba(168,85,247,0.35)',
    bodyGradient: 'radial-gradient(circle at 15% 0%,rgba(168,85,247,0.15) 0,transparent 50%),radial-gradient(circle at 85% 100%,rgba(236,72,153,0.08) 0,transparent 40%)',
  },
  {
    id: 'emerald',
    name: 'Emerald Green',
    emoji: '💎',
    mode: 'dark',
    primary:    '#10B981',
    secondary:  '#059669',
    accent:     '#6EE7B7',
    background: '#01100A',
    foreground: '#D1FAE5',
    surface:    '#021A0F',
    card:       'rgba(2,26,15,0.8)',
    cardBorder: 'rgba(16,185,129,0.15)',
    glassBg:    'rgba(1,16,10,0.8)',
    glowPrimary:'0 0 30px rgba(16,185,129,0.3)',
    bodyGradient: 'radial-gradient(circle at 10% 5%,rgba(16,185,129,0.14) 0,transparent 50%),radial-gradient(circle at 90% 90%,rgba(5,150,105,0.08) 0,transparent 40%)',
  },
  {
    id: 'sunset',
    name: 'Sunset Orange',
    emoji: '🌅',
    mode: 'dark',
    primary:    '#F97316',
    secondary:  '#EF4444',
    accent:     '#FBBF24',
    background: '#0D0501',
    foreground: '#FEF3C7',
    surface:    '#1A0A02',
    card:       'rgba(26,10,2,0.8)',
    cardBorder: 'rgba(249,115,22,0.15)',
    glassBg:    'rgba(13,5,1,0.8)',
    glowPrimary:'0 0 30px rgba(249,115,22,0.35)',
    bodyGradient: 'radial-gradient(circle at 20% 0%,rgba(249,115,22,0.15) 0,transparent 50%),radial-gradient(circle at 80% 100%,rgba(239,68,68,0.08) 0,transparent 40%)',
  },
  {
    id: 'black',
    name: 'Professional Black',
    emoji: '⚫',
    mode: 'dark',
    primary:    '#E4E4E7',
    secondary:  '#A1A1AA',
    accent:     '#52525B',
    background: '#000000',
    foreground: '#FAFAFA',
    surface:    '#0A0A0A',
    card:       'rgba(10,10,10,0.9)',
    cardBorder: 'rgba(255,255,255,0.06)',
    glassBg:    'rgba(0,0,0,0.85)',
    glowPrimary:'0 0 20px rgba(228,228,231,0.15)',
    bodyGradient: 'none',
  },
  {
    id: 'neon',
    name: 'AI Neon Mode',
    emoji: '⚡',
    mode: 'dark',
    primary:    '#00FFF0',
    secondary:  '#FF00FF',
    accent:     '#FFFF00',
    background: '#000508',
    foreground: '#F0FFFF',
    surface:    '#000D10',
    card:       'rgba(0,13,16,0.85)',
    cardBorder: 'rgba(0,255,240,0.2)',
    glassBg:    'rgba(0,5,8,0.8)',
    glowPrimary:'0 0 40px rgba(0,255,240,0.4)',
    bodyGradient: 'radial-gradient(circle at 20% 10%,rgba(0,255,240,0.08) 0,transparent 40%),radial-gradient(circle at 80% 80%,rgba(255,0,255,0.06) 0,transparent 40%)',
  },
];

// ── Default theme ────────────────────────────────────────────────────────────

const DEFAULT_ADVANCED: AdvancedOptions = {
  glassmorphism: true,
  gradients: true,
  animations: true,
  particles: true,
  compactLayout: false,
};

const presetToConfig = (p: ThemePreset, advanced = DEFAULT_ADVANCED, dynamic = false): ThemeConfig => ({
  presetId:    p.id,
  name:        p.name,
  mode:        p.mode,
  primary:     p.primary,
  secondary:   p.secondary,
  accent:      p.accent,
  background:  p.background,
  foreground:  p.foreground,
  surface:     p.surface,
  card:        p.card,
  cardBorder:  p.cardBorder,
  glassBg:     p.glassBg,
  glowPrimary: p.glowPrimary,
  bodyGradient:p.bodyGradient,
  advanced,
  dynamicTheme: dynamic,
});

const DEFAULT_THEME = presetToConfig(THEME_PRESETS[0]);

// ── Dynamic theme logic ──────────────────────────────────────────────────────

function getDynamicPreset(): ThemePreset {
  const hour = new Date().getHours();
  if (hour >= 6  && hour < 12) return THEME_PRESETS.find(t => t.id === 'light')!;
  if (hour >= 12 && hour < 18) return THEME_PRESETS.find(t => t.id === 'dark')!;
  if (hour >= 18 && hour < 22) return THEME_PRESETS.find(t => t.id === 'sunset')!;
  return THEME_PRESETS.find(t => t.id === 'midnight')!;
}

// ── Context ──────────────────────────────────────────────────────────────────

const ThemeContext = createContext<ThemeContextProps>({
  currentTheme: DEFAULT_THEME,
  presets: THEME_PRESETS,
  applyPreset: () => {},
  setCustomColors: () => {},
  setAdvanced: () => {},
  toggleDynamic: () => {},
  isStudioOpen: false,
  openStudio: () => {},
  closeStudio: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// ── Apply CSS variables ───────────────────────────────────────────────────────

function applyCSSVars(theme: ThemeConfig) {
  const r = document.documentElement;
  r.style.setProperty('--primary',     theme.primary);
  r.style.setProperty('--secondary',   theme.secondary);
  r.style.setProperty('--accent',      theme.accent);
  r.style.setProperty('--highlight',   theme.primary);
  r.style.setProperty('--background',  theme.background);
  r.style.setProperty('--foreground',  theme.foreground);
  r.style.setProperty('--surface',     theme.surface);
  r.style.setProperty('--card',        theme.card);
  r.style.setProperty('--card-border', theme.cardBorder);
  r.style.setProperty('--glass-bg',    theme.glassBg);
  r.style.setProperty('--glow-primary',theme.glowPrimary);

  // Body gradient
  document.body.style.backgroundImage = theme.bodyGradient === 'none' ? 'none' : theme.bodyGradient;

  // Advanced options via data attributes (CSS can react to these)
  r.setAttribute('data-glass',      theme.advanced.glassmorphism ? '1' : '0');
  r.setAttribute('data-gradients',  theme.advanced.gradients     ? '1' : '0');
  r.setAttribute('data-animations', theme.advanced.animations    ? '1' : '0');
  r.setAttribute('data-compact',    theme.advanced.compactLayout ? '1' : '0');

  // Disable animations via a class
  if (!theme.advanced.animations) {
    r.classList.add('no-animations');
  } else {
    r.classList.remove('no-animations');
  }

  // Light/dark scrollbar
  if (theme.mode === 'light') {
    r.style.setProperty('--muted', '#64748B');
  } else {
    r.style.setProperty('--muted', '#94A3B8');
  }
}

// ── Provider ─────────────────────────────────────────────────────────────────

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const dynamicTimer = useRef<NodeJS.Timeout | null>(null);

  // ── Persist & apply ────────────────────────────────────────────────────────
  const persist = useCallback((theme: ThemeConfig) => {
    localStorage.setItem('zilverse_theme_v2', JSON.stringify(theme));
    // Async DB save (best-effort)
    const token = localStorage.getItem('zilverse_token');
    if (token) {
      axios.post(`${API_BASE}/api/auth/theme`, {
        themeName: theme.name,
        primary:   theme.primary,
        secondary: theme.secondary,
        accent:    theme.accent,
        background:theme.background,
        mode:      theme.mode,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
  }, []);

  const applyAndSave = useCallback((theme: ThemeConfig) => {
    setCurrentTheme(theme);
    applyCSSVars(theme);
    persist(theme);
  }, [persist]);

  // ── Initial load ───────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem('zilverse_theme_v2');
    if (saved) {
      try {
        const parsed: ThemeConfig = JSON.parse(saved);
        if (parsed.dynamicTheme) {
          const dynPreset = getDynamicPreset();
          const dynTheme  = presetToConfig(dynPreset, parsed.advanced, true);
          setCurrentTheme(dynTheme);
          applyCSSVars(dynTheme);
        } else {
          setCurrentTheme(parsed);
          applyCSSVars(parsed);
        }
        return;
      } catch {}
    }
    // Fresh start — apply defaults
    applyCSSVars(DEFAULT_THEME);
  }, []);

  // ── Dynamic timer — refresh every 5 min ──────────────────────────────────
  useEffect(() => {
    if (!currentTheme.dynamicTheme) {
      if (dynamicTimer.current) clearInterval(dynamicTimer.current);
      return;
    }
    dynamicTimer.current = setInterval(() => {
      const preset = getDynamicPreset();
      const next   = presetToConfig(preset, currentTheme.advanced, true);
      setCurrentTheme(next);
      applyCSSVars(next);
    }, 5 * 60 * 1000);
    return () => { if (dynamicTimer.current) clearInterval(dynamicTimer.current); };
  }, [currentTheme.dynamicTheme, currentTheme.advanced]);

  // ── Public API ─────────────────────────────────────────────────────────────
  const applyPreset = useCallback((preset: ThemePreset) => {
    const next = presetToConfig(preset, currentTheme.advanced, false);
    applyAndSave(next);
  }, [currentTheme.advanced, applyAndSave]);

  const setCustomColors = useCallback((colors: Partial<ThemeConfig>) => {
    const next = { ...currentTheme, ...colors, dynamicTheme: false };
    applyAndSave(next);
  }, [currentTheme, applyAndSave]);

  const setAdvanced = useCallback((opts: Partial<AdvancedOptions>) => {
    const next = { ...currentTheme, advanced: { ...currentTheme.advanced, ...opts } };
    applyAndSave(next);
  }, [currentTheme, applyAndSave]);

  const toggleDynamic = useCallback((on: boolean) => {
    if (on) {
      const preset = getDynamicPreset();
      const next   = presetToConfig(preset, currentTheme.advanced, true);
      applyAndSave(next);
    } else {
      applyAndSave({ ...currentTheme, dynamicTheme: false });
    }
  }, [currentTheme, applyAndSave]);

  const openStudio  = useCallback(() => setIsStudioOpen(true),  []);
  const closeStudio = useCallback(() => setIsStudioOpen(false), []);

  return (
    <ThemeContext.Provider value={{
      currentTheme,
      presets: THEME_PRESETS,
      applyPreset,
      setCustomColors,
      setAdvanced,
      toggleDynamic,
      isStudioOpen,
      openStudio,
      closeStudio,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
