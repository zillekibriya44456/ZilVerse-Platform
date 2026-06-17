"use client";

import { useState, useEffect } from "react";
import { API_BASE } from "@/utils/api";
import { useAuth } from "@/context/AuthContext";
import { TrendingUp, BarChart2, Activity } from "lucide-react";

interface DataPoint { label: string; views: number; applications: number; messages: number; }

// Generate realistic-looking 8-week data relative to today
function generateWeeklyData(): DataPoint[] {
  const weeks: DataPoint[] = [];
  const now = new Date();
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    weeks.push({
      label,
      views:        Math.floor(Math.random() * 120 + 30),
      applications: Math.floor(Math.random() * 15 + 2),
      messages:     Math.floor(Math.random() * 25 + 5),
    });
  }
  return weeks;
}

interface BarProps {
  value: number;
  max: number;
  color: string;
  label: string;
  tooltip: string;
}

function Bar({ value, max, color, label, tooltip }: BarProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);
  const pct = max > 0 ? (value / max) * 100 : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem", flex: 1 }}>
      {/* Tooltip on hover */}
      <div
        title={tooltip}
        style={{
          width: "100%",
          height: 120,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          cursor: "default",
        }}
      >
        <div
          style={{
            width: "70%",
            height: mounted ? `${Math.max(pct, 4)}%` : "0%",
            background: color,
            borderRadius: "4px 4px 0 0",
            transition: "height 0.8s cubic-bezier(0.34,1.56,0.64,1)",
            position: "relative",
            minHeight: 4,
          }}
        >
          <span style={{
            position: "absolute",
            top: -20,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "0.65rem",
            fontWeight: 700,
            color: "#e4e4e7",
            whiteSpace: "nowrap",
          }}>
            {value}
          </span>
        </div>
      </div>
      <span style={{ fontSize: "0.6rem", color: "#71717a", textAlign: "center", maxWidth: 40, lineHeight: 1.2 }}>{label}</span>
    </div>
  );
}

interface LineProps { data: number[]; color: string; max: number; }

function Sparkline({ data, color, max }: LineProps) {
  const h = 60;
  const w = 100;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 60 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`0,${h} ${pts} ${w},${h}`}
        fill={`url(#grad-${color.replace("#","")})`}
      />
    </svg>
  );
}

interface Props { role?: string; }

export default function DashboardAnalytics({ role }: Props) {
  const [data] = useState<DataPoint[]>(generateWeeklyData);
  const [tab, setTab] = useState<"bar" | "sparkline">("bar");
  const [metric, setMetric] = useState<"views" | "applications" | "messages">("views");

  const maxViews = Math.max(...data.map(d => d.views));
  const maxApps  = Math.max(...data.map(d => d.applications));
  const maxMsgs  = Math.max(...data.map(d => d.messages));

  const METRICS = [
    { key: "views",        label: "Profile Views",  color: "#a855f7", max: maxViews },
    { key: "applications", label: "Applications",   color: "#3b82f6", max: maxApps },
    { key: "messages",     label: "Messages",        color: "#06b6d4", max: maxMsgs },
  ] as const;

  const selected = METRICS.find(m => m.key === metric)!;

  // Summary totals
  const totals = {
    views:        data.reduce((s, d) => s + d.views, 0),
    applications: data.reduce((s, d) => s + d.applications, 0),
    messages:     data.reduce((s, d) => s + d.messages, 0),
  };

  return (
    <div>
      {/* Summary row */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {METRICS.map(m => (
          <button
            key={m.key}
            onClick={() => setMetric(m.key)}
            style={{
              flex: 1, minWidth: 100,
              padding: "0.85rem 1rem",
              borderRadius: 12,
              background: metric === m.key ? `${m.color}18` : "rgba(255,255,255,0.02)",
              border: `1px solid ${metric === m.key ? `${m.color}55` : "rgba(255,255,255,0.06)"}`,
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontSize: "1.4rem", fontWeight: 800, fontFamily: "'Outfit', sans-serif", color: metric === m.key ? m.color : "#e4e4e7" }}>
              {totals[m.key].toLocaleString()}
            </div>
            <div style={{ fontSize: "0.72rem", color: "#a1a1aa", marginTop: "0.2rem" }}>{m.label} (8 weeks)</div>
          </button>
        ))}
      </div>

      {/* Chart type toggle */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {[
          { key: "bar",       icon: <BarChart2 size={14} />, label: "Bar" },
          { key: "sparkline", icon: <Activity   size={14} />, label: "Trend" },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as any)}
            style={{
              display: "flex", alignItems: "center", gap: "0.35rem",
              padding: "0.35rem 0.85rem",
              borderRadius: 8, border: "none", cursor: "pointer",
              fontSize: "0.78rem", fontWeight: 600,
              background: tab === t.key ? "rgba(168,85,247,0.15)" : "rgba(255,255,255,0.04)",
              color: tab === t.key ? "#c084fc" : "#71717a",
              transition: "all 0.2s",
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 12,
        padding: "1.25rem",
      }}>
        {tab === "bar" ? (
          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.25rem", height: 140 }}>
            {data.map((d, i) => (
              <Bar
                key={i}
                value={d[metric]}
                max={selected.max}
                color={selected.color}
                label={d.label}
                tooltip={`${d.label}: ${d[metric]} ${selected.label}`}
              />
            ))}
          </div>
        ) : (
          <div>
            {METRICS.map(m => (
              <div key={m.key} style={{ marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <span style={{ fontSize: "0.72rem", color: m.color, fontWeight: 600 }}>{m.label}</span>
                  <span style={{ fontSize: "0.7rem", color: "#71717a" }}>Total: {totals[m.key]}</span>
                </div>
                <Sparkline data={data.map(d => d[m.key])} color={m.color} max={m.max} />
              </div>
            ))}
          </div>
        )}
      </div>

      <p style={{ fontSize: "0.7rem", color: "#52525b", marginTop: "0.75rem", textAlign: "center" }}>
        📊 Simulated analytics — real data pipeline coming in Phase 9
      </p>
    </div>
  );
}
