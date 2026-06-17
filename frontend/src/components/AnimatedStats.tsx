"use client";

import { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import styles from "../app/home.module.css";
import { Globe, Users, Briefcase, Star, DollarSign, Trophy } from "lucide-react";
import { API_BASE } from "@/utils/api";

interface LiveStats {
  countries: number;
  users: number;
  freelancers: number;
  projectsSold: number;
  jobsPosted: number;
  revenue: number;
  satisfaction: number;
}

// Fallback display values (shown when API hasn't loaded yet)
const FALLBACK: LiveStats = {
  countries: 150,
  users: 12000,
  freelancers: 2400,
  projectsSold: 800,
  jobsPosted: 1200,
  revenue: 2400000,
  satisfaction: 98,
};

function CountUp({
  end,
  duration = 2.2,
  decimals = 0,
}: {
  end: number;
  duration?: number;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.4 });
  const hasRun = useRef(false);

  useEffect(() => {
    if (!inView || hasRun.current) return;
    hasRun.current = true;

    let start = 0;
    const steps = duration * 60;
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 1000 / 60);

    return () => clearInterval(timer);
  }, [inView, end, duration]);

  const display =
    decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString();

  return <span ref={ref}>{display}</span>;
}

function formatValue(value: number, key: keyof LiveStats) {
  if (key === "revenue") {
    // Convert to readable: $2.4M
    const m = value / 1000000;
    return { prefix: "$", val: m, suffix: "M+", decimals: 1 };
  }
  if (key === "satisfaction") {
    return { prefix: "", val: value, suffix: "%", decimals: 0 };
  }
  if (value >= 1000) {
    const k = value / 1000;
    if (k % 1 === 0) return { prefix: "", val: k, suffix: "K+", decimals: 0 };
    return { prefix: "", val: k, suffix: "K+", decimals: 1 };
  }
  return { prefix: "", val: value, suffix: "+", decimals: 0 };
}

const STAT_CONFIG: Array<{
  key: keyof LiveStats;
  label: string;
  icon: any;
  color: string;
  bg: string;
}> = [
  { key: "countries",    label: "Countries",           icon: Globe,       color: "#8B5CF6", bg: "rgba(139,92,246,0.15)" },
  { key: "freelancers",  label: "Active Freelancers",  icon: Users,       color: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  { key: "projectsSold", label: "Projects Sold",       icon: Trophy,      color: "#22C55E", bg: "rgba(34,197,94,0.15)" },
  { key: "jobsPosted",   label: "Jobs Posted",         icon: Briefcase,   color: "#06B6D4", bg: "rgba(6,182,212,0.15)" },
  { key: "satisfaction", label: "Satisfaction Rate",   icon: Star,        color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  { key: "revenue",      label: "Earned by Freelancers", icon: DollarSign, color: "#10B981", bg: "rgba(16,185,129,0.15)" },
];

export default function AnimatedStats() {
  const [liveStats, setLiveStats] = useState<LiveStats>(FALLBACK);
  const [isLive, setIsLive] = useState(false);

  // SSE for real-time stats; fallback to REST on error
  useEffect(() => {
    let es: EventSource | null = null;

    const loadRest = () => {
      fetch(`${API_BASE}/api/statistics`)
        .then((r) => r.json())
        .then((data) => {
          if (data && typeof data.users === "number") {
            setLiveStats({ ...FALLBACK, ...data });
            setIsLive(true);
          }
        })
        .catch(() => {}); // keep fallback silently
    };

    try {
      es = new EventSource(`${API_BASE}/api/statistics/stream`);

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as Partial<LiveStats>;
          if (data && typeof data.users === "number") {
            setLiveStats((prev) => ({ ...prev, ...data }));
            setIsLive(true);
          }
        } catch {}
      };

      es.onerror = () => {
        es?.close();
        loadRest();
      };
    } catch {
      loadRest();
    }

    return () => {
      es?.close();
    };
  }, []);

  return (
    <div className={styles.statsBar}>
      {STAT_CONFIG.map(({ key, label, icon: Icon, color, bg }) => {
        const rawVal = liveStats[key] as number;
        const { prefix, val, suffix, decimals } = formatValue(rawVal, key);
        return (
          <div key={key} className={styles.stat}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: bg,
                color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem auto",
                border: `1px solid ${color}33`,
              }}
            >
              <Icon size={20} />
            </div>
            <div className={styles.statNum}>
              {prefix}
              <CountUp end={val} duration={2.2} decimals={decimals} />
              {suffix}
            </div>
            <div className={styles.statLabel}>{label}</div>
            {isLive && (
              <div
                style={{
                  marginTop: "0.3rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.3rem",
                  fontSize: "0.65rem",
                  color: "#4ade80",
                  opacity: 0.7,
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: "#4ade80",
                    display: "inline-block",
                    animation: "pulse-glow 2s infinite",
                  }}
                />
                live
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
