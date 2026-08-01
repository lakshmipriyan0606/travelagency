/**
 * Maps CustomProposal (+ optional live composer overrides) → ItineraryPdfModel
 * for @react-pdf/renderer. Rebuilds day timeline the same way as the composer.
 */

import type {
  ActivitySlot,
  CustomProposal,
  ProposalActivity,
  ProposalDestination,
} from "../types/proposal.types";
import { FIXED_EXCLUSIONS, PREP_CHECKLIST, TRAVEL_TIP } from "./tokens";

export type PdfSlotActivity = {
  slot: ActivitySlot;
  name: string;
  amount: number;
  currency: string;
};

export type PdfDay = {
  dayNum: number;
  dateLabel: string;
  cityName: string;
  hotelName?: string;
  isFirstInCity: boolean;
  isLastInCity: boolean;
  title: string;
  body: string;
  slots: Array<{
    slot: ActivitySlot;
    items: PdfSlotActivity[];
    /** Empty slot → free time (never "Soon") */
    freeTime: boolean;
  }>;
};

export type PdfHighlight = {
  title: string;
  subtitle: string;
};

export type ItineraryPdfModel = {
  reference: string;
  name: string;
  totalDays: number;
  totalNights: number;
  destinationsLabel: string;
  leavingFrom?: string;
  leavingOnLabel: string;
  travelersLabel: string;
  includeTransfers: boolean;
  highlights: PdfHighlight[];
  prepChecklist: string[];
  travelTip: string;
  days: PdfDay[];
  inclusions: string[];
  exclusions: string[];
  pricing?: {
    currency: string;
    subtotal: number;
    transferTotal: number;
    total: number;
    breakdown: Array<{ label: string; amount: number }>;
  };
  assetBaseUrl: string;
};

const SLOTS: ActivitySlot[] = ["Morning", "Afternoon", "Evening"];

