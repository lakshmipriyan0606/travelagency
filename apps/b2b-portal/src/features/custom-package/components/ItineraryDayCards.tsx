"use client";

import { useMemo, useState } from "react";
import { Car, Moon, Plus, X } from "lucide-react";
import { cn } from "@travelagency/utils";
import type {
  ActivitySlot,
  MasterPackage,
  ProposalActivityInput,
} from "../types/proposal.types";
import {
  addDays,
  cardClass,
  formatDateShort,
  formatMoney,
  type LocalStop,
} from "./composerShared";
import { AddActivityModal } from "./AddActivityModal";

export type DayStopInfo = {
  dayNum: number;
  date: Date;
  cityId: string;
  cityName: string;
  hotelName?: string;
  isFirstInCity: boolean;
  isLastInCity: boolean;
  cityIndex: number;
};

export type LocalDayActivity = ProposalActivityInput & {
  key: string;
  packageName: string;
  amount: number;
  currency: string;
};

export function buildDayTimeline(
  stops: LocalStop[],
  cityNameById: Map<string, string>,
  hotelNameById: Map<string, string>,
  leavingOn: string
): DayStopInfo[] {
  if (!leavingOn) return [];
  const days: DayStopInfo[] = [];
  let offset = 0;
  let dayNum = 1;

  stops
    .filter((s) => s.cityId)
    .forEach((stop, cityIndex) => {
      const nights = Math.max(1, stop.nights);
      const cityName = cityNameById.get(stop.cityId) || "City";
      const hotelName = stop.hotelId
        ? hotelNameById.get(stop.hotelId)
        : undefined;

      for (let n = 0; n < nights; n++) {
        days.push({
          dayNum,
          date: addDays(leavingOn, offset),
          cityId: stop.cityId,
          cityName,
          hotelName,
          isFirstInCity: n === 0,
          isLastInCity: n === nights - 1,
          cityIndex,
        });
        dayNum += 1;
        offset += 1;
      }
    });

  return days;
}

type ItineraryDayCardsProps = {
  days: DayStopInfo[];
  includeTransfers: boolean;
  activities: LocalDayActivity[];
  onAddActivity: (activity: LocalDayActivity) => void;
  onRemoveActivity: (key: string) => void;
};

const SLOTS: ActivitySlot[] = ["Morning", "Afternoon", "Evening"];

export function ItineraryDayCards({
  days,
  includeTransfers,
  activities,
  onAddActivity,
  onRemoveActivity,
}: ItineraryDayCardsProps) {
  const [picker, setPicker] = useState<{
    dayNum: number;
    slot: ActivitySlot;
    cityId: string;
    cityName: string;
  } | null>(null);

  const bySlot = useMemo(() => {
    const map = new Map<string, LocalDayActivity[]>();
    for (const a of activities) {
      const k = `${a.dayNum}:${a.slot}`;
      const list = map.get(k) || [];
      list.push(a);
      map.set(k, list);
    }
    return map;
  }, [activities]);

  if (days.length === 0) return null;

  const handleSelect = (pkg: MasterPackage, amount: number) => {
    if (!picker) return;
    onAddActivity({
      key:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `act-${Date.now()}`,
      dayNum: picker.dayNum,
      slot: picker.slot,
      cityId: picker.cityId,
      packageId: pkg._id,
      packageName: pkg.name,
      amount,
      currency: pkg.currency || "USD",
    });
    setPicker(null);
  };

  return (
    <section className="space-y-4">
      <div className="px-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#F8B400] bg-[#F8B400]/10 inline-block px-2 py-0.5 rounded">
          Itinerary
        </p>
        <h2 className="mt-2 text-base sm:text-lg font-semibold text-white">
          Day-by-day timeline
        </h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Add activities from B2B packages for each city. Amounts update live
          pricing.
        </p>
      </div>

      {days.map((day) => (
        <article key={`day-${day.dayNum}`} className={cardClass}>
          <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-white/[0.06] bg-black/20">
            <span className="text-[11px] font-bold uppercase tracking-wide bg-[#F8B400] text-black px-2.5 py-1 rounded-full">
              Day {day.dayNum}
            </span>
            <span className="text-sm font-semibold text-white">
              {day.cityName}
            </span>
            <span className="text-xs text-zinc-500 ml-auto">
              {formatDateShort(day.date)}
            </span>
          </div>

          <div className="p-5 space-y-4">
            {day.isFirstInCity && includeTransfers && (
              <div className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-[var(--ent-elevated,#1c1c22)]/60 px-3 py-2.5 text-xs">
                <Car size={15} className="text-[#F8B400] shrink-0" />
                <span className="flex-1 text-zinc-300">
                  Airport / hotel transfer on arrival
                </span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Included
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {SLOTS.map((slot) => {
                const slotActs = bySlot.get(`${day.dayNum}:${slot}`) || [];
                return (
                  <div
                    key={slot}
                    className={cn(
                      "rounded-lg border border-dashed border-white/[0.12] p-3",
                      "flex flex-col gap-2 min-h-[88px]"
                    )}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                      {slot}
                    </p>
                    <div className="flex-1 space-y-1.5">
                      {slotActs.map((a) => (
                        <div
                          key={a.key}
                          className="flex items-start gap-1.5 rounded-md border border-[#F8B400]/30 bg-[#F8B400]/10 px-2 py-1.5"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold text-[#FFD54A] truncate">
                              {a.packageName}
                            </p>
                            <p className="text-[10px] text-zinc-400">
                              +{formatMoney(a.amount, a.currency)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveActivity(a.key)}
                            className="text-zinc-500 hover:text-red-400 shrink-0"
                            aria-label={`Remove ${a.packageName}`}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setPicker({
                          dayNum: day.dayNum,
                          slot,
                          cityId: day.cityId,
                          cityName: day.cityName,
                        })
                      }
                      className="self-start inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded bg-[#F8B400] text-black hover:bg-[#FFD54A] transition-colors"
                    >
                      <Plus size={12} />
                      Add Activity
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-zinc-500 pt-1">
              <Moon size={13} className="text-[#F8B400]/80" />
              Overnight in {day.cityName}
              {day.hotelName ? ` · ${day.hotelName}` : " · hotel TBD"}
            </div>

            {day.isLastInCity && includeTransfers && (
              <div className="flex items-center gap-3 rounded-lg border border-white/[0.08] bg-[var(--ent-elevated,#1c1c22)]/60 px-3 py-2.5 text-xs">
                <Car size={15} className="text-[#F8B400] shrink-0" />
                <span className="flex-1 text-zinc-300">
                  Departure transfer available
                </span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Included
                </span>
              </div>
            )}
          </div>
        </article>
      ))}

      {picker ? (
        <AddActivityModal
          open
          cityId={picker.cityId}
          cityName={picker.cityName}
          dayNum={picker.dayNum}
          slot={picker.slot}
          excludePackageIds={(
            bySlot.get(`${picker.dayNum}:${picker.slot}`) || []
          ).map((a) => a.packageId)}
          onClose={() => setPicker(null)}
          onSelect={handleSelect}
        />
      ) : null}
    </section>
  );
}
