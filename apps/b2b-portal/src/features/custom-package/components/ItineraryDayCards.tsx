"use client";

import { Car, Moon } from "lucide-react";
import { cn } from "@travelagency/utils";
import {
  addDays,
  cardClass,
  formatDateShort,
  type LocalStop,
} from "./composerShared";

export type DayStopInfo = {
  dayNum: number;
  date: Date;
  cityName: string;
  hotelName?: string;
  isFirstInCity: boolean;
  isLastInCity: boolean;
  cityIndex: number;
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
};

const SLOTS = ["Morning", "Afternoon", "Evening"] as const;

export function ItineraryDayCards({
  days,
  includeTransfers,
}: ItineraryDayCardsProps) {
  if (days.length === 0) return null;

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
          Generated from your cities and nights. Activities catalog coming soon.
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
              {SLOTS.map((slot) => (
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
                  <div className="flex-1" />
                  <button
                    type="button"
                    disabled
                    className="self-start text-[11px] font-semibold px-2.5 py-1 rounded bg-white/5 text-zinc-500 border border-white/10 cursor-not-allowed"
                    title="Activity catalog coming soon"
                  >
                    Add Activity · Soon
                  </button>
                </div>
              ))}
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
    </section>
  );
}
