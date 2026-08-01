"use client";

import { useMemo } from "react";
import { Building2, Lightbulb, Package, Star } from "lucide-react";
import { SimpleSelect } from "@travelagency/ui";
import { cn } from "@travelagency/utils";
import { useMasterHotels, useMasterPackages } from "../hooks/useProposals";
import type { MasterHotel, MasterPackage } from "../types/proposal.types";
import {
  cardClass,
  formatMoney,
  type LocalStop,
} from "./composerShared";

function hotelLineAmount(hotel: MasterHotel | undefined, nights: number) {
  if (!hotel) return 0;
  return (Number(hotel.baseNightlyRate) || 0) * Math.max(1, nights);
}

function packageStayAmount(pkg: MasterPackage | undefined, nights: number) {
  if (!pkg) return 0;
  const base = Number(pkg.amounts?.basePrice) || 0;
  const perNight = Number(pkg.amounts?.perNight) || 0;
  const activity = Number(pkg.amounts?.activityAddon) || 0;
  return base + perNight * Math.max(1, nights) + activity;
}

function AccommodationCard({
  stop,
  cityName,
  starFilter,
  onHotelChange,
  onPackageChange,
}: {
  stop: LocalStop;
  cityName: string;
  starFilter: number;
  onHotelChange: (hotelId: string, hotelName?: string) => void;
  onPackageChange: (packageId: string) => void;
}) {
  const { data: hotels = [], isLoading: hotelsLoading } = useMasterHotels(
    stop.cityId
  );
  const { data: packages = [], isLoading: packagesLoading } = useMasterPackages(
    stop.cityId
  );

  const filteredHotels = useMemo(() => {
    if (!starFilter) return hotels;
    return hotels.filter((h) => h.starRating >= starFilter);
  }, [hotels, starFilter]);

  const selectedHotel = filteredHotels.find((h) => h._id === stop.hotelId);
  const selectedPackage = packages.find((p) => p._id === stop.packageId);
  const hotelAmount = hotelLineAmount(selectedHotel, stop.nights);
  const packageAmount = packageStayAmount(selectedPackage, stop.nights);
  const amount = stop.packageId ? packageAmount : hotelAmount;

  const NONE = "__none__";
  const hotelOptions = [
    { value: NONE, label: "No hotel selected" },
    ...filteredHotels.map((h) => ({
      value: h._id,
      label: `${h.name} · ${h.starRating}★ · ${formatMoney(h.baseNightlyRate, h.currency)}/n`,
    })),
  ];
  const packageOptions = [
    { value: NONE, label: "No package selected" },
    ...packages.map((p) => ({
      value: p._id,
      label: `${p.name} · from ${formatMoney(
        packageStayAmount(p, stop.nights),
        p.currency || "USD"
      )}`,
    })),
  ];

  /** Suggestions only — not applied until user clicks. Prefer 3 cheapest by base. */
  const suggestions = useMemo(
    () =>
      [...packages]
        .sort(
          (a, b) =>
            (Number(a.amounts?.basePrice) || 0) -
            (Number(b.amounts?.basePrice) || 0)
        )
        .slice(0, 3),
    [packages]
  );

  const needsChoice = !stop.hotelId && !stop.packageId;
  const isLoading = hotelsLoading || packagesLoading;

  return (
    <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-[var(--ent-elevated,#1c1c22)]/40">
      <div className="flex gap-4 p-4">
        <div className="w-[88px] h-[66px] rounded-lg bg-gradient-to-br from-[#F8B400]/15 to-[#F8B400]/5 border border-[#F8B400]/20 flex items-center justify-center shrink-0 text-[#F8B400]/70">
          <Building2 size={28} />
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-white">
                Stay in {cityName}
              </p>
              <p className="text-xs text-zinc-500">
                {stop.nights} night{stop.nights === 1 ? "" : "s"}
                {selectedHotel ? (
                  <span className="inline-flex items-center gap-1 ml-2 text-[#FFD54A]">
                    <Star size={11} className="fill-[#FFD54A]" />
                    {selectedHotel.starRating}★
                  </span>
                ) : null}
              </p>
            </div>
            {amount > 0 && (
              <span className="text-sm font-bold text-[#FFD54A]">
                +{formatMoney(
                  amount,
                  selectedPackage?.currency ||
                    selectedHotel?.currency ||
                    "USD"
                )}
              </span>
            )}
          </div>

          {needsChoice ? (
            <div
              className={cn(
                "rounded-lg border border-[#F8B400]/35 bg-[#F8B400]/10 px-3 py-2.5",
                "flex gap-2 items-start"
              )}
            >
              <Lightbulb
                size={16}
                className="text-[#F8B400] shrink-0 mt-0.5"
              />
              <div className="min-w-0 space-y-1.5">
                <p className="text-xs text-[#FFD54A] font-medium leading-snug">
                  Nothing priced yet for this city. Choose a hotel or a package
                  below — we won’t add one for you.
                </p>
                {suggestions.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 w-full">
                      Suggestions
                    </span>
                    {suggestions.map((pkg) => (
                      <button
                        key={pkg._id}
                        type="button"
                        onClick={() => onPackageChange(pkg._id)}
                        className="inline-flex items-center gap-1 rounded-full border border-[#F8B400]/40 bg-black/30 px-2.5 py-1 text-[11px] font-medium text-[#FFD54A] hover:bg-[#F8B400]/15 transition-colors"
                      >
                        <Package size={11} />
                        {pkg.name}
                        <span className="text-zinc-500">
                          ·{" "}
                          {formatMoney(
                            packageStayAmount(pkg, stop.nights),
                            pkg.currency || "USD"
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : !packagesLoading ? (
                  <p className="text-[11px] text-zinc-500">
                    No packages in master for this city yet — ask admin to add
                    one, or pick a hotel.
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {isLoading ? (
            <p className="text-xs text-zinc-500">Loading options…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Hotel
                </p>
                {filteredHotels.length === 0 ? (
                  <p className="text-xs text-zinc-500">
                    No hotels
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
                      const hotel = filteredHotels.find((h) => h._id === v);
                      onHotelChange(v, hotel?.name);
                    }}
                    options={hotelOptions}
                    placeholder="Select hotel"
                    highlight="gold"
                    aria-label={`Hotel for ${cityName}`}
                  />
                )}
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Package (optional)
                </p>
                {packages.length === 0 ? (
                  <p className="text-xs text-zinc-500">No packages.</p>
                ) : (
                  <SimpleSelect
                    value={stop.packageId || NONE}
                    onChange={(v) =>
                      onPackageChange(v === NONE ? "" : v)
                    }
                    options={packageOptions}
                    placeholder="Select package"
                    highlight="gold"
                    aria-label={`Package for ${cityName}`}
                  />
                )}
              </div>
            </div>
          )}

          {selectedHotel?.notes ? (
            <p className="text-[11px] text-zinc-500 line-clamp-2">
              {selectedHotel.notes}
            </p>
          ) : null}
          {selectedPackage && !stop.hotelId ? (
            <p className="text-[11px] text-zinc-500">
              Using package pricing for this stay (not a default — you selected
              it).
            </p>
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
  onPackageChange: (key: string, packageId: string) => void;
};

export function AccommodationCards({
  stops,
  cityNameById,
  starFilter,
  onHotelChange,
  onPackageChange,
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
          Hotels & packages
        </h2>
        <p className="text-sm text-zinc-500 mt-0.5">
          Nothing is added to the price until you choose a hotel or package.
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
            onPackageChange={(packageId) =>
              onPackageChange(stop.key, packageId)
            }
          />
        ))}
      </div>
    </section>
  );
}
