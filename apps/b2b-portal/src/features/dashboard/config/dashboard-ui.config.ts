/**
 * Dashboard UI — static display data for charts, navigation, and demo fallbacks.
 */

import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  PlusCircle,
  FolderOpen,
  Send,
  BadgeCheck,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/lib/routes";

// ─── Navigation ───────────────────────────────────────────────────────────────

export interface NavLinkItem {
  readonly label: string;
  readonly href: string;
  readonly icon: LucideIcon;
  readonly comingSoon?: boolean;
}

/** Live portal nav only — Manage/Operations SOON sections removed. */
export const PRIMARY_NAV: readonly NavLinkItem[] = [
  { label: "Dashboard", href: ROUTES.dashboard, icon: LayoutDashboard },
  { label: "Quote Request Portal", href: ROUTES.quotes, icon: FileText },
  { label: "Accepted Packages", href: "#", icon: CheckSquare, comingSoon: true },
  { label: "Create Custom Package", href: "#", icon: PlusCircle, comingSoon: true },
];

// ─── KPI Sparklines ───────────────────────────────────────────────────────────

export interface KpiDisplayConfig {
  readonly key: keyof import("../types/dashboard.types").DashboardKPIs;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly iconColor: string;
  readonly sparkColor: string;
  readonly trend: string;
  readonly trendUp: boolean;
  readonly sparkline: string;
}

export const KPI_DISPLAY: readonly KpiDisplayConfig[] = [
  {
    key: "openRequests",
    label: "Open Requests",
    icon: FolderOpen,
    iconColor: "text-violet-400 bg-violet-500/10",
    sparkColor: "#8B5CF6",
    trend: "",
    trendUp: true,
    sparkline: "M0,22 Q12,8 25,18 T50,10 T75,20 T100,6",
  },
  {
    key: "submittedToday",
    label: "Submitted Today",
    icon: Send,
    iconColor: "text-blue-400 bg-blue-500/10",
    sparkColor: "#3B82F6",
    trend: "",
    trendUp: true,
    sparkline: "M0,18 Q20,6 40,16 T70,8 T100,14",
  },
  {
    key: "quotesReady",
    label: "Quotes Ready",
    icon: BadgeCheck,
    iconColor: "text-emerald-400 bg-emerald-500/10",
    sparkColor: "#10B981",
    trend: "",
    trendUp: true,
    sparkline: "M0,20 Q25,5 50,15 T80,8 T100,12",
  },
  {
    key: "acceptedQuotes",
    label: "Accepted",
    icon: CheckSquare,
    iconColor: "text-green-400 bg-green-500/10",
    sparkColor: "#22C55E",
    trend: "",
    trendUp: true,
    sparkline: "M0,15 Q20,22 45,10 T85,18 T100,8",
  },
  {
    key: "pendingRevisions",
    label: "Pending Revisions",
    icon: RotateCcw,
    iconColor: "text-orange-400 bg-orange-500/10",
    sparkColor: "#F97316",
    trend: "",
    trendUp: false,
    sparkline: "M0,8 Q20,20 45,12 T80,22 T100,16",
  },
];

// ─── Demo Pipeline (fallback when API empty) ─────────────────────────────────

export interface PipelineRow {
  readonly id: string;
  readonly quoteId: string;
  readonly customer: string;
  readonly destination: string;
  readonly amount: string;
  readonly status: "Submitted" | "In Review" | "Pending" | "Draft" | "Ready" | "Accepted";
}

export const DEMO_PIPELINE: readonly PipelineRow[] = [];

// ─── Operations Feed (typed; live data mapped in DashboardClient) ─────────────

export interface OperationsFeedItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly timeAgo: string;
  readonly iconColor: string;
  readonly iconBg: string;
}

export const DEMO_OPERATIONS_FEED: readonly OperationsFeedItem[] = [];

// Chart constants removed — volumes/destinations/conversion come from API.

export const STATUS_STYLES = {
  Submitted: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  "In Review": "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Pending: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  Draft: "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  Ready: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Accepted: "bg-green-500/15 text-green-400 border-green-500/30",
} as const;
