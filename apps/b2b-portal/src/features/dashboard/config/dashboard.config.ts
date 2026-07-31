/**
 * Dashboard Feature — centralized configuration.
 *
 * KPI definitions, navigation config, and query keys.
 * No magic strings in dashboard components.
 */

import {
  ActivityType,
  NotificationSeverity,
  PartnerTier,
} from '../types/dashboard.types';

// ─── KPI Definitions ──────────────────────────────────────────────────────────

export interface KPIDefinition {
  readonly key: string;
  /** Display label for the KPI card */
  readonly label: string;
  /** Lucide icon name — resolved in the component */
  readonly iconName: string;
  /** Tailwind colour class for the icon/accent */
  readonly colorClass: string;
  /** Short description displayed below the value */
  readonly description: string;
}

/**
 * Ordered KPI card definitions for the dashboard grid.
 * Order here determines the visual order of cards.
 */
export const KPI_DEFINITIONS: readonly KPIDefinition[] = [
  {
    key: 'openRequests',
    label: 'Open Requests',
    iconName: 'FolderOpen',
    colorClass: 'text-blue-400',
    description: 'Pending quote requests awaiting admin review',
  },
  {
    key: 'submittedToday',
    label: 'Submitted Today',
    iconName: 'SendHorizonal',
    colorClass: 'text-violet-400',
    description: 'Non-draft requests created today',
  },
  {
    key: 'quotesReady',
    label: 'Quotes Ready',
    iconName: 'CheckCircle',
    colorClass: 'text-emerald-400',
    description: 'Quotations ready for your review',
  },
  {
    key: 'acceptedQuotes',
    label: 'Approved',
    iconName: 'BadgeCheck',
    colorClass: 'text-amber-400',
    description: 'Admin-approved quote requests in the ops pipeline',
  },
  {
    key: 'pendingRevisions',
    label: 'Pending Revisions',
    iconName: 'RotateCcw',
    colorClass: 'text-yellow-400',
    description: 'Needs changes — awaiting agency update',
  },
] as const;

// ─── Partner Tier Metadata ─────────────────────────────────────────────────────

export interface PartnerTierMeta {
  readonly label: string;
  readonly colorClass: string;
  readonly description: string;
}

export const PARTNER_TIER_META: Readonly<Record<PartnerTier, PartnerTierMeta>> = {
  [PartnerTier.STANDARD]: {
    label: 'Standard Partner',
    colorClass: 'text-neutral-400 bg-neutral-800 border-neutral-700',
    description: 'Welcome to the TravelHero B2B network.',
  },
  [PartnerTier.SILVER]: {
    label: 'Silver Partner',
    colorClass: 'text-slate-300 bg-slate-900 border-slate-700',
    description: 'Recognised agency with growing activity.',
  },
  [PartnerTier.GOLD]: {
    label: 'Gold Partner',
    colorClass: 'text-amber-400 bg-amber-950 border-amber-800',
    description: 'High-performing agency with priority support.',
  },
  [PartnerTier.PLATINUM]: {
    label: 'Platinum Partner',
    colorClass: 'text-sky-300 bg-sky-950 border-sky-800',
    description: 'Top-tier agency with dedicated account management.',
  },
};

// ─── Activity Type Metadata ────────────────────────────────────────────────────

export interface ActivityTypeMeta {
  readonly iconName: string;
  readonly colorClass: string;
}

export const ACTIVITY_TYPE_META: Readonly<Record<ActivityType, ActivityTypeMeta>> = {
  [ActivityType.QUOTE_CREATED]: { iconName: 'FilePlus', colorClass: 'text-blue-400' },
  [ActivityType.QUOTE_SUBMITTED]: { iconName: 'SendHorizonal', colorClass: 'text-violet-400' },
  [ActivityType.QUOTE_UPDATED]: { iconName: 'RefreshCw', colorClass: 'text-teal-400' },
  [ActivityType.QUOTATION_READY]: { iconName: 'CheckCircle', colorClass: 'text-emerald-400' },
  [ActivityType.QUOTE_ACCEPTED]: { iconName: 'BadgeCheck', colorClass: 'text-green-400' },
  [ActivityType.REVISION_REQUESTED]: { iconName: 'RotateCcw', colorClass: 'text-yellow-400' },
  [ActivityType.AGENCY_PROFILE_UPDATED]: { iconName: 'Building2', colorClass: 'text-amber-400' },
  [ActivityType.SYSTEM]: { iconName: 'Bell', colorClass: 'text-neutral-400' },
};

// ─── Notification Severity Metadata ───────────────────────────────────────────

export interface NotificationSeverityMeta {
  readonly iconName: string;
  readonly colorClass: string;
}

export const NOTIFICATION_SEVERITY_META: Readonly<Record<NotificationSeverity, NotificationSeverityMeta>> = {
  [NotificationSeverity.INFO]: { iconName: 'Info', colorClass: 'text-blue-400' },
  [NotificationSeverity.SUCCESS]: { iconName: 'CheckCircle', colorClass: 'text-emerald-400' },
  [NotificationSeverity.WARNING]: { iconName: 'AlertTriangle', colorClass: 'text-amber-400' },
  [NotificationSeverity.ERROR]: { iconName: 'AlertCircle', colorClass: 'text-red-400' },
};

// ─── Query Keys ───────────────────────────────────────────────────────────────

/**
 * Centralized React Query key factory for the dashboard feature.
 */
export const DASHBOARD_QUERY_KEYS = {
  all: ['dashboard'] as const,
  summary: () => ['dashboard', 'summary'] as const,
  kpis: () => ['dashboard', 'kpis'] as const,
  activity: () => ['dashboard', 'activity'] as const,
  notifications: () => ['dashboard', 'notifications'] as const,
} as const;

// ─── Recent Quotes Table ───────────────────────────────────────────────────────

/** How many recent quotes to show on the dashboard table */
export const DASHBOARD_RECENT_QUOTES_LIMIT = 5 as const;

/** How many recent activity events to show on the timeline */
export const DASHBOARD_ACTIVITY_LIMIT = 8 as const;

/** Stale time for dashboard summary in milliseconds (2 minutes) */
export const DASHBOARD_STALE_TIME_MS = 120000;