function addDays(isoDate: string, days: number): Date {
  const d = new Date(`${isoDate.slice(0, 10)}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDateLabel(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatLeavingOn(value?: string | null): string {
  if (!value) return "TBD";
  const d = new Date(`${String(value).slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return String(value);
  return formatDateLabel(d);
}

function padDay(n: number): string {
  return String(n).padStart(2, "0");
}

function stayLabel(dest: ProposalDestination): string | undefined {
  if (dest.hotelName?.trim()) return dest.hotelName.trim();
  // Stay package only if explicitly selected — never invent a default package
  if (dest.packageId) return "Selected stay package";
  return undefined;
}

function buildTimelineDays(
  destinations: ProposalDestination[],
  leavingOn: string | null | undefined,
  activities: ProposalActivity[],
  includeTransfers: boolean
): PdfDay[] {
  if (!leavingOn || !destinations.length) return [];

  const byDaySlot = new Map<string, ProposalActivity[]>();
  for (const a of activities) {
    if (!a.packageId) continue;
    const key = `${a.dayNum}:${a.slot}`;
    const list = byDaySlot.get(key) || [];
    list.push(a);
    byDaySlot.set(key, list);
  }

  const days: PdfDay[] = [];
  let offset = 0;
  let dayNum = 1;

  destinations.forEach((dest) => {
    const nights = Math.max(1, dest.nights || 1);
    const hotel = stayLabel(dest);

    for (let n = 0; n < nights; n++) {
      const isFirst = n === 0;
      const isLast = n === nights - 1;
      const date = addDays(String(leavingOn), offset);
      const slots = SLOTS.map((slot) => {
        const items = (byDaySlot.get(`${dayNum}:${slot}`) || []).map((a) => ({
          slot,
          name: a.packageName || "Activity",
          amount: a.amount || 0,
          currency: a.currency || "USD",
        }));
        return {
          slot,
          items,
          freeTime: items.length === 0,
        };
      });

      const activityNames = slots
        .flatMap((s) => s.items.map((i) => i.name))
        .filter(Boolean);

      const titleParts: string[] = [];
      if (isFirst && includeTransfers) {
        titleParts.push(`Arrival in ${dest.cityName}`);
      } else if (isFirst) {
        titleParts.push(`${dest.cityName}`);
      } else {
        titleParts.push(`${dest.cityName} exploration`);
      }
      if (activityNames[0]) {
        titleParts.push(activityNames[0]);
      } else if (isFirst) {
        titleParts.push("City discovery");
      }

      const bodyLines: string[] = [];
      if (isFirst && includeTransfers) {
        bodyLines.push(
          `Transfer to your stay in ${dest.cityName}${hotel ? ` (${hotel})` : ""}.`
        );
      }
      for (const s of slots) {
        if (s.freeTime) {
          bodyLines.push(`${s.slot}: Free time to explore at your own pace.`);
        } else {
          bodyLines.push(
            `${s.slot}: ${s.items.map((i) => i.name).join(", ")}.`
          );
        }
      }
      if (hotel) {
        bodyLines.push(`Overnight in ${dest.cityName} · ${hotel}.`);
      } else {
        bodyLines.push(
          `Overnight in ${dest.cityName} · accommodation to be confirmed.`
        );
      }
      if (isLast && includeTransfers && dest !== destinations[destinations.length - 1]) {
        bodyLines.push(`Depart ${dest.cityName} for the next destination.`);
      }

      days.push({
        dayNum,
        dateLabel: formatDateLabel(date),
        cityName: dest.cityName,
        hotelName: hotel,
        isFirstInCity: isFirst,
        isLastInCity: isLast,
        title: `Day ${padDay(dayNum)}: ${titleParts.join(" | ")}`,
        body: bodyLines.join(" "),
        slots,
      });

      dayNum += 1;
      offset += 1;
    }
  });

  return days;
}

function buildHighlights(destinations: ProposalDestination[]): PdfHighlight[] {
  const defaults: PdfHighlight[] = [
    { title: "Curated stays", subtitle: "Hand-picked hotels & packages" },
    { title: "Flexible pacing", subtitle: "Free time when slots are open" },
    { title: "Local experiences", subtitle: "Activities from live master catalog" },
    { title: "Partner support", subtitle: "TravelHero B2B concierge" },
  ];

  const fromCities = destinations.slice(0, 4).map((d, i) => ({
    title: d.cityName,
    subtitle: `${d.nights} night${d.nights === 1 ? "" : "s"}${
      d.hotelName ? ` · ${d.hotelName}` : d.packageId ? " · Stay package" : " · Stay TBD"
    }`,
    _i: i,
  }));

  if (fromCities.length === 0) return defaults;

  const out: PdfHighlight[] = fromCities.map(({ title, subtitle }) => ({
    title,
    subtitle,
  }));
  while (out.length < 4) {
    out.push(defaults[out.length]!);
  }
  return out.slice(0, 4);
}

function buildInclusions(
  destinations: ProposalDestination[],
  activities: ProposalActivity[],
  includeTransfers: boolean
): string[] {
  const lines: string[] = [];

  for (const d of destinations) {
    if (d.hotelName?.trim()) {
      lines.push(
        `Accommodation in ${d.cityName}: ${d.hotelName} (${d.nights} night${d.nights === 1 ? "" : "s"})`
      );
    } else if (d.packageId) {
      lines.push(
        `Stay package in ${d.cityName} (${d.nights} night${d.nights === 1 ? "" : "s"})`
      );
    }
    // City-only with no hotel/package → do not invent a stay inclusion
  }

  const seenActs = new Set<string>();
  for (const a of activities) {
    if (!a.packageId || !a.packageName) continue;
    const key = `${a.packageName}|${a.dayNum}|${a.slot}`;
    if (seenActs.has(key)) continue;
    seenActs.add(key);
    lines.push(`${a.packageName} — Day ${a.dayNum} ${a.slot}`);
  }

  if (includeTransfers) {
    lines.push("Airport / intercity transfers as indicated in the day plan");
  }

  if (lines.length === 0) {
    lines.push("Inclusions will be confirmed once stays and activities are selected");
  }

  return lines;
}

export type BuildItineraryPdfModelOptions = {
  /** Absolute origin for public assets, e.g. https://localhost:3001 */
  assetBaseUrl?: string;
};

/**
 * Build a printable model from a persisted (or priced) CustomProposal.
 * No phantom default packages when hotel/package not selected.
 */
export function buildItineraryPdfModel(
  proposal: CustomProposal,
  options: BuildItineraryPdfModelOptions = {}
): ItineraryPdfModel {
  const destinations = proposal.destinations || [];
  const activities = (proposal.activities || []).filter((a) =>
    Boolean(a.packageId)
  );
  const includeTransfers = proposal.tripDetails?.includeTransfers !== false;
  const totalNights = destinations.reduce(
    (sum, d) => sum + Math.max(1, d.nights || 1),
    0
  );
  const days = buildTimelineDays(
    destinations,
    proposal.tripDetails?.leavingOn,
    activities,
    includeTransfers
  );
  const totalDays = days.length || totalNights;

  const destinationsLabel =
    destinations.map((d) => d.cityName).filter(Boolean).join(" → ") ||
    "Custom itinerary";

  const name =
    proposal.name?.trim() ||
    destinationsLabel ||
    proposal.reference ||
    "Untitled proposal";

  const adults = proposal.tripDetails?.adults ?? 0;
  const children = proposal.tripDetails?.children ?? 0;
  const rooms = proposal.tripDetails?.rooms ?? 1;

  const pricing = proposal.pricing;
  const showPricing =
    pricing &&
    (pricing.total > 0 || (pricing.breakdown && pricing.breakdown.length > 0));

  return {
    reference: proposal.reference || proposal.id || "DRAFT",
    name,
    totalDays,
    totalNights,
    destinationsLabel,
    leavingFrom: proposal.tripDetails?.leavingFromName || undefined,
    leavingOnLabel: formatLeavingOn(proposal.tripDetails?.leavingOn),
    travelersLabel: `${adults} Adult${adults === 1 ? "" : "s"} / ${children} Child${children === 1 ? "" : "ren"} · ${rooms} room${rooms === 1 ? "" : "s"}`,
    includeTransfers,
    highlights: buildHighlights(destinations),
    prepChecklist: [...PREP_CHECKLIST],
    travelTip: TRAVEL_TIP,
    days,
    inclusions: buildInclusions(destinations, activities, includeTransfers),
    exclusions: [...FIXED_EXCLUSIONS],
    pricing: showPricing
      ? {
          currency: pricing.currency || "USD",
          subtotal: pricing.subtotal || 0,
          transferTotal: pricing.transferTotal || 0,
          total: pricing.total || 0,
          breakdown: (pricing.breakdown || []).map((b) => ({
            label: b.label,
            amount: b.amount,
          })),
        }
      : undefined,
    assetBaseUrl: (options.assetBaseUrl || "").replace(/\/$/, ""),
  };
}

export function pdfAssetUrl(model: ItineraryPdfModel, path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = model.assetBaseUrl || "";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function sanitizePdfFilename(reference: string, name: string): string {
  const ref = (reference || "proposal").replace(/[^\w.-]+/g, "_");
  const n = (name || "itinerary")
    .slice(0, 60)
    .replace(/[^\w.\s-]+/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return `${ref}-${n || "itinerary"}.pdf`;
}
