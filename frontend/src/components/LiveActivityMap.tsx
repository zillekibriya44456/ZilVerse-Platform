"use client";

import { useEffect, useState, useRef } from "react";
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
  { id: "sf", x: 15, y: 35, name: "Sarah - UI Designer", location: "San Francisco, USA", flag: "🇺🇸" },
  { id: "ny", x: 25, y: 33, name: "Michael - Full Stack Dev", location: "New York, USA", flag: "🇺🇸" },
  { id: "sp", x: 32, y: 72, name: "Lucas - Mobile Dev", location: "São Paulo, Brazil", flag: "🇧🇷" },
  { id: "ldn", x: 47, y: 25, name: "Emma - Product Manager", location: "London, UK", flag: "🇬🇧" },
  { id: "par", x: 50, y: 28, name: "Chloe - UX Lead", location: "Paris, France", flag: "🇫🇷" },
  { id: "lag", x: 52, y: 56, name: "David - Backend Eng", location: "Lagos, Nigeria", flag: "🇳🇬" },
  { id: "dxb", x: 62, y: 42, name: "Omar - DevOps", location: "Dubai, UAE", flag: "🇦🇪" },
  { id: "blr", x: 70, y: 48, name: "Rahul - AI Dev", location: "Bengaluru, India", flag: "🇮🇳" },
  { id: "sgp", x: 78, y: 58, name: "Wei - Web3 Dev", location: "Singapore", flag: "🇸🇬" },
  { id: "tok", x: 86, y: 32, name: "Yuki - ML Engineer", location: "Tokyo, Japan", flag: "🇯🇵" },
  { id: "syd", x: 88, y: 80, name: "Liam - Video", location: "Sydney, Australia", flag: "🇦🇺" }
];

const COLLABORATIONS = [
  { from: "blr", to: "sf", type: "New Freelancer Joined", label: "Rahul joined the ZilVerse network", color: "#8B5CF6" },
  { from: "lag", to: "ldn", type: "New Job Opportunity", label: "Backend Engineering role posted in London", color: "#22C55E" },
  { from: "tok", to: "ny", type: "New Project Posted", label: "Generative Art marketplace smart contract", color: "#06B6D4" },
  { from: "sgp", to: "dxb", type: "Active Project", label: "Multi-sig escrow protocol completed", color: "#F59E0B" },
  { from: "sp", to: "sf", type: "New Freelancer Joined", label: "Lucas updated iOS mobile app code", color: "#EC4899" },
  { from: "par", to: "syd", type: "New Project Posted", label: "Brand assets for decentralized database", color: "#8B5CF6" },
  { from: "sf", to: "dxb", type: "New Job Opportunity", label: "Web3 terminal controls design role", color: "#22C55E" }
];

interface ActiveArc {
  fromNode: Node;
  toNode: Node;
  progress: number;
  color: string;
  speed: number;
  type: string;
  label: string;
}

interface PulseRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export default function LiveActivityMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>(NODES);
  const [activeNode, setActiveNode] = useState<Node | null>(null);
  const [logs, setLogs] = useState<{ id: string; time: string; text: string; color: string; type: string }[]>([]);
  const activeArcsRef = useRef<ActiveArc[]>([]);
  const pulseRingsRef = useRef<PulseRing[]>([]);

  const pushLog = (type: string, text: string, color: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [
      { id: Math.random().toString(), time, text, color, type },
      ...prev.slice(0, 3)
    ]);
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
        type: randomCol.type,
        label: randomCol.label
      });
      setActiveNode(fromNode);
    }
  };

  useEffect(() => {
    const spawnInterval = setInterval(triggerActivity, 3000);
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
          pushLog(arc.type, arc.label, arc.color);
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
        <div className={styles.mapGraphic} />
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
        
        <div className={styles.scanLine} />
      </div>

      <div className={styles.loggerOverlay}>
        <div className={styles.loggerTitle}>
          <span className={styles.pulseIndicator} />
          <h4>Live Activity Feed</h4>
        </div>
        <div className={styles.loggerContent}>
          {logs.map(log => (
            <div key={log.id} className={styles.logItem}>
              <span className={styles.logTime}>[{log.time}]</span>
              <span className={styles.logType} style={{ color: log.color }}>{log.type}:</span>
              <span className={styles.logText}>{log.text}</span>
            </div>
          ))}
          {logs.length === 0 && (
            <div style={{ color: 'var(--muted)', fontSize: '0.8rem', padding: '0.5rem 0' }}>
              Monitoring global network...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
