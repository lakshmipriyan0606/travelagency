/**
 * Quote Request Feature — domain types and API DTOs.
 *
 * Naming convention:
 *   - Enums: PascalCase
 *   - Domain models: PascalCase interface (represents backend entity)
 *   - DTOs: suffixed with DTO (data transfer objects for API calls)
 *   - View models: suffixed with VM (client-only computed shapes)
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

/**
 * All possible lifecycle states of a quote request.
 * Ordered to reflect the natural progression through the workflow.
 */
export enum QuoteStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  VENDOR_SOURCING = 'vendor_sourcing',
  QUOTATION_PREPARATION = 'quotation_preparation',
  QUOTATION_READY = 'quotation_ready',
  REVISION_REQUESTED = 'revision_requested',
  QUOTATION_UPDATED = 'quotation_updated',
  ACCEPTED = 'accepted',
}

export enum BudgetCategory {
  ECONOMY = 'economy',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  LUXURY = 'luxury',
}

export enum TransferType {
  NONE = 'none',
  SHARED = 'shared',
  PRIVATE = 'private',
  LUXURY = 'luxury',
}

export enum MealPlan {
  NONE = 'none',
  BREAKFAST = 'breakfast',
  HALF_BOARD = 'half_board',
  FULL_BOARD = 'full_board',
  ALL_INCLUSIVE = 'all_inclusive',
}

// ─── Domain Models ────────────────────────────────────────────────────────────

/**
 * Contact person details for a quote request.
 * Separate from the agency-level contact for flexibility.
 */
export interface ContactPerson {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly designation?: string;
}

/**
 * A single event in the quote's status lifecycle.
 * Used to render the StatusTimeline component.
 */
export interface QuoteTimelineEvent {
  readonly id: string;
  readonly status: QuoteStatus;
  readonly label: string;
  readonly description?: string;
  readonly timestamp: string; // ISO-8601
  readonly actor?: string; // e.g. "Operations Team" or "System"
}

/**
 * Full quote request entity as returned by the API.
 * This is the canonical domain model — services return this shape.
 */
export interface QuoteRequest {
  readonly id: string;
  readonly reference: string; // e.g. "QR-2024-001"
  readonly agencyId: string;
  readonly status: QuoteStatus;

  // Travel details
  readonly destination: string;
  readonly travelStart: string; // ISO-8601 date
  readonly travelEnd: string;   // ISO-8601 date
  readonly adults: number;
  readonly children: number;
  readonly rooms: number;
  readonly budgetCategory: BudgetCategory;

  // Preferences
  readonly preferredHotels?: string;
  readonly transfers: TransferType;
  readonly meals: MealPlan;
  readonly guideRequired: boolean;
  readonly specialRequirements?: string;

  // Contact
  readonly contactPerson: ContactPerson;

  // Metadata
  readonly timeline: readonly QuoteTimelineEvent[];
  readonly createdAt: string; // ISO-8601
  readonly updatedAt: string; // ISO-8601
  readonly estimatedResponseHours?: number;
}

/**
 * Summarized row for the quote list table.
 * Does not include full contact details or timeline — fetched on demand.
 */
export interface QuoteListItem {
  readonly id: string;
  readonly reference: string;
  readonly destination: string;
  readonly travelStart: string;
  readonly travelEnd: string;
  readonly adults: number;
  readonly children: number;
  readonly status: QuoteStatus;
  readonly budgetCategory: BudgetCategory;
  readonly contactPerson?: ContactPerson;
  readonly createdAt: string;
}

// ─── DTOs ─────────────────────────────────────────────────────────────────────

/**
 * Payload sent to POST /b2b/agency/quotes to create a new quote request.
 * All fields are writeable — no readonly on DTOs.
 * This is what React Hook Form submits (after Zod validation).
 */
export interface CreateQuoteDTO {
  destination: string;
  travelStart: string;      // ISO-8601 date string
  travelEnd: string;        // ISO-8601 date string
  adults: number;
  children: number;
  rooms: number;
  budgetCategory: BudgetCategory;
  preferredHotels?: string;
  transfers: TransferType;
  meals: MealPlan;
  guideRequired: boolean;
  specialRequirements?: string;
  contactPerson: ContactPerson;
}

/**
 * Payload sent to PATCH /b2b/agency/quotes/:id/draft.
 * All fields optional — partial update for autosave.
 */
export type SaveDraftDTO = Partial<Omit<CreateQuoteDTO, 'contactPerson'>> & {
  contactPerson?: Partial<ContactPerson>;
};

/**
 * API response envelope for a single quote request.
 */
export interface QuoteResponse {
  readonly success: boolean;
  readonly data: QuoteRequest;
  readonly message?: string;
}

/**
 * API response envelope for a paginated quote list.
 */
export interface QuoteListResponse {
  readonly success: boolean;
  readonly data: readonly QuoteListItem[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasMore: boolean;
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface QuoteListQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
  readonly status?: QuoteStatus;
  readonly search?: string;
}
