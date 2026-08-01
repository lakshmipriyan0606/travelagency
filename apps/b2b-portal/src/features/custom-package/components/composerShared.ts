/**
 * Shared chrome for the single-page Create Custom Package composer.
 */
import { cn } from "@travelagency/utils";

export const fieldClass = cn(
  "w-full h-12 bg-[var(--ent-elevated,#1c1c22)] border border-white/[0.12]",
  "text-[var(--ent-text-main,#F4F4F5)] placeholder:text-zinc-500",
  "text-sm px-4 rounded-xl outline-none transition-all duration-200",
  "hover:border-[#F8B400]/40 focus:border-[#F8B400] focus:ring-[3px] focus:ring-[#F8B400]/22"
);

export const labelClass =
  "text-[11px] font-semibold uppercase tracking-wider text-zinc-400";

export const cardClass =
  "rounded-2xl border border-white/[0.08] bg-[var(--ent-card,#16161b)] overflow-hidden ent-card-shadow";

export type LocalStop = {
  key: string;
  cityId: string;
  nights: number;
  hotelId: string;
  /** Explicit stay package — never auto-filled; user must choose. */
  packageId?: string;
};

export function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(0)}`;
  }
}

/** Prefer activityAddon; fall back to basePrice when using package as day activity. */
export function activityAmountFromPackage(pkg: {
  amounts?: {
    basePrice?: number;
    activityAddon?: number;
  };
}): number {
  const addon = Number(pkg.amounts?.activityAddon) || 0;
  if (addon > 0) return addon;
  return Number(pkg.amounts?.basePrice) || 0;
}

export function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(value: Date) {
  return value.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function addDays(isoDate: string, days: number): Date {
  const d = new Date(`${isoDate.slice(0, 10)}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d;
}

export function newStopKey() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `stop-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
