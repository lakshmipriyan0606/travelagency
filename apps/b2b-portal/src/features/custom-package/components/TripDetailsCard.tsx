"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { Button, SimpleSelect, SimpleCheckbox } from "@travelagency/ui";
import { CountrySelect } from "@travelagency/forms";
import { PackageDateField } from "./PackageDateField";
import { STAR_RATING_OPTIONS } from "../config/proposal.config";
import { cardClass, fieldClass, labelClass } from "./composerShared";

type CityOption = { value: string; label: string };

type TripDetailsCardProps = {
  cityOptions: CityOption[];
  leavingFromCityId: string;
  nationalityCode: string;
  leavingOn: string;
  rooms: number;
  adults: number;
  children: number;
  starRating: number;
  includeTransfers: boolean;
  busy?: boolean;
  onLeavingFrom: (v: string) => void;
  onNationality: (v: string) => void;
  onLeavingOn: (v: string) => void;
  onRooms: (v: number) => void;
  onAdults: (v: number) => void;
  onChildren: (v: number) => void;
  onStarRating: (v: number) => void;
  onTransfers: (v: boolean) => void;
  onBuild: () => void;
};

export function TripDetailsCard({
  cityOptions,
  leavingFromCityId,
  nationalityCode,
  leavingOn,
  rooms,
  adults,
  children,
  starRating,
  includeTransfers,
  busy,
  onLeavingFrom,
  onNationality,
  onLeavingOn,
  onRooms,
  onAdults,
  onChildren,
  onStarRating,
  onTransfers,
  onBuild,
}: TripDetailsCardProps) {
  return (
    <section className={cardClass}>
      <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-white/[0.06]">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#F8B400] bg-[#F8B400]/10 inline-block px-2 py-0.5 rounded">
          Trip Details
        </p>
        <h2 className="mt-2 text-base sm:text-lg font-semibold text-white">
          Configure your trip
        </h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Departure, nationality, travelers, preference, and transfers.
        </p>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass}>
              Leaving from <span className="text-red-400">*</span>
            </label>
            <SimpleSelect
              value={leavingFromCityId || undefined}
              onChange={onLeavingFrom}
              options={cityOptions}
              placeholder="Select city"
              highlight="gold"
              aria-label="Leaving from city"
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>
              Nationality <span className="text-red-400">*</span>
            </label>
            <CountrySelect
              value={nationalityCode || undefined}
              onChange={onNationality}
              placeholder="Select nationality"
              highlight="gold"
            />
          </div>
          <PackageDateField
            label="Leaving on"
            value={leavingOn}
            onChange={onLeavingOn}
            required
            aria-label="Leaving on date"
          />
          <div className="space-y-1.5">
            <label className={labelClass}>Star preference</label>
            <SimpleSelect
              value={String(starRating)}
              onChange={(v) => onStarRating(Number(v))}
              options={[...STAR_RATING_OPTIONS]}
              highlight="gold"
              aria-label="Star rating preference"
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Rooms</label>
            <input
              type="number"
              min={1}
              max={50}
              className={fieldClass}
              value={rooms}
              onChange={(e) => onRooms(Math.max(1, Number(e.target.value) || 1))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className={labelClass}>
                Adults <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={99}
                className={fieldClass}
                value={adults}
                onChange={(e) =>
                  onAdults(Math.max(1, Number(e.target.value) || 1))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Children</label>
              <input
                type="number"
                min={0}
                max={99}
                className={fieldClass}
                value={children}
                onChange={(e) =>
                  onChildren(Math.max(0, Number(e.target.value) || 0))
                }
              />
            </div>
          </div>
        </div>

        <SimpleCheckbox
          checked={includeTransfers}
          onCheckedChange={onTransfers}
          label="Add Transfers"
          appearance="boxed"
        />

        <Button
          type="button"
          className="bg-[#F8B400] text-black hover:bg-[#FFD54A] font-semibold"
          disabled={busy}
          onClick={onBuild}
        >
          {busy ? (
            <Loader2 size={16} className="mr-2 animate-spin" />
          ) : null}
          Build Itinerary
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </div>
    </section>
  );
}
