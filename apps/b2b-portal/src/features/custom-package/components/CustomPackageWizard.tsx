/**
 * CustomPackageWizard — single-page premium composer (Sastikaa IA, TravelHero dark+gold).
 *
 * Destinations → Trip Details → Build Itinerary → Accommodation + Day timeline
 * Sticky Price Summary + Trip Summary → Save as Proposal (Pending)
 */
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, AirplaneLoader } from "@travelagency/ui";
import { cn } from "@travelagency/utils";
import { FileText, Loader2, Save } from "lucide-react";
import { ROUTES } from "@/lib/routes";
import {
  AUTO_DRAFT_SAVE_INTERVAL_MS,
  STAR_RATING_OPTIONS,
} from "../config/proposal.config";
import {
  useAutoSaveDraft,
  useMasterCities,
  usePriceProposal,
  useProposalDetail,
  useSaveProposal,
} from "../hooks/useProposals";
import type { CustomProposal } from "../types/proposal.types";
import { DestinationRows } from "./DestinationRows";
import { TripDetailsCard } from "./TripDetailsCard";
import { AccommodationCards } from "./AccommodationCards";
import {
  ItineraryDayCards,
  buildDayTimeline,
  type LocalDayActivity,
} from "./ItineraryDayCards";
import { ComposerSidebar } from "./ComposerSidebar";
import { ItineraryPdfActions } from "./ItineraryPdfPreviewModal";
import {
  formatDate,
  formatMoney,
  newStopKey,
  type LocalStop,
} from "./composerShared";

type ComposerErrorField =
  | "destinations"
  | "leavingFrom"
  | "nationality"
  | "leavingOn"
  | "adults"
  | "rooms";

