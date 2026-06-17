"use client";
import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import styles from './ThemeStudio.module.css';
import { Palette, X, Monitor, Sun, Moon } from 'lucide-react';

const PREDEFINED_THEMES = [
  { name: 'Cyber Green', primary: '#22C55E', secondary: '#06B6D4', accent: '#3B82F6', background: '#050816' },
  { name: 'Midnight Blue', primary: '#3B82F6', secondary: '#8B5CF6', accent: '#22C55E', background: '#0B1121' },
  { name: 'Purple Neon', primary: '#8B5CF6', secondary: '#EC4899', accent: '#3B82F6', background: '#0F0B1A' },
  { name: 'Ocean Blue', primary: '#06B6D4', secondary: '#3B82F6', accent: '#8B5CF6', background: '#061324' },
  { name: 'Professional Black', primary: '#FFFFFF', secondary: '#94A3B8', accent: '#E2E8F0', background: '#000000' },
];

export default function ThemeStudio() {
  const { currentTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const applyTheme = (theme: typeof PREDEFINED_THEMES[0]) => {
    setTheme({
      name: theme.name,
      primary: theme.primary,
      secondary: theme.secondary,
      accent: theme.accent,
      background: theme.background
    });
  };

  const handleModeChange = (mode: 'light' | 'dark' | 'auto') => {
    setTheme({ mode });
  };

  return (
    <>
      <button className={styles.fab} onClick={() => setIsOpen(true)} title="Theme Studio">
        <Palette size={20} />
      </button>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div className={styles.panel} onClick={e => e.stopPropagation()}>
            <div className={styles.header}>
              <h3>Theme Studio</h3>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className={styles.section}>
              <h4>Appearance</h4>
              <div className={styles.modeGroup}>
                <button 
                  className={`${styles.modeBtn} ${currentTheme.mode === 'light' ? styles.activeMode : ''}`}
                  onClick={() => handleModeChange('light')}
                >
                  <Sun size={16} /> Light
                </button>
                <button 
                  className={`${styles.modeBtn} ${currentTheme.mode === 'dark' ? styles.activeMode : ''}`}
                  onClick={() => handleModeChange('dark')}
                >
                  <Moon size={16} /> Dark
                </button>
                <button 
                  className={`${styles.modeBtn} ${currentTheme.mode === 'auto' ? styles.activeMode : ''}`}
                  onClick={() => handleModeChange('auto')}
                >
                  <Monitor size={16} /> Auto
                </button>
              </div>
            </div>

            <div className={styles.section}>
              <h4>Premium Themes</h4>
              <div className={styles.themeList}>
                {PREDEFINED_THEMES.map(theme => (
                  <button 
                    key={theme.name}
                    className={`${styles.themeOption} ${currentTheme.name === theme.name ? styles.activeTheme : ''}`}
                    onClick={() => applyTheme(theme)}
                  >
                    <div className={styles.themeColors}>
                      <span style={{ background: theme.primary }}></span>
                      <span style={{ background: theme.secondary }}></span>
                      <span style={{ background: theme.accent }}></span>
                    </div>
                    <span>{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.section}>
              <h4>Custom Primary Color</h4>
              <input 
                type="color" 
                value={currentTheme.primary} 
                onChange={(e) => setTheme({ primary: e.target.value, name: 'Custom' })}
                className={styles.colorPicker}
              />
            </div>
            
          </div>
        </div>
      )}
    </>
  );
}
