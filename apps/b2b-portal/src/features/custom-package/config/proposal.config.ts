/**
 * Create Custom Package — config (options, query keys).
 * Status labels align with Quote Request review vocabulary.
 * Single-page composer (no stepper).
 */

export const STAR_RATING_OPTIONS = [
  { value: "0", label: "Any star rating" },
  { value: "3", label: "3★ and above" },
  { value: "4", label: "4★ and above" },
  { value: "5", label: "5★ only" },
] as const;

/** Portal pills — same meaning as quotes (submitted = Pending, under_review = Approved). */
export const PROPOSAL_STATUS_META: Record<
  string,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "bg-zinc-500/15 text-zinc-300 border-zinc-500/30",
  },
  priced: {
    label: "Pending",
    className: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  },
  saved: {
    label: "Pending",
    className: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  },
  submitted: {
    label: "Pending",
    className: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  },
  under_review: {
    label: "Approved",
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  revision_requested: {
    label: "Needs Changes",
    className: "bg-red-500/15 text-red-300 border-red-500/30",
  },
};

export const PROPOSAL_QUERY_KEYS = {
  all: ["proposals"] as const,
  list: () => ["proposals", "list"] as const,
  detail: (id: string) => ["proposals", "detail", id] as const,
  cities: (q?: string) => ["master", "cities", q ?? ""] as const,
  hotels: (cityId: string) => ["master", "hotels", cityId] as const,
  packages: (cityId?: string) => ["master", "packages", cityId ?? ""] as const,
} as const;
