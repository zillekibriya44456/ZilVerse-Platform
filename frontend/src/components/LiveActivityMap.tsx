"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./LiveActivityMap.module.css";

interface Node {
  id: string;
  x: number;
  y: number;
  name: string;
  location: string;
  flag: string;
}

const NODES: Node[] = [
  { id: "sf", x: 15, y: 35, name: "Sarah", location: "USA", flag: "🇺🇸" },
  { id: "ny", x: 25, y: 33, name: "Michael", location: "USA", flag: "🇺🇸" },
  { id: "sp", x: 32, y: 72, name: "Lucas", location: "Brazil", flag: "🇧🇷" },
  { id: "ldn", x: 47, y: 25, name: "Emma", location: "UK", flag: "🇬🇧" },
  { id: "ber", x: 50, y: 22, name: "Hans", location: "Germany", flag: "🇩🇪" },
  { id: "dxb", x: 62, y: 42, name: "Omar", location: "UAE", flag: "🇦🇪" },
  { id: "blr", x: 70, y: 48, name: "Rahul", location: "India", flag: "🇮🇳" },
  { id: "sgp", x: 78, y: 58, name: "Wei", location: "Singapore", flag: "🇸🇬" },
  { id: "tok", x: 86, y: 32, name: "Yuki", location: "Japan", flag: "🇯🇵" },
  { id: "syd", x: 88, y: 80, name: "Liam", location: "Australia", flag: "🇦🇺" }
];

const COLLABORATIONS = [
  { from: "blr", to: "sf", type: "New Freelancer Joined", label: "Rahul joined from India", color: "#8B5CF6" },
  { from: "ldn", to: "ny", type: "New Job Posted", label: "Backend Dev needed in NYC", color: "#22C55E" },
  { from: "tok", to: "ber", type: "New Project Sold", label: "React Template purchased", color: "#06B6D4" },
  { from: "sgp", to: "dxb", type: "New Startup Registered", label: "Web3 Protocol launched", color: "#F59E0B" },
  { from: "sp", to: "sf", type: "Freelancer Hired", label: "Lucas hired for Mobile App", color: "#EC4899" }
];

interface ActiveArc {
  fromNode: Node;
  toNode: Node;
  progress: number;
  color: string;
  speed: number;
}

interface PulseRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface FloatingCard {
  id: string;
  x: number;
  y: number;
  type: string;
  label: string;
  color: string;
}

export default function LiveActivityMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>(NODES);
  const [activeNode, setActiveNode] = useState<Node | null>(null);
  const [floatingCards, setFloatingCards] = useState<FloatingCard[]>([]);
  const activeArcsRef = useRef<ActiveArc[]>([]);
  const pulseRingsRef = useRef<PulseRing[]>([]);

  const pushCard = (x: number, y: number, type: string, label: string, color: string) => {
    const id = Math.random().toString();
    setFloatingCards(prev => [...prev.slice(-2), { id, x, y, type, label, color }]);
    
    // Remove after 4 seconds
    setTimeout(() => {
      setFloatingCards(prev => prev.filter(c => c.id !== id));
    }, 4000);
  };

  const triggerActivity = () => {
    const randomCol = COLLABORATIONS[Math.floor(Math.random() * COLLABORATIONS.length)];
    const fromNode = NODES.find(n => n.id === randomCol.from);
    const toNode = NODES.find(n => n.id === randomCol.to);

    if (fromNode && toNode) {
      activeArcsRef.current.push({
        fromNode,
        toNode,
        progress: 0,
        color: randomCol.color,
        speed: 0.01 + Math.random() * 0.005,
      });
      setActiveNode(fromNode);
      
      // Spawn card at 'toNode' coordinates immediately
      pushCard(toNode.x, toNode.y, randomCol.type, randomCol.label, randomCol.color);
    }
  };

  useEffect(() => {
    const spawnInterval = setInterval(triggerActivity, 3500);
    setTimeout(triggerActivity, 1000); 
    return () => clearInterval(spawnInterval);
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

      pulseRingsRef.current = pulseRingsRef.current.filter(ring => {
        ring.radius += 0.5;
        ring.alpha = 1 - (ring.radius / ring.maxRadius);
        if (ring.alpha <= 0) return false;
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = ring.alpha;
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        return true;
      });

      activeArcsRef.current = activeArcsRef.current.filter(arc => {
        const x1 = (arc.fromNode.x / 100) * w;
        const y1 = (arc.fromNode.y / 100) * h;
        const x2 = (arc.toNode.x / 100) * w;
        const y2 = (arc.toNode.y / 100) * h;

        const dx = x2 - x1;
        const dy = y2 - y1;
        const cx1 = x1 + dx * 0.25;
        const cy1 = y1 + dy * 0.25 - 40; 
        const cx2 = x1 + dx * 0.75;
        const cy2 = y1 + dy * 0.75 - 40;

        ctx.strokeStyle = "rgba(139, 92, 246, 0.1)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
        ctx.stroke();

        arc.progress += arc.speed;

        if (arc.progress < 1) {
          const t = arc.progress;
          const px = (1 - t) ** 3 * x1 + 3 * (1 - t) ** 2 * t * cx1 + 3 * (1 - t) * t ** 2 * cx2 + t ** 3 * x2;
          const py = (1 - t) ** 3 * y1 + 3 * (1 - t) ** 2 * t * cy1 + 3 * (1 - t) * t ** 2 * cy2 + t ** 3 * y2;

          ctx.shadowBlur = 10;
          ctx.shadowColor = arc.color;
          ctx.fillStyle = arc.color;
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; 
        } else {
          pulseRingsRef.current.push({ x: x2, y: y2, radius: 4, maxRadius: 30, alpha: 1, color: arc.color });
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
        {/* SVG World Map Background for premium feel */}
        <div className={styles.mapGraphic} style={{ backgroundImage: "url('/images/world-map-dots.svg')" }}>
           {/* Fallback to radial grid if SVG is missing */}
           <div className={styles.fallbackGrid} />
        </div>
        
        <canvas ref={canvasRef} className={styles.canvasOverlay} />

        {nodes.map(node => {
          const isActive = activeNode?.id === node.id;
          return (
            <div 
              key={node.id} 
              className={`${styles.node} ${isActive ? styles.nodeActive : ''}`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onMouseEnter={() => setActiveNode(node)}
              onMouseLeave={() => setActiveNode(null)}
            >
              <div className={styles.pulseRing} />
              <div className={styles.dot} />
              
              <div className={`${styles.tooltip} ${isActive ? styles.tooltipVisible : ''}`}>
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '1rem' }}>{node.flag}</span>
                  <span className={styles.tooltipName}>{node.name}</span>
                </div>
                <span className={styles.tooltipLocation}>{node.location}</span>
              </div>
            </div>
          );
        })}
        
        <AnimatePresence>
          {floatingCards.map((card) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: -20, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className={styles.floatingCard}
              style={{
                left: `calc(${card.x}% - 80px)`,
                top: `calc(${card.y}% - 40px)`
              }}
            >
              <div className={styles.fcIndicator} style={{ background: card.color, boxShadow: `0 0 8px ${card.color}` }} />
              <div className={styles.fcContent}>
                <div className={styles.fcType} style={{ color: card.color }}>{card.type}</div>
                <div className={styles.fcLabel}>{card.label}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        <div className={styles.scanLine} />
      </div>
    </div>
  );
}
