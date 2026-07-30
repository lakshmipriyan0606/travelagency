"use client";

import { cn } from "@travelagency/utils";
import { Plane } from "lucide-react";

export interface AirplaneLoaderProps {
  /** Visual size of the plane animation */
  size?: "sm" | "md" | "lg";
  /** Optional status label under the animation */
  label?: string;
  className?: string;
  /** Fill available height (page-level loading) */
  fullPage?: boolean;
}

const sizeConfig = {
  sm: { wrap: "w-28 h-16", plane: "h-4 w-4", trail: "w-20" },
  md: { wrap: "w-40 h-24", plane: "h-5 w-5", trail: "w-28" },
  lg: { wrap: "w-52 h-32", plane: "h-7 w-7", trail: "w-36" },
};

/**
 * Premium TravelHero airplane loading animation.
 * Replaces gray skeleton blocks across admin / portal surfaces.
 */
export function AirplaneLoader({
  size = "md",
  label = "Loading…",
  className,
  fullPage = false,
}: AirplaneLoaderProps) {
  const s = sizeConfig[size];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        fullPage && "min-h-[50vh] w-full",
        className
      )}
    >
      <div className={cn("relative", s.wrap)}>
        <div
          className="absolute inset-0 rounded-full bg-[#F8B400]/10 blur-2xl animate-pulse"
          aria-hidden
        />

        <svg
          className="absolute inset-0 w-full h-full opacity-40"
          viewBox="0 0 200 100"
          fill="none"
          aria-hidden
        >
          <path
            d="M10 70 Q 100 10 190 55"
            stroke="#F8B400"
            strokeWidth="1.5"
            strokeDasharray="4 6"
            className="ent-flight-path"
          />
        </svg>

        <div
          className={cn(
            "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[2px] rounded-full",
            "bg-gradient-to-r from-transparent via-[#F8B400]/50 to-transparent",
            s.trail,
            "ent-contrail"
          )}
          aria-hidden
        />

        <div className="absolute inset-0 ent-plane-fly">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
            <span className="relative flex items-center justify-center rounded-full bg-[#F8B400] text-black shadow-[0_0_24px_rgba(248,180,0,0.55)] p-2.5">
              <Plane className={cn(s.plane, "rotate-45")} strokeWidth={2.25} />
            </span>
          </div>
        </div>
      </div>

      {label ? (
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F8B400]/90">
          {label}
        </p>
      ) : null}
      <span className="sr-only">Loading</span>
    </div>
  );
}
