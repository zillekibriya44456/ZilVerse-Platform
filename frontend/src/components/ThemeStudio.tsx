"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTheme, THEME_PRESETS, ThemePreset } from "@/context/ThemeContext";
import { X, Palette, Sparkles, Zap, Moon, Sun, Layers, Sliders, RotateCcw, Check, Monitor } from "lucide-react";

// ── Colour Swatch ──────────────────────────────────────────────────────────────
function ColorSwatch({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <span style={{ fontSize: "0.72rem", color: "#71717a", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <input
            type="color"
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{ width: 36, height: 36, padding: 0, border: "none", borderRadius: 8, cursor: "pointer", background: "none" }}
          />
        </div>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            flex: 1, padding: "0.4rem 0.6rem",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8, color: "#e4e4e7",
            fontSize: "0.78rem", fontFamily: "monospace",
            outline: "none"
          }}
        />
      </div>
    </div>
  );
}

// ── Toggle switch ──────────────────────────────────────────────────────────────
function Toggle({ label, desc, value, onChange }: { label: string; desc?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 0", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer" }}
      onClick={() => onChange(!value)}
    >
      <div>
        <div style={{ fontSize: "0.875rem", color: "#e4e4e7", fontWeight: 600 }}>{label}</div>
        {desc && <div style={{ fontSize: "0.72rem", color: "#52525b", marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{
        width: 44, height: 24, borderRadius: 12, flexShrink: 0,
        background: value ? "var(--primary)" : "rgba(255,255,255,0.1)",
        transition: "background 0.25s", position: "relative", cursor: "pointer"
      }}>
        <div style={{
          position: "absolute", top: 3,
          left: value ? 23 : 3,
          width: 18, height: 18, borderRadius: "50%",
          background: "#fff",
          transition: "left 0.25s",
          boxShadow: "0 2px 4px rgba(0,0,0,0.3)"
        }} />
      </div>
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
      <div style={{ color: "var(--primary)", display: "flex" }}><Icon size={15} /></div>
      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</span>
    </div>
  );
}

