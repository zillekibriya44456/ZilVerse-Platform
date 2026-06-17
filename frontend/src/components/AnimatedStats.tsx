"use client";

import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import styles from "../app/home.module.css";
import { Globe, Users, Briefcase, Star, DollarSign } from "lucide-react";

interface StatItem {
  icon: any;
  value: number;
  suffix: string;
  label: string;
  prefix?: string;
  color: string;
  bg: string;
}

const STATS: StatItem[] = [
  { icon: Globe, value: 150, suffix: "+", label: "Countries", color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.15)" },
  { icon: Users, value: 2400, suffix: "+", label: "Freelancers", color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.15)" },
  { icon: Briefcase, value: 800, suffix: "+", label: "Projects Sold", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.15)" },
  { icon: Briefcase, value: 1200, suffix: "+", label: "Jobs Posted", color: "#22C55E", bg: "rgba(34, 197, 94, 0.15)" },
  { icon: Star, value: 98, suffix: "%", label: "Satisfaction Rate", color: "#F59E0B", bg: "rgba(245, 158, 11, 0.15)" },
  { icon: DollarSign, prefix: "$", value: 2.4, suffix: "M+", label: "Earned by Freelancers", color: "#22C55E", bg: "rgba(34, 197, 94, 0.15)" }
];

function CountUp({ end, duration = 2 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const increment = end / (duration * 60);
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
    }
  }, [inView, end, duration]);

  // Handle floats for 2.4M
  return <span ref={ref}>{end % 1 === 0 ? Math.floor(count) : count.toFixed(1)}</span>;
}

export default function AnimatedStats() {
  return (
    <div className={styles.statsBar}>
      {STATS.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div key={idx} className={styles.stat}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: stat.bg,
              color: stat.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
              margin: '0 auto 1rem auto'
            }}>
              <Icon size={20} />
            </div>
            <div className={styles.statNum}>
              {stat.prefix}
              <CountUp end={stat.value} duration={2} />
              {stat.suffix}
            </div>
            <div className={styles.statLabel}>{stat.label}</div>
          </div>
        )
      })}
    </div>
  );
}
