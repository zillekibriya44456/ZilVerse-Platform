"use client";
import React, { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";

export default function CobeGlobe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        setWidth(canvasRef.current.offsetWidth);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();

    let phi = 0;

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2 || 1000,
      height: width * 2 || 1000,
      phi: 0,
      theta: 0,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.1, 0.1, 0.2],
      markerColor: [0.65, 0.35, 0.98], // #a78bfa
      glowColor: [0.4, 0.2, 0.8],
      markers: [
        // NY
        { location: [40.7128, -74.006], size: 0.1 },
        // London
        { location: [51.5074, -0.1278], size: 0.1 },
        // Dubai
        { location: [25.2048, 55.2708], size: 0.1 },
        // Singapore
        { location: [1.3521, 103.8198], size: 0.1 },
        // Tokyo
        { location: [35.6762, 139.6503], size: 0.1 },
        // Sydney
        { location: [-33.8688, 151.2093], size: 0.1 },
      ],
      // @ts-ignore — cobe library types don't include onRender but it works at runtime
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onRender: (state: Record<string, any>) => {
        // Called on every animation frame.
        if (!pointerInteracting.current) {
          // auto-rotate
          phi += 0.005;
        }
        state.phi = phi + pointerInteractionMovement.current;
      },
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      globe.destroy();
    };
  }, [width]);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "600px",
        aspectRatio: 1,
        margin: "auto",
        position: "relative",
        opacity: 0.8,
        mixBlendMode: "screen"
      }}
      className={className}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current =
            e.clientX - pointerInteractionMovement.current;
          canvasRef.current!.style.cursor = "grabbing";
        }}
        onPointerUp={() => {
          pointerInteracting.current = null;
          canvasRef.current!.style.cursor = "grab";
        }}
        onPointerOut={() => {
          pointerInteracting.current = null;
          canvasRef.current!.style.cursor = "grab";
        }}
        onMouseMove={(e) => {
          if (pointerInteracting.current !== null) {
            const delta = e.clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta * 0.01;
          }
        }}
        onTouchMove={(e) => {
          if (pointerInteracting.current !== null && e.touches[0]) {
            const delta = e.touches[0].clientX - pointerInteracting.current;
            pointerInteractionMovement.current = delta * 0.01;
          }
        }}
        style={{
          width: "100%",
          height: "100%",
          cursor: "grab",
          contain: "layout paint size",
        }}
      />
    </div>
  );
}
