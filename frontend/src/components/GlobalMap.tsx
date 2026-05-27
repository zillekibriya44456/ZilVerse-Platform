"use client";

import { useEffect, useState, useRef } from "react";
import styles from "./GlobalMap.module.css";

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
  { id: "dxb", x: 62, y: 42, name: "Omar - DevOps Specialist", location: "Dubai, UAE", flag: "🇦🇪" },
  { id: "blr", x: 70, y: 48, name: "Rahul - AI Dev", location: "Bengaluru, India", flag: "🇮🇳" },
  { id: "sgp", x: 78, y: 58, name: "Wei - Smart Contract Dev", location: "Singapore", flag: "🇸🇬" },
  { id: "tok", x: 86, y: 32, name: "Yuki - ML Engineer", location: "Tokyo, Japan", flag: "🇯🇵" },
  { id: "syd", x: 88, y: 80, name: "Liam - Video Specialist", location: "Sydney, Australia", flag: "🇦🇺" }
];

const COLLABORATIONS = [
  { from: "blr", to: "sf", type: "AI Innovation Pulse", label: "AI LLM pipeline integrated for Silicon Valley startup", color: "#22d3ee" },
  { from: "lag", to: "ldn", type: "Hiring Activity", label: "David placed as Senior Systems Architect at UK Fintech", color: "#34d399" },
  { from: "tok", to: "ny", type: "Active Project", label: "Generative Art marketplace smart contract deployed", color: "#a78bfa" },
  { from: "sgp", to: "dxb", type: "Startup Collaboration", label: "Multi-sig escrow protocol completed for logistics platform", color: "#f59e0b" },
  { from: "sp", to: "sf", type: "Active Project", label: "Lucas updated iOS mobile app code for accelerator", color: "#ec4899" },
  { from: "par", to: "syd", type: "AI Innovation Pulse", details: "Chloe designed brand assets for Sydney decentralized database launch", color: "#22d3ee" },
  { from: "blr", to: "tok", type: "Startup Collaboration", label: "Robotic automation backend sync complete", color: "#f59e0b" },
  { from: "sf", to: "dxb", type: "Hiring Activity", label: "Sarah contracted to design Web3 terminal controls", color: "#34d399" }
];

interface ActiveArc {
  fromNode: Node;
  toNode: Node;
  progress: number; // 0 to 1
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

export default function GlobalMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>(NODES);
  const [activeNode, setActiveNode] = useState<Node | null>(null);
  const [logs, setLogs] = useState<{ id: string; time: string; text: string; color: string; type: string }[]>([]);
  const activeArcsRef = useRef<ActiveArc[]>([]);
  const pulseRingsRef = useRef<PulseRing[]>([]);

  // Push activity log
  const pushLog = (type: string, text: string, color: string) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [
      { id: Math.random().toString(), time, text, color, type },
      ...prev.slice(0, 4)
    ]);
  };

  // Trigger collaboration connection
  const triggerCollaboration = () => {
    const randomCol = COLLABORATIONS[Math.floor(Math.random() * COLLABORATIONS.length)];
    const fromNode = NODES.find(n => n.id === randomCol.from);
    const toNode = NODES.find(n => n.id === randomCol.to);

    if (fromNode && toNode) {
      // Add active arc
      activeArcsRef.current.push({
        fromNode,
        toNode,
        progress: 0,
        color: randomCol.color,
        speed: 0.008 + Math.random() * 0.005,
        type: randomCol.type,
        label: randomCol.label || `Collaboration initiated between ${fromNode.location} and ${toNode.location}`
      });

      // Highlight source node temporarily
      setActiveNode(fromNode);
    }
  };

  useEffect(() => {
    // Spawn a connection periodically
    const spawnInterval = setInterval(triggerCollaboration, 3500);
    triggerCollaboration(); // Initial trigger

    return () => clearInterval(spawnInterval);
  }, []);

  // Animation loop
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

      // Update and draw pulse rings
      pulseRingsRef.current = pulseRingsRef.current.filter(ring => {
        ring.radius += 0.6;
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

      // Update and draw connection arcs
      activeArcsRef.current = activeArcsRef.current.filter(arc => {
        const x1 = (arc.fromNode.x / 100) * w;
        const y1 = (arc.fromNode.y / 100) * h;
        const x2 = (arc.toNode.x / 100) * w;
        const y2 = (arc.toNode.y / 100) * h;

        // Curve control points
        const dx = x2 - x1;
        const dy = y2 - y1;
        const cx1 = x1 + dx * 0.25;
        const cy1 = y1 + dy * 0.25 - 60; // offset upwards
        const cx2 = x1 + dx * 0.75;
        const cy2 = y1 + dy * 0.75 - 60;

        // Draw static curved connector path
        ctx.strokeStyle = "rgba(139, 92, 246, 0.12)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
        ctx.stroke();

        // Increment progress
        arc.progress += arc.speed;

        // Draw running pulse
        if (arc.progress < 1) {
          const t = arc.progress;
          // Cubic Bezier interpolation
          const px = (1 - t) ** 3 * x1 + 3 * (1 - t) ** 2 * t * cx1 + 3 * (1 - t) * t ** 2 * cx2 + t ** 3 * x2;
          const py = (1 - t) ** 3 * y1 + 3 * (1 - t) ** 2 * t * cy1 + 3 * (1 - t) * t ** 2 * cy2 + t ** 3 * y2;

          // Glow effect
          ctx.shadowBlur = 15;
          ctx.shadowColor = arc.color;
          ctx.fillStyle = arc.color;
          ctx.beginPath();
          ctx.arc(px, py, 4, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.shadowBlur = 0; // reset
        } else {
          // Arrived! Spawn pulse rings at destination
          pulseRingsRef.current.push({
            x: x2,
            y: y2,
            radius: 5,
            maxRadius: 40,
            alpha: 1,
            color: arc.color
          });

          // Print activity log
          pushLog(arc.type, arc.label, arc.color);
          
          // Deactivate
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
    <section className={styles.mapSection}>
      <div className="container">
        <div className={styles.header}>
          <h2>Connecting Talent Worldwide</h2>
          <p>Live freelancer activity, startup collaborations, and active project pulses across our global network.</p>
        </div>
        
        <div className={styles.mapContainer}>
          <div className={styles.mapBase}>
            {/* Dotted Grid Background */}
            <div className={styles.mapGraphic} />
            
            {/* HTML Canvas overlay for connection lines */}
            <canvas ref={canvasRef} className={styles.canvasOverlay} />

            {/* Nodes */}
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
                  
                  {/* Tooltip */}
                  <div className={`${styles.tooltip} ${isActive ? styles.tooltipVisible : ''}`}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.2rem' }}>{node.flag}</span>
                      <span className={styles.tooltipName}>{node.name}</span>
                    </div>
                    <span className={styles.tooltipLocation}>{node.location}</span>
                    <span className={styles.tooltipStatus}>● Active Pulse Node</span>
                  </div>
                </div>
              );
            })}
            
            {/* Top Scanning Line */}
            <div className={styles.scanLine} />
          </div>

          {/* Real-time Event Logger Overlay */}
          <div className={styles.loggerOverlay}>
            <div className={styles.loggerTitle}>
              <span className={styles.pulseIndicator} />
              <h4>Global Activity Feed</h4>
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
                <div style={{ color: '#52525b', fontSize: '0.8rem', padding: '1rem 0' }}>
                  Monitoring global node network...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
