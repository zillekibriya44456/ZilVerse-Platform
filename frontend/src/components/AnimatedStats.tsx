"use client";
import { useEffect, useState, memo } from "react";
import styles from "../app/home.module.css";
import { API_BASE } from "@/utils/api";

const AnimatedStats = memo(function AnimatedStats() {
  const [stats, setStats] = useState({
    countries: null,
    freelancers: null,
    projectsSold: null,
    jobsPosted: null,
    satisfaction: null,
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

    // Simulate active platform growth randomly every 3-8 seconds
    const growthInterval = setInterval(() => {
      setStats((prev) => {
        if (prev.freelancers === null) return prev; // Wait for initial load
        return {
          ...prev,
          freelancers: (prev.freelancers as number) + (Math.random() > 0.7 ? 1 : 0),
          projectsSold: (prev.projectsSold as number) + (Math.random() > 0.8 ? 1 : 0),
          jobsPosted: (prev.jobsPosted as number) + (Math.random() > 0.75 ? 1 : 0),
        };
      });
    }, 4000);

    return () => {
      evtSource.close();
      clearInterval(growthInterval);
    };
  }, []);

  const statItems = [
    { key: "countries", label: "Countries", format: (v: number) => `${v}+` },
    { key: "freelancers", label: "Freelancers", format: (v: number) => `${v.toLocaleString()}+` },
    { key: "projectsSold", label: "Projects Sold", format: (v: number) => `${v.toLocaleString()}+` },
    { key: "jobsPosted", label: "Jobs Posted", format: (v: number) => `${v.toLocaleString()}+` },
    { key: "satisfaction", label: "Satisfaction", format: (v: number) => `${v}%` },
  ];

  return (
    <div className={styles.statsBar}>
      {statItems.map((s, i) => (
        <div key={i} className={styles.stat}>
          <span className={styles.statNum}>
            {stats[s.key as keyof typeof stats] !== null 
              ? <CountUp end={stats[s.key as keyof typeof stats] as number} format={s.format} /> 
              : "--"}
          </span>
          <span className={styles.statLabel}>{s.label}</span>
        </div>
      ))}
    </div>
  );
});

export default AnimatedStats;

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
