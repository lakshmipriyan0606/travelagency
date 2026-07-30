import * as React from "react";
import { cn } from "@travelagency/utils";

export type BadgeStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "draft"
  | "submitted"
  | "active"
  | "inactive"
  | string;

export interface EnterpriseBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: BadgeStatus;
  variant?: "solid" | "subtle";
}

export function EnterpriseBadge({
  status = "draft",
  variant = "subtle",
  className,
  children,
  ...props
}: EnterpriseBadgeProps) {
  const normalizedStatus = status.toLowerCase();

  const statusStyles: Record<string, string> = {
    pending: "bg-[#FEF3C7] text-[#D97706] border-[#FCD34D]",
    approved: "bg-[#DCFCE7] text-[#16A34A] border-[#86EFAC]",
    active: "bg-[#DCFCE7] text-[#16A34A] border-[#86EFAC]",
    rejected: "bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]",
    inactive: "bg-[#FEE2E2] text-[#DC2626] border-[#FCA5A5]",
    draft: "bg-[#F3F4F6] text-[#4B5563] border-[#E5E7EB]",
    submitted: "bg-[#DBEAFE] text-[#2563EB] border-[#93C5FD]",
  };

  const style = statusStyles[normalizedStatus] || statusStyles.draft;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 text-[13px] font-semibold rounded-full border leading-tight transition-colors",
        style,
        className
      )}
      {...props}
    >
      <span className="h-1.5 w-1.5 rounded-full fill-current bg-current opacity-80" />
      {children || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
