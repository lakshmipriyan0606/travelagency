"use client";

import { cn } from "@travelagency/utils";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "gold" | "success" | "warning" | "info" | "muted";
  className?: string;
}

const variants = {
  default: "bg-white/10 text-zinc-300 border-white/10",
  gold: "bg-[#F8B400]/15 text-[#F8B400] border-[#F8B400]/30",
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  info: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  muted: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
