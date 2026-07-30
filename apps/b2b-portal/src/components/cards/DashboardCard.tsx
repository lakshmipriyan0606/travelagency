"use client";

import { motion } from "framer-motion";
import { cn } from "@travelagency/utils";

export interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg";
}

const paddingMap = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function DashboardCard({
  children,
  className,
  hover = true,
  padding = "md",
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "rounded-[20px] bg-[#141416] border border-white/[0.08]",
        "shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
        paddingMap[padding],
        hover && "transition-all duration-250 hover:border-white/[0.12] hover:shadow-[0_12px_40px_rgba(0,0,0,0.5)]",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