export default function CustomPackageWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftParam = searchParams.get("draft") || "";

  const { data: cities = [], isLoading: citiesLoading, isError: citiesError } =
    useMasterCities();
  const { data: draftDetail, isLoading: draftLoading } =
    useProposalDetail(draftParam);

  const priceMutation = usePriceProposal();
  const saveMutation = useSaveProposal();
  const autoSaveMutation = useAutoSaveDraft();

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
  const [activities, setActivities] = useState<LocalDayActivity[]>([]);

  const [proposal, setProposal] = useState<CustomProposal | null>(null);
  const [itineraryBuilt, setItineraryBuilt] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errorFocusField, setErrorFocusField] =
    useState<ComposerErrorField | null>(null);
  const [errorScrollKey, setErrorScrollKey] = useState(0);
  const [hotelNameById, setHotelNameById] = useState<Map<string, string>>(
    () => new Map()
  );
  const [lastAutoSavedAt, setLastAutoSavedAt] = useState<Date | null>(null);
  const [draftHydrated, setDraftHydrated] = useState(false);

  const formErrorBannerRef = useRef<HTMLDivElement>(null);
  const recalcTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextRecalc = useRef(false);
  const skipNextAutoSave = useRef(false);
  const proposalIdRef = useRef<string | undefined>(undefined);

  const showFormError = useCallback(
    (message: string, field?: ComposerErrorField) => {
      setFormError(message);
      setErrorFocusField(field ?? null);
      setErrorScrollKey((k) => k + 1);
    },
    []
  );

  const clearFormError = useCallback(() => {
    setFormError(null);
    setErrorFocusField(null);
  }, []);

  // After validation/API errors, scroll banner or invalid field into view
  useEffect(() => {
    if (!formError) return;
    const fieldEl = errorFocusField
      ? document.querySelector<HTMLElement>(
          `[data-composer-field="${errorFocusField}"]`
        )
      : null;
    const target = fieldEl ?? formErrorBannerRef.current;
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    if (fieldEl) {
      const control = fieldEl.querySelector<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      control?.focus({ preventScroll: true });
    } else {
      formErrorBannerRef.current?.focus({ preventScroll: true });
    }
  }, [formError, errorFocusField, errorScrollKey]);

  useEffect(() => {
    proposalIdRef.current = proposal?.id;
  }, [proposal?.id]);

  // Hydrate composer from ?draft=id (same proposal continue)
  useEffect(() => {
    if (!draftParam || !draftDetail || draftHydrated) return;
    const p = draftDetail;
    setProposal(p);
    setStops(
      (p.destinations || []).length > 0
        ? p.destinations.map((d) => ({
            key: newStopKey(),
            cityId: String(d.cityId),
            nights: d.nights || 1,
            hotelId: d.hotelId ? String(d.hotelId) : "",
            packageId: d.packageId ? String(d.packageId) : "",
          }))
        : [{ key: newStopKey(), cityId: "", nights: 2, hotelId: "" }]
    );
    const hotelMap = new Map<string, string>();
    for (const d of p.destinations || []) {
      if (d.hotelId && d.hotelName) hotelMap.set(String(d.hotelId), d.hotelName);
    }
    setHotelNameById(hotelMap);
    setLeavingFromCityId(
      p.tripDetails?.leavingFromCityId
        ? String(p.tripDetails.leavingFromCityId)
        : ""
    );
    setNationalityCode(p.tripDetails?.nationalityCode || "");
    setLeavingOn(
      p.tripDetails?.leavingOn
        ? String(p.tripDetails.leavingOn).slice(0, 10)
        : ""
    );
    setRooms(p.tripDetails?.rooms || 1);
    setAdults(p.tripDetails?.adults || 2);
    setChildren(p.tripDetails?.children || 0);
    setStarRating((p.tripDetails?.starRating as 0 | 3 | 4 | 5) || 0);
    setIncludeTransfers(p.tripDetails?.includeTransfers !== false);
    setActivities(
      (p.activities || []).map((a) => ({
        key: newStopKey(),
        dayNum: a.dayNum,
        slot: a.slot,
        cityId: String(a.cityId),
        packageId: String(a.packageId),
        packageName: a.packageName || "Activity",
        amount: a.amount || 0,
        currency: a.currency || "USD",
      }))
    );
    setItineraryBuilt(
      Boolean(p.destinations?.length) && Boolean(p.tripDetails?.leavingOn)
    );
    skipNextAutoSave.current = true;
    setDraftHydrated(true);
  }, [draftParam, draftDetail, draftHydrated]);

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
      showFormError("Add at least one destination city.", "destinations");
      return false;
    }
    for (const s of stops) {
      if (!s.cityId) {
        showFormError(
          "Each stop needs a city from the master list.",
          "destinations"
        );
        return false;
      }
      if (!s.nights || s.nights < 1) {
        showFormError("Nights must be at least 1.", "destinations");
        return false;
      }
    }
    const ids = stops.map((s) => s.cityId);
    if (new Set(ids).size !== ids.length) {
      showFormError(
        "Each destination city can only appear once.",
        "destinations"
      );
      return false;
    }
    return true;
  };

  const validateTripDetails = () => {
    if (!leavingFromCityId) {
      showFormError("Select leaving-from city.", "leavingFrom");
      return false;
    }
    if (!nationalityCode) {
      showFormError("Select nationality.", "nationality");
      return false;
    }
    if (!leavingOn) {
      showFormError("Select leaving-on date.", "leavingOn");
      return false;
    }
    const d = new Date(`${leavingOn}T12:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (d < today) {
      showFormError("Leaving-on date cannot be in the past.", "leavingOn");
      return false;
    }
    if (adults < 1) {
      showFormError("At least one adult is required.", "adults");
      return false;
    }
    if (rooms < 1) {
      showFormError("At least one room is required.", "rooms");
      return false;
    }
    return true;
  };

  const buildDto = useCallback(
    (save = false) => ({
      destinations: stops.map((s) => ({
        cityId: s.cityId,
        nights: Math.max(1, Number(s.nights) || 1),
        hotelId: s.hotelId || undefined,
        packageId: s.packageId || undefined,
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
      activities: activities.map((a) => ({
        dayNum: a.dayNum,
        slot: a.slot,
        cityId: a.cityId,
        packageId: a.packageId,
      })),
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
      activities,
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

  const applyProposalResult = (result: CustomProposal) => {
    setProposal(result);
    mergeHotelNames(result);
    if (result.id && searchParams.get("draft") !== result.id) {
      router.replace(ROUTES.customPackageDraft(result.id), { scroll: false });
    }
  };

  const runPrice = async (existingId?: string) => {
    const result = await priceMutation.mutateAsync({
      dto: buildDto(false),
      existingId: existingId ?? proposalIdRef.current,
    });
    applyProposalResult(result);
    skipNextAutoSave.current = true;
    setLastAutoSavedAt(new Date());
    return result;
  };

  const handleBuildItinerary = async () => {
    if (!validateDestinations()) return;
    if (!validateTripDetails()) return;
    clearFormError();
    try {
      skipNextRecalc.current = true;
      await runPrice();
      setItineraryBuilt(true);
    } catch (err) {
      showFormError(
        err instanceof Error ? err.message : "Could not build itinerary"
      );
    }
  };

  const handleRecalculate = useCallback(async () => {
    if (!itineraryBuilt) return;
    clearFormError();
    try {
      skipNextRecalc.current = true;
      await runPrice(proposal?.id);
    } catch (err) {
      showFormError(
        err instanceof Error ? err.message : "Could not recalculate pricing"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runPrice uses latest buildDto/proposal via closure
  }, [itineraryBuilt, proposal?.id, buildDto, clearFormError, showFormError]);

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
          applyProposalResult(result);
          skipNextAutoSave.current = true;
          setLastAutoSavedAt(new Date());
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
    stops.map((s) => `${s.hotelId}:${s.packageId || ""}:${s.nights}:${s.cityId}`).join("|"),
    includeTransfers,
    activities.map((a) => `${a.key}:${a.packageId}`).join("|"),
    itineraryBuilt,
  ]);

  // Drop activities that no longer match the day timeline / cities
  useEffect(() => {
    if (!itineraryBuilt) return;
    const valid = new Set(
      dayTimeline.map((d) => `${d.dayNum}:${d.cityId}`)
    );
    setActivities((prev) => {
      const next = prev.filter((a) => valid.has(`${a.dayNum}:${a.cityId}`));
      return next.length === prev.length ? prev : next;
    });
  }, [dayTimeline, itineraryBuilt]);

  // Auto-save draft on same proposal id once at least one city is chosen
  useEffect(() => {
    const hasCity = stops.some((s) => s.cityId);
    if (!hasCity) return;
    if (draftParam && !draftHydrated) return;
    if (skipNextAutoSave.current) {
      skipNextAutoSave.current = false;
      return;
    }
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      void (async () => {
        try {
          const result = await autoSaveMutation.mutateAsync({
            dto: buildDto(false),
            existingId: proposalIdRef.current,
          });
          applyProposalResult(result);
          setLastAutoSavedAt(new Date());
        } catch {
          /* silent */
        }
      })();
    }, AUTO_DRAFT_SAVE_INTERVAL_MS);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    stops.map((s) => `${s.cityId}:${s.nights}:${s.hotelId}:${s.packageId || ""}`).join("|"),
    leavingFromCityId,
    nationalityCode,
    leavingOn,
    rooms,
    adults,
    children,
    starRating,
    includeTransfers,
    activities.map((a) => `${a.key}:${a.packageId}`).join("|"),
    draftHydrated,
  ]);

  const handleSave = async () => {
    if (!proposal?.id) {
      showFormError("Build itinerary before saving.");
      return;
    }
    if (!validateDestinations()) return;
    if (!validateTripDetails()) return;
    clearFormError();
    try {
      await saveMutation.mutateAsync({
        dto: buildDto(true),
        existingId: proposal.id,
      });
      router.push(ROUTES.proposals);
    } catch (err) {
      showFormError(
        err instanceof Error ? err.message : "Could not save proposal"
      );
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

  const busy =
    priceMutation.isPending ||
    saveMutation.isPending ||
    autoSaveMutation.isPending;

  const draftName =
    proposal?.name?.trim() ||
    (summaryDestinations.length
      ? summaryDestinations.map((d) => d.cityName).join(" → ")
      : "");

  /** Live snapshot so PDF reflects composer stays/activities, not only last priced payload. */
  const pdfProposal = useMemo((): CustomProposal | null => {
    if (!proposal?.id || !itineraryBuilt) return null;
    const destinations = stops
      .filter((s) => s.cityId)
      .map((s) => {
        const prior = proposal.destinations?.find(
          (d) => String(d.cityId) === s.cityId
        );
        return {
          cityId: s.cityId,
          cityName: cityNameById.get(s.cityId) || prior?.cityName || "City",
          nights: s.nights,
          hotelId: s.hotelId || null,
          hotelName: s.hotelId
            ? hotelNameById.get(s.hotelId) || prior?.hotelName
            : undefined,
          packageId: s.packageId || null,
        };
      });
    return {
      ...proposal,
      name: draftName || proposal.name,
      destinations,
      activities: activities.map((a) => ({
        dayNum: a.dayNum,
        slot: a.slot,
        cityId: a.cityId,
        packageId: a.packageId,
        packageName: a.packageName,
        amount: a.amount,
        currency: a.currency,
      })),
      tripDetails: {
        ...proposal.tripDetails,
        leavingFromCityId: leavingFromCityId || null,
        leavingFromName: cityNameById.get(leavingFromCityId) || undefined,
        nationalityCode: nationalityCode || proposal.tripDetails?.nationalityCode,
        leavingOn: leavingOn || null,
        rooms,
        adults,
        children,
        starRating,
        includeTransfers,
      },
    };
  }, [
    proposal,
    itineraryBuilt,
    stops,
    cityNameById,
    hotelNameById,
    activities,
    draftName,
    leavingFromCityId,
    nationalityCode,
    leavingOn,
    rooms,
    adults,
    children,
    starRating,
    includeTransfers,
  ]);

  if (citiesLoading || (draftParam && draftLoading && !draftHydrated)) {
    return (
      <AirplaneLoader size="md" label="Loading…" className="py-16" />
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
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#F8B400]">
            TravelHero · Proposal Composer
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            Create Custom Package
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl">
            Drafts auto-save as you build. Save as Proposal submits for admin
            review.
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
          <ItineraryPdfActions
            proposal={pdfProposal}
            enabled={Boolean(itineraryBuilt && proposal?.id)}
          />
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

      {/* Same draft name at top — matches My Proposals for easy recognition */}
      {proposal?.id ? (
        <div className="rounded-xl border border-[#F8B400]/30 bg-[#F8B400]/[0.08] px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div className="flex items-start gap-2.5 min-w-0 flex-1">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F8B400]/20 text-[#F8B400]">
              <FileText size={16} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#F8B400]">
                {proposal.status === "draft" || proposal.status === "priced"
                  ? "Draft"
                  : "Proposal"}{" "}
                · {proposal.reference}
              </p>
              <p className="text-sm sm:text-base font-semibold text-white truncate">
                {draftName || "Untitled draft"}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500 sm:text-right shrink-0">
            {autoSaveMutation.isPending
              ? "Saving draft…"
              : lastAutoSavedAt
                ? `Auto-saved ${lastAutoSavedAt.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "Draft will auto-save"}
          </p>
        </div>
      ) : stops.some((s) => s.cityId) ? (
        <div className="rounded-xl border border-white/[0.08] bg-black/20 px-4 py-2.5 text-xs text-zinc-500">
          {autoSaveMutation.isPending
            ? "Creating draft…"
            : "Add a city — draft auto-saves with a name you can find in My Proposals."}
        </div>
      ) : null}

      {formError && (
        <div
          ref={formErrorBannerRef}
          role="alert"
          tabIndex={-1}
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 outline-none"
        >
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
                  updateStop(key, {
                    hotelId,
                    packageId: hotelId ? "" : undefined,
                  });
                  if (hotelId && hotelName) {
                    setHotelNameById((prev) => {
                      const next = new Map(prev);
                      next.set(hotelId, hotelName);
                      return next;
                    });
                  }
                }}
                onPackageChange={(key, packageId) => {
                  updateStop(key, {
                    packageId,
                    hotelId: packageId ? "" : undefined,
                  });
                }}
              />
              <ItineraryDayCards
                days={dayTimeline}
                includeTransfers={includeTransfers}
                activities={activities}
                onAddActivity={(activity) => {
                  setActivities((prev) => [...prev, activity]);
                }}
                onRemoveActivity={(key) => {
                  setActivities((prev) => prev.filter((a) => a.key !== key));
                }}
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
