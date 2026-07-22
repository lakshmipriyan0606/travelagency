/**
 * ============================================================================
 * Display Ranking Configuration
 * ============================================================================
 *
 * Layer:
 * Configuration / UI Business Rules
 *
 * Responsibility:
 * Defines the maximum bounds for UI display ranking attributes.
 * Allows frontend sorting / featured ordering dynamically.
 *
 * Called By:
 * src/modules/packages/package.model.js
 * src/modules/destinations/destination.model.js
 * ============================================================================
 */
// Global Rank Configuration (Backend)
// Change MAX_RANK here to extend ranking options
export const MAX_RANK = 5;
export const RANK_OPTIONS = Array.from({ length: MAX_RANK }, (_, i) => i + 1);
