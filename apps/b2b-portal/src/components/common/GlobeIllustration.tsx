"use client";

import { motion } from "framer-motion";
import { cn } from "@travelagency/utils";

export interface GlobeIllustrationProps {
  variant?: "left" | "right";
  className?: string;
}

export function GlobeIllustration({ variant = "right", className }: GlobeIllustrationProps) {
  const anchorClass =
    variant === "left"
      ? "left-0 top-1/2 -translate-y-1/2"
      : "right-4 top-1/2 -translate-y-1/2";

  return (
    <div
      className={cn(
        "relative w-full h-full opacity-60",
        className
      )}
      aria-hidden
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[#F8B400]/15 rounded-full blur-3xl scale-75" />

      {/* Wireframe globe */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        className={cn("absolute w-36 h-36", anchorClass)}
      >
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F8B400" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#F8B400" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="90" fill="url(#globeGlow)" />
          {[30, 50, 70, 90, 110, 130, 150, 170].map((y) => (
            <ellipse
              key={y}
              cx="100"
              cy={y}
              rx={Math.sqrt(Math.max(0, 8100 - (y - 100) ** 2))}
              ry="8"
              fill="none"
              stroke="#F8B400"
              strokeOpacity="0.25"
              strokeWidth="1"
            />
          ))}
          {[0, 30, 60, 90, 120, 150].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <ellipse
                key={angle}
                cx="100"
                cy="100"
                rx={Math.abs(Math.cos(rad)) * 90 + 0.001}
                ry="90"
                fill="none"
                stroke="#F8B400"
                strokeOpacity="0.2"
                strokeWidth="1"
                transform={`rotate(${angle} 100 100)`}
              />
            );
          })}
          <circle cx="100" cy="100" r="90" fill="none" stroke="#F8B400" strokeOpacity="0.4" strokeWidth="1.5" />
          {[
            [60, 70],
            [130, 80],
            [90, 130],
            [140, 120],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="3" fill="#F8B400" opacity="0.8" />
          ))}
        </svg>
      </motion.div>

      {/* Orbiting plane */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className={cn("absolute w-36 h-36", anchorClass)}
      >
        <div className="absolute -top-1 left-1/2 -translate-x-1/2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#F8B400">
            <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
          </svg>
        </div>
      </motion.div>
    </div>
  );
}
