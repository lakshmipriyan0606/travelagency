"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@travelagency/utils";
import { DashboardCard } from "./DashboardCard";

export interface KpiCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  iconColor: string;
  sparkColor: string;
  trend: string;
  trendUp: boolean;
  sparkline: string;
  index?: number;
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  iconColor,
  sparkColor,
  trend,
  trendUp,
  sparkline,
  index = 0,
}: KpiCardProps) {
  const formattedValue =
    typeof value === "number"
      ? value < 10
        ? value.toString().padStart(2, "0")
        : value.toLocaleString("en-IN")
      : value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <DashboardCard padding="sm" className="relative overflow-hidden min-h-[140px] pb-12">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wide">
            {label}
          </span>
          <div className={cn("p-2 rounded-xl", iconColor)}>
            <Icon className="h-4 w-4" aria-hidden />
          </div>
        </div>

          <div className="mt-3 flex items-end gap-3">
          <span className="text-3xl font-black text-white tracking-tight leading-none">
            {formattedValue}
          </span>
          {trend ? (
            <div className="flex flex-col pb-0.5">
              <span
                className={cn(
                  "text-[11px] font-bold",
                  trendUp ? "text-emerald-400" : "text-rose-400"
                )}
              >
                {trend}
              </span>
              <span className="text-[10px] text-zinc-500">from last 7 days</span>
            </div>
          ) : null}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-10 opacity-80">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
            aria-hidden
          >
            <defs>
              <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={sparkColor} stopOpacity="0.4" />
                <stop offset="100%" stopColor={sparkColor} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d={`${sparkline} L100,30 L0,30 Z`}
              fill={`url(#spark-${label})`}
            />
            <path
              d={sparkline}
              fill="none"
              stroke={sparkColor}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </DashboardCard>
    </motion.div>
  );
}
