"use client";

import { useMemo } from "react";
import { Building2, Star } from "lucide-react";
import { SimpleSelect } from "@travelagency/ui";
import { useMasterHotels } from "../hooks/useProposals";
import type { MasterHotel } from "../types/proposal.types";
import {
  cardClass,
  formatMoney,
  type LocalStop,
} from "./composerShared";

function hotelLineAmount(hotel: MasterHotel | undefined, nights: number) {
  if (!hotel) return 0;
  return (Number(hotel.baseNightlyRate) || 0) * Math.max(1, nights);
}

function AccommodationCard({
  stop,
  cityName,
  starFilter,
  onHotelChange,
}: {
  stop: LocalStop;
  cityName: string;
  starFilter: number;
  onHotelChange: (hotelId: string, hotelName?: string) => void;
}) {
  const { data: hotels = [], isLoading } = useMasterHotels(stop.cityId);

  const filtered = useMemo(() => {
    if (!starFilter) return hotels;
    return hotels.filter((h) => h.starRating >= starFilter);
  }, [hotels, starFilter]);

  const selected = filtered.find((h) => h._id === stop.hotelId);
  const amount = hotelLineAmount(selected, stop.nights);
  const NONE = "__none__";

  const options = [
    { value: NONE, label: "No hotel selected" },
    ...filtered.map((h) => ({
      value: h._id,
      label: `${h.name} · ${h.starRating}★ · ${formatMoney(h.baseNightlyRate, h.currency)}/n`,
    })),
  ];

  return (
    <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-[var(--ent-elevated,#1c1c22)]/40">
      <div className="flex gap-4 p-4">
        <div className="w-[88px] h-[66px] rounded-lg bg-gradient-to-br from-[#F8B400]/15 to-[#F8B400]/5 border border-[#F8B400]/20 flex items-center justify-center shrink-0 text-[#F8B400]/70">
          <Building2 size={28} />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-white">
                Stay in {cityName}
              </p>
              <p className="text-xs text-zinc-500">
                {stop.nights} night{stop.nights === 1 ? "" : "s"}
                {selected ? (
                  <span className="inline-flex items-center gap-1 ml-2 text-[#FFD54A]">
                    <Star size={11} className="fill-[#FFD54A]" />
                    {selected.starRating}★
                  </span>
                ) : null}
              </p>
            </div>
            {amount > 0 && (
              <span className="text-sm font-bold text-[#FFD54A]">
                +{formatMoney(amount, selected?.currency || "USD")}
              </span>
            )}
          </div>
          {isLoading ? (
            <p className="text-xs text-zinc-500">Loading hotels…</p>
          ) : filtered.length === 0 ? (
            <p className="text-xs text-zinc-500">
              No hotels in master for this city
              {starFilter ? ` at ${starFilter}★+` : ""}.
            </p>
          ) : (
            <SimpleSelect
              value={stop.hotelId || NONE}
              onChange={(v) => {
                if (v === NONE) {
                  onHotelChange("");
                  return;
                }
                const hotel = filtered.find((h) => h._id === v);
                onHotelChange(v, hotel?.name);
              }}
              options={options}
              placeholder="Select hotel"
              highlight="gold"
              aria-label={`Hotel for ${cityName}`}
            />
          )}
          {selected?.notes ? (
            <p className="text-[11px] text-zinc-500 line-clamp-2">{selected.notes}</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type AccommodationCardsProps = {
  stops: LocalStop[];
  cityNameById: Map<string, string>;
  starFilter: number;
  onHotelChange: (key: string, hotelId: string, hotelName?: string) => void;
};

export function AccommodationCards({
  stops,
  cityNameById,
  starFilter,
  onHotelChange,
}: AccommodationCardsProps) {
  const withCities = stops.filter((s) => s.cityId);
  if (withCities.length === 0) return null;

  return (
    <section className={cardClass}>
      <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-white/[0.06]">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#F8B400] bg-[#F8B400]/10 inline-block px-2 py-0.5 rounded">
          Accommodation
        </p>
        <h2 className="mt-2 text-base sm:text-lg font-semibold text-white">
          Hotels from master data
        </h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Pick a hotel per city. Amounts use nightly rate × nights.
        </p>
      </div>
      <div className="p-5 sm:p-6 space-y-3">
        {withCities.map((stop) => (
          <AccommodationCard
            key={stop.key}
            stop={stop}
            cityName={cityNameById.get(stop.cityId) || "City"}
            starFilter={starFilter}
            onHotelChange={(hotelId, hotelName) =>
              onHotelChange(stop.key, hotelId, hotelName)
            }
          />
        ))}
      </div>
    </section>
  );
}
