"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./LiveActivityMap.module.css";
import { Briefcase, UserPlus, FolderOpen, Activity } from "lucide-react";

interface Node {
  id: string;
  x: number;
  y: number;
  name: string;
  location: string;
}

const NODES: Node[] = [
  { id: "na1", x: 20, y: 30, name: "New York", location: "USA" },
  { id: "na2", x: 25, y: 45, name: "Miami", location: "USA" },
  { id: "na3", x: 15, y: 35, name: "San Francisco", location: "USA" },
  { id: "sa1", x: 30, y: 70, name: "São Paulo", location: "Brazil" },
  { id: "sa2", x: 25, y: 60, name: "Bogota", location: "Colombia" },
  { id: "eu1", x: 48, y: 28, name: "London", location: "UK" },
  { id: "eu2", x: 52, y: 32, name: "Berlin", location: "Germany" },
  { id: "eu3", x: 55, y: 25, name: "Stockholm", location: "Sweden" },
  { id: "af1", x: 50, y: 55, name: "Lagos", location: "Nigeria" },
  { id: "af2", x: 55, y: 75, name: "Cape Town", location: "South Africa" },
  { id: "as1", x: 72, y: 45, name: "Mumbai", location: "India" },
  { id: "as2", x: 75, y: 55, name: "Bangalore", location: "India" },
  { id: "as3", x: 80, y: 35, name: "Beijing", location: "China" },
  { id: "as4", x: 85, y: 40, name: "Tokyo", location: "Japan" },
  { id: "oc1", x: 85, y: 80, name: "Sydney", location: "Australia" },
];

const STATIC_CARDS = [
  { id: 'sc1', x: 45, y: 15, icon: FolderOpen, title: "New Project", subtitle: "Posted", color: "#8B5CF6", bg: "rgba(139, 92, 246, 0.15)" },
  { id: 'sc2', x: 85, y: 10, icon: UserPlus, title: "New Freelancer", subtitle: "Joined", color: "#22C55E", bg: "rgba(34, 197, 94, 0.15)" },
  { id: 'sc3', x: 45, y: 80, icon: Briefcase, title: "New Job", subtitle: "Opportunity", color: "#3B82F6", bg: "rgba(59, 130, 246, 0.15)" },
];

interface ActiveArc {
  fromNode: Node;
  toNode: Node;
  progress: number;
}

export default function LiveActivityMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeArcsRef = useRef<ActiveArc[]>([]);
  const [pulseRings, setPulseRings] = useState<{x: number, y: number, id: string}[]>([]);

  useEffect(() => {
    const triggerArc = () => {
      const from = NODES[Math.floor(Math.random() * NODES.length)];
      let to = NODES[Math.floor(Math.random() * NODES.length)];
      while (from.id === to.id) {
        to = NODES[Math.floor(Math.random() * NODES.length)];
      }

      activeArcsRef.current.push({
        fromNode: from,
        toNode: to,
        progress: 0,
      });

      // Show pulse at source
      const id = Math.random().toString();
      setPulseRings(prev => [...prev, { x: from.x, y: from.y, id }]);
      setTimeout(() => {
        setPulseRings(prev => prev.filter(r => r.id !== id));
      }, 2000);
    };

    const interval = setInterval(triggerArc, 1500);
    for (let i = 0; i < 5; i++) triggerArc();

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      activeArcsRef.current = activeArcsRef.current.filter(arc => {
        const x1 = (arc.fromNode.x / 100) * w;
        const y1 = (arc.fromNode.y / 100) * h;
        const x2 = (arc.toNode.x / 100) * w;
        const y2 = (arc.toNode.y / 100) * h;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const cx = x1 + dx * 0.5;
        const cy = y1 + dy * 0.5 - Math.abs(dx) * 0.2; 

        // Draw path
        ctx.strokeStyle = "rgba(139, 92, 246, 0.15)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(cx, cy, x2, y2);
        ctx.stroke();

        // Draw moving dot
        arc.progress += 0.005;
        if (arc.progress < 1) {
          const t = arc.progress;
          const px = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
          const py = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;

          ctx.shadowBlur = 10;
          ctx.shadowColor = "#8B5CF6";
          ctx.fillStyle = "#8B5CF6";
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; 
        } else {
          return false;
        }
        return true;
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <div className={styles.mapContainer}>
      <div className={styles.mapBase}>
        {/* Map Background */}
        <div className={styles.mapGraphic} style={{ backgroundImage: "url('/images/world-map-dots.svg')" }}>
           <div className={styles.fallbackGrid} />
        </div>
        
        <canvas ref={canvasRef} className={styles.canvasOverlay} />

        {/* Nodes */}
        {NODES.map(node => (
          <div 
            key={node.id} 
            className={styles.node}
            style={{ left: `${node.x}%`, top: `${node.y}%` }}
          >
            <div className={styles.dot} />
          </div>
        ))}

        {/* Pulses */}
        {pulseRings.map(ring => (
          <div 
            key={ring.id}
            className={styles.pulseRingAnimated}
            style={{ left: `${ring.x}%`, top: `${ring.y}%` }}
          />
        ))}
        
        {/* Static Floating Cards */}
        {STATIC_CARDS.map(card => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className={styles.floatingCard}
              style={{
                left: `${card.x}%`,
                top: `${card.y}%`
              }}
            >
              <div className={styles.fcIconWrapper} style={{ background: card.bg, color: card.color }}>
                <Icon size={14} />
              </div>
              <div className={styles.fcContent}>
                <div className={styles.fcTitle}>{card.title}</div>
                <div className={styles.fcSubtitle}>{card.subtitle}</div>
              </div>
            </motion.div>
          );
        })}

        {/* Bottom Right Live Activity Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 1 }}
          className={styles.liveActivityCard}
        >
          <div className={styles.liveHeader}>
            <div className={styles.liveDot} />
            <span className={styles.liveTitle}>Live Activity</span>
          </div>
          <div className={styles.liveSub}>+12,580 new activities today</div>
          <div className={styles.liveAvatars}>
            <img src="/avatars/default.png" alt="A" />
            <img src="/avatars/default.png" alt="B" />
            <img src="/avatars/default.png" alt="C" />
            <img src="/avatars/default.png" alt="D" />
            <img src="/avatars/default.png" alt="E" />
          </div>
        </motion.div>

      </div>
    </div>
  );
}