// ── Main ThemeStudio component ─────────────────────────────────────────────────
export default function ThemeStudio() {
  const {
    currentTheme, presets, applyPreset,
    setCustomColors, setAdvanced, toggleDynamic,
    isStudioOpen, closeStudio
  } = useTheme();

  const [tab, setTab] = useState<"presets" | "custom" | "advanced">("presets");
  const [localColors, setLocalColors] = useState({
    primary:    currentTheme.primary,
    secondary:  currentTheme.secondary,
    accent:     currentTheme.accent,
    background: currentTheme.background,
    foreground: currentTheme.foreground,
    card:       currentTheme.card,
    cardBorder: currentTheme.cardBorder,
  });
  const panelRef = useRef<HTMLDivElement>(null);

  // Sync local colors when theme changes externally
  useEffect(() => {
    setLocalColors({
      primary:    currentTheme.primary,
      secondary:  currentTheme.secondary,
      accent:     currentTheme.accent,
      background: currentTheme.background,
      foreground: currentTheme.foreground,
      card:       currentTheme.card,
      cardBorder: currentTheme.cardBorder,
    });
  }, [currentTheme.presetId]);

  // Live preview on color change
  const handleColorChange = useCallback((key: string, value: string) => {
    setLocalColors(prev => ({ ...prev, [key]: value }));
    const root = document.documentElement;
    const cssMap: Record<string, string> = {
      primary:    "--primary",
      secondary:  "--secondary",
      accent:     "--accent",
      background: "--background",
      foreground: "--foreground",
      card:       "--card",
      cardBorder: "--card-border",
    };
    if (cssMap[key]) root.style.setProperty(cssMap[key], value);
  }, []);

  const applyCustomColors = () => {
    setCustomColors(localColors);
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeStudio();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeStudio(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeStudio]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isStudioOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isStudioOpen]);

  // Dynamic theme time label
  const getDynamicTimeLabel = () => {
    const h = new Date().getHours();
    if (h >= 6  && h < 12) return "☀️ Morning → Light Mode";
    if (h >= 12 && h < 18) return "🌤 Afternoon → Dark Mode";
    if (h >= 18 && h < 22) return "🌅 Evening → Sunset Orange";
    return "🌙 Night → Midnight Blue";
  };

  const TABS = [
    { id: "presets",  label: "Themes",  icon: Palette },
    { id: "custom",   label: "Custom",  icon: Sliders },
    { id: "advanced", label: "Options", icon: Layers  },
  ];

  return (
    <>
      {/* ── Backdrop ── */}
      {isStudioOpen && (
        <div
          onClick={handleBackdropClick}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 99998,
            animation: "fadeIn 0.2s ease",
          }}
        />
      )}

      {/* ── Panel ── */}
      <div
        ref={panelRef}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "clamp(340px, 28vw, 420px)",
          background: "rgba(6,6,16,0.97)",
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          zIndex: 99999,
          display: "flex",
          flexDirection: "column",
          transform: isStudioOpen ? "translateX(0)" : "translateX(105%)",
          transition: "transform 0.38s cubic-bezier(0.32,0.72,0,1)",
          boxShadow: isStudioOpen ? "-20px 0 80px rgba(0,0,0,0.6)" : "none",
          overflowY: "hidden",
        }}
      >

        {/* ── Header ── */}
        <div style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg, var(--primary), var(--accent))",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 20px var(--primary)40",
            }}>
              <Palette size={17} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "0.95rem", color: "#f4f4f5" }}>Theme Studio</div>
              <div style={{ fontSize: "0.7rem", color: "#52525b" }}>ZilVerse Personalization</div>
            </div>
          </div>
          <button
            onClick={closeStudio}
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#a1a1aa", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#a1a1aa"; }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Active theme pill ── */}
        <div style={{ padding: "0.85rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.04)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--primary)", boxShadow: "0 0 8px var(--primary)" }} />
            <span style={{ fontSize: "0.78rem", color: "#a1a1aa" }}>Active: </span>
            <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#e4e4e7" }}>{currentTheme.name}</span>
            {currentTheme.dynamicTheme && (
              <span style={{ fontSize: "0.68rem", background: "rgba(139,92,246,0.15)", color: "var(--primary)", padding: "1px 6px", borderRadius: 999, border: "1px solid rgba(139,92,246,0.3)", marginLeft: 4 }}>
                Dynamic
              </span>
            )}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: "flex", padding: "0.75rem 1.5rem", gap: "0.4rem", flexShrink: 0, borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id as any)}
              style={{
                flex: 1, padding: "0.5rem 0.6rem",
                borderRadius: 8,
                border: "none", cursor: "pointer",
                fontFamily: "inherit", fontWeight: 600, fontSize: "0.78rem",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem",
                background: tab === id ? "rgba(var(--primary-rgb,139,92,246),0.15)" : "transparent",
                color: tab === id ? "var(--primary)" : "#52525b",
                outline: tab === id ? "1px solid rgba(139,92,246,0.25)" : "1px solid transparent",
                transition: "all 0.2s",
              }}
            >
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {/* ── Scrollable content ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* ── TAB: THEMES ── */}
          {tab === "presets" && (
            <>
              {/* ZilVerse Dynamic */}
              <div>
                <SectionHeader icon={Sparkles} title="ZilVerse Dynamic" />
                <div
                  onClick={() => toggleDynamic(!currentTheme.dynamicTheme)}
                  style={{
                    padding: "1rem",
                    borderRadius: 12,
                    background: currentTheme.dynamicTheme
                      ? "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(59,130,246,0.12))"
                      : "rgba(255,255,255,0.03)",
                    border: `1px solid ${currentTheme.dynamicTheme ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.06)"}`,
                    cursor: "pointer",
                    transition: "all 0.25s",
                    display: "flex", alignItems: "center", gap: "0.85rem",
                  }}
                >
                  <div style={{ fontSize: "1.5rem" }}>🌐</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.875rem", color: "#f4f4f5", marginBottom: 2 }}>
                      Auto-Adaptive Theme
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#71717a" }}>
                      {currentTheme.dynamicTheme ? getDynamicTimeLabel() : "Changes with time of day"}
                    </div>
                  </div>
                  <div style={{
                    width: 20, height: 20, borderRadius: "50%",
                    border: "2px solid",
                    borderColor: currentTheme.dynamicTheme ? "var(--primary)" : "rgba(255,255,255,0.2)",
                    background: currentTheme.dynamicTheme ? "var(--primary)" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                    transition: "all 0.2s",
                  }}>
                    {currentTheme.dynamicTheme && <Check size={11} color="#fff" />}
                  </div>
                </div>
              </div>

              {/* Preset themes grid */}
              <div>
                <SectionHeader icon={Palette} title="10 Preset Themes" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                  {presets.map(preset => {
                    const isActive = currentTheme.presetId === preset.id && !currentTheme.dynamicTheme;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => applyPreset(preset)}
                        style={{
                          padding: "0.85rem",
                          borderRadius: 12,
                          border: `1px solid ${isActive ? preset.primary + "60" : "rgba(255,255,255,0.06)"}`,
                          background: isActive
                            ? `linear-gradient(135deg, ${preset.primary}22, ${preset.accent}11)`
                            : "rgba(255,255,255,0.02)",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          position: "relative",
                          overflow: "hidden",
                        }}
                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                      >
                        {/* Color dots */}
                        <div style={{ display: "flex", gap: 4, marginBottom: "0.5rem" }}>
                          {[preset.primary, preset.secondary, preset.accent].map((c, i) => (
                            <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: c, flexShrink: 0 }} />
                          ))}
                        </div>
                        <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#e4e4e7", lineHeight: 1.3 }}>
                          {preset.emoji} {preset.name}
                        </div>
                        <div style={{ fontSize: "0.65rem", color: "#52525b", marginTop: 2, textTransform: "capitalize" }}>
                          {preset.mode} mode
                        </div>
                        {isActive && (
                          <div style={{
                            position: "absolute", top: 6, right: 6,
                            width: 16, height: 16, borderRadius: "50%",
                            background: preset.primary,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <Check size={9} color="#fff" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* ── TAB: CUSTOM ── */}
          {tab === "custom" && (
            <>
              <div>
                <SectionHeader icon={Sliders} title="Custom Colors" />
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <ColorSwatch label="Primary"    value={localColors.primary}    onChange={v => handleColorChange("primary",    v)} />
                  <ColorSwatch label="Secondary"  value={localColors.secondary}  onChange={v => handleColorChange("secondary",  v)} />
                  <ColorSwatch label="Accent"     value={localColors.accent}     onChange={v => handleColorChange("accent",     v)} />
                  <ColorSwatch label="Background" value={localColors.background} onChange={v => handleColorChange("background", v)} />
                  <ColorSwatch label="Foreground" value={localColors.foreground} onChange={v => handleColorChange("foreground", v)} />
                </div>
              </div>

              {/* Live preview strip */}
              <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ height: 8, background: `linear-gradient(to right, ${localColors.primary}, ${localColors.secondary}, ${localColors.accent})` }} />
                <div style={{ padding: "0.85rem", background: localColors.background }}>
                  <div style={{ fontSize: "0.78rem", color: localColors.foreground, fontWeight: 700, marginBottom: 4 }}>Live Preview</div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <div style={{ padding: "0.3rem 0.75rem", borderRadius: 6, background: localColors.primary, color: "#fff", fontSize: "0.7rem", fontWeight: 600 }}>Button</div>
                    <div style={{ padding: "0.3rem 0.75rem", borderRadius: 6, border: `1px solid ${localColors.primary}`, color: localColors.primary, fontSize: "0.7rem" }}>Outline</div>
                    <div style={{ padding: "0.3rem 0.75rem", borderRadius: 6, background: localColors.card, border: `1px solid ${localColors.cardBorder}`, color: localColors.foreground, fontSize: "0.7rem" }}>Card</div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.6rem" }}>
                <button
                  onClick={applyCustomColors}
                  style={{
                    flex: 1, padding: "0.75rem",
                    background: "linear-gradient(135deg, var(--primary), var(--accent))",
                    border: "none", borderRadius: 10, color: "#fff", fontWeight: 700,
                    fontSize: "0.85rem", cursor: "pointer", fontFamily: "inherit",
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  Apply Theme
                </button>
                <button
                  onClick={() => applyPreset(presets.find(p => p.id === "dark")!)}
                  style={{
                    width: 44, padding: "0.75rem",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10, color: "#a1a1aa", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all 0.2s",
                  }}
                  title="Reset to Default"
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#a1a1aa"; }}
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            </>
          )}

          {/* ── TAB: ADVANCED ── */}
          {tab === "advanced" && (
            <>
              <div>
                <SectionHeader icon={Layers} title="Visual Effects" />
                <Toggle
                  label="Glassmorphism"
                  desc="Frosted glass backgrounds on cards"
                  value={currentTheme.advanced.glassmorphism}
                  onChange={v => setAdvanced({ glassmorphism: v })}
                />
                <Toggle
                  label="Gradient Effects"
                  desc="Color gradients on buttons & text"
                  value={currentTheme.advanced.gradients}
                  onChange={v => setAdvanced({ gradients: v })}
                />
                <Toggle
                  label="Animations"
                  desc="Smooth hover & page transitions"
                  value={currentTheme.advanced.animations}
                  onChange={v => setAdvanced({ animations: v })}
                />
                <Toggle
                  label="Particle Background"
                  desc="Ambient background particles"
                  value={currentTheme.advanced.particles}
                  onChange={v => setAdvanced({ particles: v })}
                />
              </div>

              <div>
                <SectionHeader icon={Monitor} title="Layout Density" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  {[
                    { label: "Spacious", icon: "◻", compact: false, desc: "Default spacing" },
                    { label: "Compact",  icon: "▪", compact: true,  desc: "Dense layout" },
                  ].map(({ label, icon, compact, desc }) => {
                    const active = currentTheme.advanced.compactLayout === compact;
                    return (
                      <div
                        key={label}
                        onClick={() => setAdvanced({ compactLayout: compact })}
                        style={{
                          padding: "0.85rem",
                          borderRadius: 10,
                          border: `1px solid ${active ? "var(--primary)60" : "rgba(255,255,255,0.06)"}`,
                          background: active ? "rgba(139,92,246,0.1)" : "rgba(255,255,255,0.02)",
                          cursor: "pointer", textAlign: "center", transition: "all 0.2s",
                        }}
                      >
                        <div style={{ fontSize: "1.2rem", marginBottom: 4 }}>{icon}</div>
                        <div style={{ fontWeight: 700, fontSize: "0.8rem", color: active ? "var(--primary)" : "#a1a1aa" }}>{label}</div>
                        <div style={{ fontSize: "0.65rem", color: "#52525b" }}>{desc}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 10, padding: "0.85rem" }}>
                <div style={{ fontSize: "0.72rem", color: "#a855f7", fontWeight: 700, marginBottom: 4 }}>⚡ Performance</div>
                <div style={{ fontSize: "0.72rem", color: "#71717a", lineHeight: 1.5 }}>
                  All theme changes apply instantly via CSS variables — zero page reloads, zero hydration errors.
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: "1rem 1.5rem",
          borderTop: "1px solid rgba(255,255,255,0.04)",
          flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ fontSize: "0.7rem", color: "#3f3f46" }}>
            Theme saved to your profile
          </div>
          <div style={{ display: "flex", gap: "0.25rem" }}>
            {presets.slice(0, 5).map(p => (
              <div
                key={p.id}
                onClick={() => applyPreset(p)}
                title={p.name}
                style={{
                  width: 12, height: 12, borderRadius: "50%",
                  background: p.primary, cursor: "pointer",
                  outline: currentTheme.presetId === p.id ? `2px solid ${p.primary}` : "none",
                  outlineOffset: 2, transition: "transform 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.3)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
