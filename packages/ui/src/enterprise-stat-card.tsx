"use client";

import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@travelagency/utils";

export interface EnterpriseStatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  badgeText?: string;
  badgeType?: "success" | "warning" | "danger" | "gold" | "neutral";
  progressValue?: number; // 0 to 100
  subtext?: string;
  onClick?: () => void;
  className?: string;
}

export function EnterpriseStatCard({
  label,
  value,
  icon: Icon,
  badgeText,
  badgeType = "gold",
  progressValue = 75,
  subtext,
  onClick,
  className,
}: EnterpriseStatCardProps) {
  const badgeStyles = {
    gold: "bg-[#F8B400]/15 text-[#F8B400] border-[#F8B400]/30",
    success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    danger: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    neutral: "bg-white/10 text-zinc-300 border-white/15",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex flex-col justify-between p-5 rounded-[20px] bg-[#141416] border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-150 group overflow-hidden",
        onClick && "cursor-pointer hover:border-[#F8B400]/40 hover:-translate-y-0.5",
        className
      )}
    >
      {/* Top Row: Icon + Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-[#1C1C20] border border-white/[0.08] text-[#F8B400] group-hover:border-[#F8B400]/30 transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        {badgeText && (
          <span
            className={cn(
              "px-2.5 py-0.5 text-[11px] font-bold rounded-full border tracking-wide uppercase",
              badgeStyles[badgeType]
            )}
          >
            {badgeText}
          </span>
        )}
      </div>

      {/* Middle Row: Label & Large Metric */}
      <div className="flex flex-col gap-1">
        <span className="text-[12px] font-bold text-zinc-200 tracking-wide uppercase">
          {label}
        </span>
        <span className="text-[32px] font-black text-white leading-none tracking-tight">
          {value}
        </span>
        {subtext && (
          <span className="text-[12px] text-zinc-400 mt-1 font-medium">{subtext}</span>
        )}
      </div>

      {/* Bottom Row: Gold Progress Bar Line */}
      <div className="w-full h-1 bg-[#222226] rounded-full mt-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#F8B400] to-[#FFD54A] rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, progressValue))}%` }}
        />
      </div>
    </div>
  );
}
