"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const posRef = useRef({ x: 0, y: 0 });
  const ringPosRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Don't show on touch devices
    if ("ontouchstart" in window) return;

    const handleMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);
    };

    const handleLeave = () => setVisible(false);
    const handleEnter = () => setVisible(true);

    // Detect hoverable elements
    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable =
        target.closest("a") ||
        target.closest("button") ||
        target.closest("[role='button']") ||
        target.closest("input") ||
        target.closest("textarea") ||
        target.closest("select") ||
        target.closest("[data-cursor-hover]");
      setHovering(!!isClickable);
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseleave", handleLeave);
    document.addEventListener("mouseenter", handleEnter);

    // Smooth ring follow animation
    const animate = () => {
      const lerp = 0.15;
      ringPosRef.current.x += (posRef.current.x - ringPosRef.current.x) * lerp;
      ringPosRef.current.y += (posRef.current.y - ringPosRef.current.y) * lerp;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPosRef.current.x}px, ${ringPosRef.current.y}px) translate(-50%, -50%) scale(${hovering ? 1.8 : 1})`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseleave", handleLeave);
      document.removeEventListener("mouseenter", handleEnter);
    };
  }, [visible, hovering]);

  if (!visible) return null;

  return (
    <>
      {/* Core dot */}
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: hovering ? "6px" : "5px",
          height: hovering ? "6px" : "5px",
          borderRadius: "50%",
          background: "#A855F7",
          pointerEvents: "none",
          zIndex: 999999,
          transition: "width 0.2s, height 0.2s",
          mixBlendMode: "difference",
        }}
      />
      {/* Outer ring */}
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          border: `1.5px solid ${hovering ? "rgba(168,85,247,0.8)" : "rgba(168,85,247,0.35)"}`,
          background: hovering ? "rgba(168,85,247,0.08)" : "transparent",
          pointerEvents: "none",
          zIndex: 999998,
          transition: "border 0.25s, background 0.25s, width 0.25s, height 0.25s",
          boxShadow: hovering ? "0 0 20px rgba(168,85,247,0.4)" : "none",
        }}
      />
      {/* Hide default cursor globally */}
      <style>{`
        @media (pointer: fine) {
          *, *::before, *::after {
            cursor: none !important;
          }
        }
      `}</style>
    </>
  );
}
