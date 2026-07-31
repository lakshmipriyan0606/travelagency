"use client";

import { Badge } from "@/components/ui/Badge";
import { cn } from "@travelagency/utils";

export type AgencyStatus = "active" | "pending" | "suspended" | "correction" | string;

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "success" | "warning" | "muted"; dotClass: string }
> = {
  active: {
    label: "Agency Active",
    variant: "success",
    dotClass: "bg-emerald-400",
  },
  pending: {
    label: "Pending Approval",
    variant: "warning",
    dotClass: "bg-amber-400",
  },
  suspended: {
    label: "Suspended",
    variant: "muted",
    dotClass: "bg-zinc-400",
  },
  correction: {
    label: "Action Required",
    variant: "warning",
    dotClass: "bg-orange-400",
  },
};

export interface AgencyStatusBadgeProps {
  status?: AgencyStatus;
  className?: string;
}

export function AgencyStatusBadge({ status = "active", className }: AgencyStatusBadgeProps) {
  const normalized = status.toLowerCase();
  const config = STATUS_CONFIG[normalized] ?? STATUS_CONFIG.active;

  return (
    <Badge
      variant={config.variant}
      className={cn("hidden sm:inline-flex gap-1.5 select-none", className)}
      aria-label={`Agency status: ${config.label}`}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dotClass)}
        aria-hidden
      />
      {config.label}
    </Badge>
  );
}
