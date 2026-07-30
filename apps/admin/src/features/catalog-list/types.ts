export type CatalogItem = {
  _id: string;
  packageName?: string;
  title?: string;
  type?: string;
  activityCategory?: string;
  location?: string;
  destination?: string;
  price?: number;
  offerPrice?: number;
  isActive?: boolean;
  isBestPackage?: boolean;
  bestRank?: number | string | null;
  images?: Array<{ url?: string; alt?: string } | string>;
};

/** Occupied homepage “best” slots from GET admin/packages/takenRanks */
export type TakenRank = {
  rank: number | string;
  packageId: string;
  packageName?: string;
  isActivity?: boolean;
};

export type CatalogListConfig = {
  title: string;
  subtitle: string;
  emptyLabel: string;
  createLabel: string;
  createHref: string;
  /** Serializable path prefix; client builds `/prefix/:id` (functions cannot cross RSC → client). */
  editHrefBase: string;
  /** Column label for the secondary field (Type vs Category). */
  secondaryColumn: string;
  mode: "packages" | "activities";
};

export function getCatalogEditHref(config: CatalogListConfig, id: string): string {
  return `${config.editHrefBase}/${id}`;
}

export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

export function getCatalogTitle(item: CatalogItem): string {
  return item.packageName || item.title || "—";
}

export function getCatalogDestination(item: CatalogItem): string {
  return item.location || item.destination || "—";
}

export function isCatalogActivityItem(item: CatalogItem, mode: CatalogListConfig["mode"]): boolean {
  if (mode === "activities") return true;
  // Prefer explicit model `type` over legacy activityCategory heuristics
  if (item.type === "activity") return true;
  if (item.type === "package") return false;
  const cat = item.activityCategory;
  return Boolean(cat && cat !== "" && cat !== "none");
}

export function getCatalogSecondary(item: CatalogItem, mode: CatalogListConfig["mode"]): string {
  if (mode === "activities") return item.activityCategory || "—";
  return isCatalogActivityItem(item, mode) ? "Activity" : "Package";
}

export function getCatalogBestRank(item: CatalogItem): number | null {
  if (!item.isBestPackage || item.bestRank == null || item.bestRank === "") return null;
  const n = Number(item.bestRank);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function getCatalogImageUrl(item: CatalogItem): string | null {
  const first = item.images?.[0];
  if (!first) return null;
  if (typeof first === "string") return first || null;
  return first.url || null;
}
