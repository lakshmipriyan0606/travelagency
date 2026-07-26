// Global Rank Configuration
// Change MAX_RANK here to extend ranking options everywhere
export const MAX_RANK = 5;

// Generate rank list: [1, 2, 3, ..., MAX_RANK]
export const RANK_OPTIONS = Array.from({ length: MAX_RANK }, (_, i) => i + 1);

// For select fields (AdminUploadPackageForm)
export const RANK_SELECT_OPTIONS = RANK_OPTIONS.map((r) => ({
  label: String(r),
  value: String(r),
}));
