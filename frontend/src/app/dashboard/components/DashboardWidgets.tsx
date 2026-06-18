"use client";
import React from "react";
import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  note?: string;
  color: string;
  href?: string;
  trend?: number; // percentage change, positive or negative
  loading?: boolean;
}

export function StatCard({ icon, label, value, note, color, href, trend, loading }: StatCardProps) {
  const content = (
    <div style={{
      background: `${color}08`,
      border: `1px solid ${color}20`,
      borderRadius: 16,
      padding: "1.25rem 1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
      transition: "all 0.2s",
      cursor: href ? "pointer" : "default",
      position: "relative",
      overflow: "hidden",
    }}
    onMouseEnter={e => href && ((e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)")}
    onMouseLeave={e => href && ((e.currentTarget as HTMLDivElement).style.transform = "none")}
    >
      {/* Background glow */}
      <div style={{
        position: "absolute", top: -20, right: -20, width: 80, height: 80,
        background: `radial-gradient(circle, ${color}15, transparent)`,
        borderRadius: "50%", pointerEvents: "none",
      }} />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `${color}18`, display: "flex",
          alignItems: "center", justifyContent: "center", color,
        }}>
          {icon}
        </div>
        {trend !== undefined && (
          <div style={{
            display: "flex", alignItems: "center", gap: "0.25rem",
            fontSize: "0.72rem", fontWeight: 700,
            color: trend >= 0 ? "#22c55e" : "#EF4444",
          }}>
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div style={{ fontSize: loading ? "1rem" : "1.85rem", fontWeight: 900, color: "#f4f4f5", lineHeight: 1.1 }}>
        {loading ? <span style={{ color: "#3f3f46" }}>—</span> : value}
      </div>
      <div style={{ fontSize: "0.8rem", color: "#71717a", fontWeight: 500 }}>{label}</div>
      {note && <div style={{ fontSize: "0.7rem", color: "#52525b" }}>{note}</div>}
    </div>
  );

  return href ? <Link href={href} style={{ textDecoration: "none" }}>{content}</Link> : <>{content}</>;
}

// Reusable Widget Card
interface WidgetProps {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function Widget({ title, children, action, icon }: WidgetProps) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 16, padding: "1.25rem",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700, color: "#e4e4e7", fontSize: "0.9rem" }}>
          {icon && <span style={{ color: "#a855f7" }}>{icon}</span>}
          {title}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// Section header
export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: "1.25rem" }}>
      <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#f4f4f5", margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: "0.8rem", color: "#71717a", margin: "0.2rem 0 0" }}>{subtitle}</p>}
    </div>
  );
}

// Action Button
export function ActionBtn({ icon, label, href, color = "#8B5CF6", onClick }: { icon: React.ReactNode; label: string; href?: string; color?: string; onClick?: () => void }) {
  const inner = (
    <div style={{
      display: "flex", alignItems: "center", gap: "0.5rem",
      padding: "0.65rem 1rem", borderRadius: 10,
      background: `${color}15`, border: `1px solid ${color}30`,
      color, fontSize: "0.82rem", fontWeight: 700,
      cursor: "pointer", transition: "all 0.15s", whiteSpace: "nowrap",
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = `${color}25`; }}
    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = `${color}15`; }}
    onClick={onClick}
    >
      {icon} {label}
    </div>
  );
  return href ? <Link href={href} style={{ textDecoration: "none" }}>{inner}</Link> : inner;
}

// Empty state
export function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div style={{ textAlign: "center", padding: "2rem", color: "#3f3f46" }}>
      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{icon}</div>
      <div style={{ fontSize: "0.82rem" }}>{message}</div>
    </div>
  );
}

// Status badge
export function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    PENDING:   "#F59E0B", APPLIED: "#3B82F6", ACCEPTED: "#22c55e",
    COMPLETED: "#22c55e", REJECTED: "#EF4444", Active: "#22c55e", Closed: "#71717a",
  };
  const c = colorMap[status] || "#8B5CF6";
  return (
    <span style={{
      background: `${c}18`, border: `1px solid ${c}30`,
      color: c, borderRadius: 20, padding: "0.15rem 0.6rem",
      fontSize: "0.65rem", fontWeight: 700, display: "inline-block",
    }}>{status}</span>
  );
}
