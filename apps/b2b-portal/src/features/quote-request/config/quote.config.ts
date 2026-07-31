/**
 * Quote Request Feature — centralized configuration.
 *
 * All labels, options, status metadata, and display strings live here.
 * No magic strings in components or forms.
 */

import {
  QuoteStatus,
  BudgetCategory,
  TransferType,
  MealPlan,
} from '../types/quote.types';

// ─── Status Metadata ──────────────────────────────────────────────────────────

/**
 * Per-status display configuration.
 * Used by StatusBadge, StatusTimeline, and table columns.
 */
export interface QuoteStatusMeta {
  readonly label: string;
  readonly description: string;
  /** Tailwind CSS colour token for the badge */
  readonly colorClass: string;
  /** Lucide icon name — resolved in the component layer */
  readonly iconName: string;
  /** Estimated response hours shown to the agency */
  readonly estimatedHours?: number;
}

export const QUOTE_STATUS_META: Readonly<Record<QuoteStatus, QuoteStatusMeta>> = {
  [QuoteStatus.DRAFT]: {
    label: 'Draft',
    description: 'Your quote request is saved but not yet submitted.',
    colorClass: 'text-neutral-400 bg-neutral-800 border-neutral-700',
    iconName: 'FilePen',
  },
  [QuoteStatus.SUBMITTED]: {
    label: 'Pending',
    description: 'Your request is waiting for admin review.',
    colorClass: 'text-blue-400 bg-blue-950 border-blue-800',
    iconName: 'SendHorizonal',
    estimatedHours: 4,
  },
  [QuoteStatus.UNDER_REVIEW]: {
    label: 'Approved',
    description: 'Admin approved your request. Our operations team is working on it.',
    colorClass: 'text-emerald-400 bg-emerald-950 border-emerald-800',
    iconName: 'Search',
    estimatedHours: 8,
  },
  [QuoteStatus.VENDOR_SOURCING]: {
    label: 'Vendor Sourcing',
    description: 'We are contacting hotels, ground handlers, and suppliers.',
    colorClass: 'text-amber-400 bg-amber-950 border-amber-800',
    iconName: 'Globe',
    estimatedHours: 24,
  },
  [QuoteStatus.QUOTATION_PREPARATION]: {
    label: 'Quotation Preparation',
    description: 'Your personalised itinerary and pricing are being prepared.',
    colorClass: 'text-orange-400 bg-orange-950 border-orange-800',
    iconName: 'FileText',
    estimatedHours: 12,
  },
  [QuoteStatus.QUOTATION_READY]: {
    label: 'Quotation Ready',
    description: 'Your quote is ready for review. Please accept or request revisions.',
    colorClass: 'text-emerald-400 bg-emerald-950 border-emerald-800',
    iconName: 'CheckCircle',
  },
  [QuoteStatus.REVISION_REQUESTED]: {
    label: 'Needs Changes',
    description: 'Admin requested changes. Review the comment, update your request, and resubmit.',
    colorClass: 'text-red-400 bg-red-950 border-red-800',
    iconName: 'RotateCcw',
    estimatedHours: 8,
  },
  [QuoteStatus.QUOTATION_UPDATED]: {
    label: 'Quotation Updated',
    description: 'Your revised quotation is ready for review.',
    colorClass: 'text-teal-400 bg-teal-950 border-teal-800',
    iconName: 'RefreshCw',
  },
  [QuoteStatus.ACCEPTED]: {
    label: 'Accepted',
    description: 'Quotation accepted. Booking confirmation will follow shortly.',
    colorClass: 'text-green-400 bg-green-950 border-green-700',
    iconName: 'BadgeCheck',
  },
};

/** Ordered status array — defines the visual progression of the timeline. */
export const QUOTE_STATUS_TIMELINE_ORDER: readonly QuoteStatus[] = [
  QuoteStatus.DRAFT,
  QuoteStatus.SUBMITTED,
  QuoteStatus.UNDER_REVIEW,
  QuoteStatus.VENDOR_SOURCING,
  QuoteStatus.QUOTATION_PREPARATION,
  QuoteStatus.QUOTATION_READY,
  QuoteStatus.REVISION_REQUESTED,
  QuoteStatus.QUOTATION_UPDATED,
  QuoteStatus.ACCEPTED,
];

// ─── Select Options ────────────────────────────────────────────────────────────

export interface SelectOption<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly description?: string;
}

export const BUDGET_CATEGORY_OPTIONS: readonly SelectOption<BudgetCategory>[] = [
  {
    value: BudgetCategory.ECONOMY,
    label: 'Economy',
    description: 'Budget-friendly options with essential amenities',
  },
  {
    value: BudgetCategory.STANDARD,
    label: 'Standard',
    description: '3–4 star properties with good value',
  },
  {
    value: BudgetCategory.PREMIUM,
    label: 'Premium',
    description: '4–5 star curated stays with enhanced services',
  },
  {
    value: BudgetCategory.LUXURY,
    label: 'Luxury',
    description: '5 star flagship and boutique properties',
  },
];

export const TRANSFER_TYPE_OPTIONS: readonly SelectOption<TransferType>[] = [
  { value: TransferType.NONE, label: 'No Transfers', description: 'Self-arranged transportation' },
  { value: TransferType.SHARED, label: 'Shared Transfer', description: 'Scheduled coach / shuttle' },
  { value: TransferType.PRIVATE, label: 'Private Transfer', description: 'Dedicated vehicle for the group' },
  { value: TransferType.LUXURY, label: 'Luxury Transfer', description: 'Premium vehicle with chauffeur' },
];

export const MEAL_PLAN_OPTIONS: readonly SelectOption<MealPlan>[] = [
  { value: MealPlan.NONE, label: 'No Meals', description: 'Room only' },
  { value: MealPlan.BREAKFAST, label: 'Breakfast', description: 'Daily breakfast included' },
  { value: MealPlan.HALF_BOARD, label: 'Half Board', description: 'Breakfast and dinner' },
  { value: MealPlan.FULL_BOARD, label: 'Full Board', description: 'Breakfast, lunch, and dinner' },
  { value: MealPlan.ALL_INCLUSIVE, label: 'All Inclusive', description: 'All meals, snacks, and beverages' },
];

// ─── Form Constants ───────────────────────────────────────────────────────────

export const QUOTE_FORM_LIMITS = {
  destination: { min: 2, max: 100 },
  preferredHotels: { max: 500 },
  specialRequirements: { max: 1000 },
  contactName: { min: 2, max: 80 },
  contactEmail: { max: 254 },
  contactPhone: { min: 7, max: 20 },
  contactDesignation: { max: 80 },
  adults: { min: 1, max: 99 },
  children: { min: 0, max: 99 },
  rooms: { min: 1, max: 50 },
  /** Minimum days between travel start and end */
  minTripDurationDays: 1,
  /** Maximum days in advance for travel start */
  maxAdvanceBookingDays: 730,
} as const;

// ─── Query Keys ───────────────────────────────────────────────────────────────

/**
 * Centralized React Query key factory for the quote feature.
 * Prevents typos and ensures cache invalidation is consistent.
 */
export const QUOTE_QUERY_KEYS = {
  all: ['quotes'] as const,
  list: (params?: Record<string, unknown>) =>
    ['quotes', 'list', params] as const,
  detail: (id: string) => ['quotes', 'detail', id] as const,
  timeline: (id: string) => ['quotes', 'timeline', id] as const,
} as const;
