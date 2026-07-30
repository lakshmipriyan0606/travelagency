/**
 * Dashboard Feature — domain types and API DTOs.
 */

import type { QuoteListItem } from '../../quote-request/types/quote.types';

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum NotificationSeverity {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

export enum ActivityType {
  QUOTE_CREATED = 'quote_created',
  QUOTE_SUBMITTED = 'quote_submitted',
  QUOTE_UPDATED = 'quote_updated',
  QUOTATION_READY = 'quotation_ready',
  QUOTE_ACCEPTED = 'quote_accepted',
  REVISION_REQUESTED = 'revision_requested',
  AGENCY_PROFILE_UPDATED = 'agency_profile_updated',
  SYSTEM = 'system',
}

// ─── Domain Models ────────────────────────────────────────────────────────────

/**
 * KPI metric card data.
 * Each metric maps to one KPI card on the dashboard.
 */
export interface DashboardKPIs {
  readonly openRequests: number;
  readonly submittedToday: number;
  readonly quotesReady: number;
  readonly acceptedQuotes: number;
  readonly pendingRevisions: number;
}

/**
 * A single entry in the recent activity timeline.
 */
export interface ActivityEntry {
  readonly id: string;
  readonly type: ActivityType;
  readonly title: string;
  readonly description: string;
  readonly quoteReference?: string;
  readonly quoteId?: string;
  readonly timestamp: string; // ISO-8601
}

/**
 * A portal notification (bell icon / notification panel).
 */
export interface PortalNotification {
  readonly id: string;
  readonly severity: NotificationSeverity;
  readonly title: string;
  readonly message: string;
  readonly isRead: boolean;
  readonly quoteReference?: string;
  readonly quoteId?: string;
  readonly timestamp: string; // ISO-8601
}

/**
 * Agency summary data displayed in the welcome banner.
 * Subset of the full agency profile — lightweight for the dashboard fetch.
 */
export interface AgencySummary {
  readonly agencyName: string;
  readonly contactName: string;
  readonly commissionRate: number;
  readonly partnerTier: PartnerTier;
  readonly status: string;
}

export enum PartnerTier {
  STANDARD = 'standard',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

/**
 * Complete dashboard data bundle.
 * Returned by a single aggregate endpoint to minimize round trips.
 */
export interface DashboardSummary {
  readonly agency: AgencySummary;
  readonly kpis: DashboardKPIs;
  readonly recentQuotes: readonly QuoteListItem[];
  readonly recentActivity: readonly ActivityEntry[];
  readonly notifications: readonly PortalNotification[];
  readonly unreadNotificationCount: number;
  readonly destinationStats?: readonly {
    readonly name: string;
    readonly count: number;
    readonly percent: number;
  }[];
  readonly monthlyQuoteVolume?: readonly {
    readonly month: string;
    readonly year: number;
    readonly value: number;
  }[];
  readonly conversionRate?: number;
  readonly totalQuotes?: number;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

/**
 * API response envelope for the dashboard summary.
 */
export interface DashboardSummaryResponse {
  readonly success: boolean;
  readonly data: DashboardSummary;
}

/**
 * API response envelope for the notification list.
 */
export interface NotificationsResponse {
  readonly success: boolean;
  readonly data: readonly PortalNotification[];
  readonly unreadCount: number;
}
