/**
 * CustomPackageWizard — single-page premium composer (Sastikaa IA, TravelHero dark+gold).
 *
 * Destinations → Trip Details → Build Itinerary → Accommodation + Day timeline
 * Sticky Price Summary + Trip Summary → Save as Proposal (Pending)
 */
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, AirplaneLoader } from "@travelagency/ui";
import { cn } from "@travelagency/utils";
import { Loader2, Save } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import { STAR_RATING_OPTIONS } from "../config/proposal.config";
import {
  useMasterCities,
  usePriceProposal,
  useSaveProposal,
} from "../hooks/useProposals";
import type {
  CustomProposal,
  DestinationStop,
  TripDetailsInput,
} from "../types/proposal.types";
import { DestinationRows } from "./DestinationRows";
import { TripDetailsCard } from "./TripDetailsCard";
import { AccommodationCards } from "./AccommodationCards";
import {
  ItineraryDayCards,
  buildDayTimeline,
} from "./ItineraryDayCards";
import { ComposerSidebar } from "./ComposerSidebar";
import {
  formatDate,
  formatMoney,
  newStopKey,
  type LocalStop,
} from "./composerShared";

export default function CustomPackageWizard() {
  const router = useRouter();
  const { data: cities = [], isLoading: citiesLoading, isError: citiesError } =
    useMasterCities();
  const priceMutation = usePriceProposal();
  const saveMutation = useSaveProposal();

  const [stops, setStops] = useState<LocalStop[]>([
    { key: newStopKey(), cityId: "", nights: 2, hotelId: "" },
  ]);
  const [leavingFromCityId, setLeavingFromCityId] = useState("");
  const [nationalityCode, setNationalityCode] = useState("");
  const [leavingOn, setLeavingOn] = useState("");
  const [rooms, setRooms] = useState(1);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [starRating, setStarRating] = useState(0);
  const [includeTransfers, setIncludeTransfers] = useState(true);

  const [proposal, setProposal] = useState<CustomProposal | null>(null);
  const [itineraryBuilt, setItineraryBuilt] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [hotelNameById, setHotelNameById] = useState<Map<string, string>>(
    () => new Map()
  );

  const recalcTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextRecalc = useRef(false);

  const cityOptions = useMemo(
    () => cities.map((c) => ({ value: c._id, label: c.name })),
    [cities]
  );

  const cityNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of cities) map.set(c._id, c.name);
    return map;
  }, [cities]);

  const usedCityIds = useMemo(
    () => new Set(stops.map((s) => s.cityId).filter(Boolean)),
    [stops]
  );

  const summaryDestinations = useMemo(
    () =>
      stops
        .filter((s) => s.cityId)
        .map((s) => ({
          cityName: cityNameById.get(s.cityId) || "City",
          nights: s.nights,
          hotelName: s.hotelId
            ? hotelNameById.get(s.hotelId) ||
              proposal?.destinations.find((d) => d.hotelId === s.hotelId)
                ?.hotelName
            : undefined,
        })),
    [stops, cityNameById, hotelNameById, proposal]
  );

  const starLabel =
    STAR_RATING_OPTIONS.find((o) => o.value === String(starRating))?.label ??
    "Any star rating";

  const dayTimeline = useMemo(
    () =>
      itineraryBuilt
        ? buildDayTimeline(stops, cityNameById, hotelNameById, leavingOn)
        : [],
    [itineraryBuilt, stops, cityNameById, hotelNameById, leavingOn]
  );

  const validateDestinations = () => {
    if (stops.length === 0) {
      setFormError("Add at least one destination city.");
      return false;
    }
    for (const s of stops) {
      if (!s.cityId) {
        setFormError("Each stop needs a city from the master list.");
        return false;
      }
      if (!s.nights || s.nights < 1) {
        setFormError("Nights must be at least 1.");
        return false;
      }
    }
    const ids = stops.map((s) => s.cityId);
    if (new Set(ids).size !== ids.length) {
      setFormError("Each destination city can only appear once.");
      return false;
    }
    return true;
  };

  const validateTripDetails = () => {
    if (!leavingFromCityId) {
      setFormError("Select leaving-from city.");
      return false;
    }
    if (!nationalityCode) {
      setFormError("Select nationality.");
      return false;
    }
    if (!leavingOn) {
      setFormError("Select leaving-on date.");
      return false;
    }
    const d = new Date(`${leavingOn}T12:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d < today) {
      setFormError("Leaving-on date cannot be in the past.");
      return false;
    }
    if (adults < 1) {
      setFormError("At least one adult is required.");
      return false;
    }
    if (rooms < 1) {
      setFormError("At least one room is required.");
      return false;
    }
    return true;
  };

  const buildDto = useCallback(
    (save = false): {
      destinations: DestinationStop[];
      tripDetails: TripDetailsInput;
      save: boolean;
    } => ({
      destinations: stops.map((s) => ({
        cityId: s.cityId,
        nights: Math.max(1, Number(s.nights) || 1),
        hotelId: s.hotelId || undefined,
      })),
      tripDetails: {
        leavingFromCityId,
        nationalityCode,
        leavingOn,
        rooms,
        adults,
        children,
        starRating: starRating as 0 | 3 | 4 | 5,
        includeTransfers,
      },
      save,
    }),
    [
      stops,
      leavingFromCityId,
      nationalityCode,
      leavingOn,
      rooms,
      adults,
      children,
      starRating,
      includeTransfers,
    ]
  );

  const mergeHotelNames = (result: CustomProposal) => {
    setHotelNameById((prev) => {
      const next = new Map(prev);
      for (const d of result.destinations) {
        if (d.hotelId && d.hotelName) next.set(d.hotelId, d.hotelName);
      }
      return next;
    });
  };

  const runPrice = async (existingId?: string) => {
    const result = await priceMutation.mutateAsync({
      dto: buildDto(false),
      existingId: existingId ?? proposal?.id,
    });
    setProposal(result);
    mergeHotelNames(result);
    return result;
  };

  const handleBuildItinerary = async () => {
    if (!validateDestinations()) return;
    if (!validateTripDetails()) return;
    setFormError(null);
    try {
      skipNextRecalc.current = true;
      await runPrice();
      setItineraryBuilt(true);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not build itinerary"
      );
    }
  };

  const handleRecalculate = useCallback(async () => {
    if (!itineraryBuilt) return;
    setFormError(null);
    try {
      skipNextRecalc.current = true;
      await runPrice(proposal?.id);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not recalculate pricing"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runPrice uses latest buildDto/proposal via closure
  }, [itineraryBuilt, proposal?.id, buildDto]);

  // Debounced recalc when hotels / transfers change after build
  useEffect(() => {
    if (!itineraryBuilt || !proposal?.id) return;
    if (skipNextRecalc.current) {
      skipNextRecalc.current = false;
      return;
    }
    if (recalcTimer.current) clearTimeout(recalcTimer.current);
    recalcTimer.current = setTimeout(() => {
      void (async () => {
        try {
          const result = await priceMutation.mutateAsync({
            dto: buildDto(false),
            existingId: proposal.id,
          });
          setProposal(result);
          mergeHotelNames(result);
        } catch {
          /* toast from mutation */
        }
      })();
    }, 450);
    return () => {
      if (recalcTimer.current) clearTimeout(recalcTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    stops.map((s) => `${s.hotelId}:${s.nights}:${s.cityId}`).join("|"),
    includeTransfers,
    itineraryBuilt,
  ]);

  const handleSave = async () => {
    if (!proposal?.id) {
      setFormError("Build itinerary before saving.");
      return;
    }
    setFormError(null);
    try {
      await saveMutation.mutateAsync({
        dto: buildDto(true),
        existingId: proposal.id,
      });
      router.push(ROUTES.proposals);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not save proposal");
    }
  };

  const addStop = () => {
    setStops((prev) => [
      ...prev,
      { key: newStopKey(), cityId: "", nights: 2, hotelId: "" },
    ]);
  };

  const removeStop = (key: string) => {
    setStops((prev) =>
      prev.length <= 1 ? prev : prev.filter((s) => s.key !== key)
    );
  };

  const updateStop = (key: string, patch: Partial<LocalStop>) => {
    setStops((prev) =>
      prev.map((s) => (s.key === key ? { ...s, ...patch } : s))
    );
  };

  const moveStop = (key: string, direction: -1 | 1) => {
    setStops((prev) => {
      const idx = prev.findIndex((s) => s.key === key);
      if (idx < 0) return prev;
      const next = idx + direction;
      if (next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(next, 0, item);
      return copy;
    });
  };

  const busy = priceMutation.isPending || saveMutation.isPending;

  if (citiesLoading) {
    return (
      <AirplaneLoader size="md" label="Loading cities…" className="py-16" />
    );
  }

  if (citiesError) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-white/[0.08] bg-[var(--ent-card,#16161b)] p-6 text-center space-y-2"
        )}
      >
        <p className="text-red-400 font-semibold">
          Could not load city master data
        </p>
        <p className="text-sm text-zinc-500">
          Ask admin to add cities, then refresh.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F8B400]">
            TravelHero · Proposal Composer
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Create Custom Package
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl">
            Single-page builder — destinations, trip details, hotels, and live
            pricing from masters. Save submits for admin review.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-white/15 text-zinc-300 hover:bg-white/5"
            onClick={() => router.push(ROUTES.proposals)}
          >
            My Proposals
          </Button>
          <Button
            type="button"
            className="bg-[#F8B400] text-black hover:bg-[#FFD54A] font-semibold"
            disabled={busy || !itineraryBuilt || !proposal?.id}
            onClick={handleSave}
          >
            Save as Proposal
          </Button>
        </div>
      </div>

      {formError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {formError}
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start max-w-[1240px]">
        <div className="flex-1 min-w-0 space-y-4 sm:space-y-5">
          <DestinationRows
            stops={stops}
            cityOptions={cityOptions}
            usedCityIds={usedCityIds}
            onAdd={addStop}
            onRemove={removeStop}
            onUpdate={updateStop}
            onMove={moveStop}
          />

          <TripDetailsCard
            cityOptions={cityOptions}
            leavingFromCityId={leavingFromCityId}
            nationalityCode={nationalityCode}
            leavingOn={leavingOn}
            rooms={rooms}
            adults={adults}
            children={children}
            starRating={starRating}
            includeTransfers={includeTransfers}
            busy={busy}
            onLeavingFrom={setLeavingFromCityId}
            onNationality={setNationalityCode}
            onLeavingOn={setLeavingOn}
            onRooms={setRooms}
            onAdults={setAdults}
            onChildren={setChildren}
            onStarRating={setStarRating}
            onTransfers={setIncludeTransfers}
            onBuild={handleBuildItinerary}
          />

          {itineraryBuilt && (
            <>
              <AccommodationCards
                stops={stops}
                cityNameById={cityNameById}
                starFilter={starRating}
                onHotelChange={(key, hotelId, hotelName) => {
                  updateStop(key, { hotelId });
                  if (hotelId && hotelName) {
                    setHotelNameById((prev) => {
                      const next = new Map(prev);
                      next.set(hotelId, hotelName);
                      return next;
                    });
                  }
                }}
              />
              <ItineraryDayCards
                days={dayTimeline}
                includeTransfers={includeTransfers}
              />
            </>
          )}
        </div>

        <ComposerSidebar
          className="w-full lg:w-[300px] xl:w-[320px] shrink-0 lg:sticky lg:top-4"
          destinations={summaryDestinations}
          leavingFrom={cityNameById.get(leavingFromCityId) || ""}
          nationalityCode={nationalityCode}
          leavingOnLabel={formatDate(leavingOn)}
          adults={adults}
          children={children}
          rooms={rooms}
          starLabel={starLabel}
          includeTransfers={includeTransfers}
          proposal={proposal}
          itineraryBuilt={itineraryBuilt}
          busy={busy}
          onSave={handleSave}
          onRecalculate={handleRecalculate}
        />
      </div>

      {/* Mobile sticky price + save — full sidebar still stacks below for breakdown */}
      {itineraryBuilt && proposal ? (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-white/[0.1] bg-[#0A0A0C]/95 backdrop-blur-md px-3 py-3 safe-area-pb">
          <div className="max-w-[1440px] mx-auto flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Total
              </p>
              <p className="text-lg font-bold text-[#FFD54A] truncate">
                {formatMoney(
                  proposal.pricing.total,
                  proposal.pricing.currency || "USD"
                )}
              </p>
            </div>
            <Button
              type="button"
              className="shrink-0 bg-[#F8B400] text-black hover:bg-[#FFD54A] font-semibold"
              disabled={busy || !proposal.id}
              onClick={handleSave}
            >
              {busy ? (
                <Loader2 size={16} className="mr-2 animate-spin" />
              ) : (
                <Save size={16} className="mr-2" />
              )}
              Save
            </Button>
          </div>
        </div>
      ) : null}
      {itineraryBuilt && proposal ? <div className="lg:hidden h-20" aria-hidden /> : null}
    </div>
  );
}
