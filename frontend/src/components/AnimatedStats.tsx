"use client";
import { useEffect, useState } from "react";
import styles from "../app/home.module.css";
import { API_BASE } from "@/utils/api";

export default function AnimatedStats() {
  const [stats, setStats] = useState({
    countries: null,
    users: null,
    freelancers: null,
    projectsSold: null,
    jobsPosted: null,
    revenue: null,
  });

  useEffect(() => {
    // Initial fetch
    fetch(`${API_BASE}/api/statistics`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setStats(data);
      })
      .catch((err) => console.error(err));

    // Real-time SSE connection
    const evtSource = new EventSource(`${API_BASE}/api/statistics/stream`);
    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (!data.error) {
          setStats(data);
        }
      } catch (err) {}
    };

    return () => {
      evtSource.close();
    };
  }, []);

  const formatCurrency = (v: number) => {
    if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M+`;
    if (v >= 1000) return `$${(v / 1000).toFixed(1)}K+`;
    return `$${v.toLocaleString()}`;
  };

  const statItems = [
    { key: "countries", label: "Countries", format: (v: number) => `${v}+` },
    { key: "users", label: "Global Users", format: (v: number) => `${v.toLocaleString()}+` },
    { key: "freelancers", label: "Freelancers", format: (v: number) => `${v.toLocaleString()}+` },
    { key: "projectsSold", label: "Projects Sold", format: (v: number) => `${v.toLocaleString()}+` },
    { key: "jobsPosted", label: "Jobs Posted", format: (v: number) => `${v.toLocaleString()}+` },
    { key: "revenue", label: "Revenue Processed", format: formatCurrency },
  ];

  return (
    <div className={styles.statsBar}>
      {statItems.map((s, i) => (
        <div key={i} className={styles.stat}>
          <span className={styles.statNum}>
            {stats && stats[s.key as keyof typeof stats] !== null && !isNaN(Number(stats[s.key as keyof typeof stats]))
              ? <CountUp end={Number(stats[s.key as keyof typeof stats]) || 0} format={s.format} /> 
              : "--"}
          </span>
          <span className={styles.statLabel}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

function CountUp({ end, format }: { end: number; format: (val: number) => string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 1500; // 1.5 seconds

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      // easeOutExpo
      const easeProgress = progress === duration ? 1 : 1 - Math.pow(2, -10 * progress / duration);
      
      if (progress < duration) {
        setCount(Math.floor(end * easeProgress));
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [end]);

  return <>{format(count)}</>;
}
