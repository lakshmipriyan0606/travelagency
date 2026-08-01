"use client";

import type { ComponentType } from "react";
import { Loader2, MapPin, Plane, Users, Star, Car, Save } from "lucide-react";
import { Button } from "@travelagency/ui";
import { getCountryLabel } from "@travelagency/forms";
import { cn } from "@travelagency/utils";
import type { CustomProposal } from "../types/proposal.types";
import { formatMoney } from "./composerShared";

export type TripSummaryStop = {
  cityName: string;
  nights: number;
  hotelName?: string;
};

type ComposerSidebarProps = {
  destinations: TripSummaryStop[];
  leavingFrom: string;
  nationalityCode: string;
  leavingOnLabel: string;
  adults: number;
  children: number;
  rooms: number;
  starLabel: string;
  includeTransfers: boolean;
  proposal: CustomProposal | null;
  itineraryBuilt: boolean;
  busy?: boolean;
  onSave: () => void;
  onRecalculate?: () => void;
  className?: string;
};

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-[#F8B400]/25 bg-[#F8B400]/10 text-[#F8B400]">
        <Icon size={12} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-zinc-100 leading-snug">
          {value}
        </p>
      </div>
    </div>
  );
}

export function ComposerSidebar({
  destinations,
  leavingFrom,
  nationalityCode,
  leavingOnLabel,
  adults,
  children,
  rooms,
  starLabel,
  includeTransfers,
  proposal,
  itineraryBuilt,
  busy,
  onSave,
  onRecalculate,
  className,
}: ComposerSidebarProps) {
  const totalNights = destinations.reduce((sum, d) => sum + (d.nights || 0), 0);
  const nationality = nationalityCode
    ? getCountryLabel(nationalityCode) || nationalityCode
    : "—";

  const travelerParts = [
    `${adults} adult${adults === 1 ? "" : "s"}`,
    children > 0 ? `${children} child${children === 1 ? "" : "ren"}` : null,
    `${rooms} room${rooms === 1 ? "" : "s"}`,
  ].filter(Boolean);

  const currency = proposal?.pricing.currency || "USD";
  const total = proposal?.pricing.total ?? 0;
  const perAdult =
    adults > 0 && proposal ? Math.round(total / adults) : 0;

  return (
    <aside className={cn("space-y-4", className)}>
      {/* Price Summary */}
      <div className="rounded-2xl border border-white/[0.08] bg-[var(--ent-card,#16161b)] overflow-hidden ent-card-shadow">
        <div className="px-5 py-3.5 border-b border-[#F8B400]/35 bg-gradient-to-r from-[#F8B400]/15 to-transparent">
          <p className="text-sm font-semibold text-white">Price Summary</p>
          {proposal?.reference ? (
            <p className="text-[11px] text-[#F8B400] mt-0.5 font-medium tracking-wide">
              {proposal.reference}
            </p>
          ) : null}
        </div>
        <div className="p-5 space-y-3">
          {!itineraryBuilt || !proposal ? (
            <p className="text-sm text-zinc-500">
              Build itinerary to calculate live pricing from masters.
            </p>
          ) : (
            <>
              <div className="flex justify-between items-baseline gap-3 border-b border-white/[0.06] pb-2">
                <span className="text-xs text-zinc-500">Price per adult</span>
                <span className="text-sm font-semibold text-zinc-200">
                  {formatMoney(perAdult, currency)}
                </span>
              </div>
              {(proposal.pricing.breakdown || []).slice(0, 6).map((line, i) => (
                <div
                  key={`${line.label}-${i}`}
                  className="flex justify-between gap-3 text-xs"
                >
                  <span className="text-zinc-500 truncate">{line.label}</span>
                  <span className="text-zinc-300 shrink-0">
                    {formatMoney(line.amount, currency)}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-baseline gap-3 pt-2 border-t border-white/[0.08]">
                <span className="text-xs font-semibold text-zinc-400">
                  Total price
                </span>
                <span className="text-2xl font-bold text-[#FFD54A]">
                  {formatMoney(total, currency)}
                </span>
              </div>
            </>
          )}

          <Button
            type="button"
            className="w-full bg-[#F8B400] text-black hover:bg-[#FFD54A] font-semibold mt-2"
            disabled={busy || !itineraryBuilt || !proposal?.id}
            onClick={onSave}
          >
            {busy ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            Save as Proposal
          </Button>

          {itineraryBuilt && onRecalculate ? (
            <Button
              type="button"
              variant="outline"
              className="w-full border-[#F8B400]/40 text-[#F8B400] hover:bg-[#F8B400]/10"
              disabled={busy}
              onClick={onRecalculate}
            >
              Recalculate
            </Button>
          ) : null}
        </div>
      </div>

      {/* Trip Summary */}
      <div className="rounded-2xl border border-white/[0.08] bg-[var(--ent-card,#16161b)] overflow-hidden ent-card-shadow">
        <div className="px-5 py-3.5 border-b border-white/[0.08] bg-black/30">
          <p className="text-sm font-semibold text-white">Trip Summary</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            Live from your form
            {totalNights > 0
              ? ` · ${totalNights} night${totalNights === 1 ? "" : "s"}`
              : ""}
          </p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <MapPin size={12} className="text-[#F8B400]" />
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Destinations
              </p>
            </div>
            {destinations.length === 0 ? (
              <p className="text-sm text-zinc-500">No cities yet</p>
            ) : (
              <ul className="space-y-2">
                {destinations.map((d, i) => (
                  <li key={`${d.cityName}-${i}`} className="flex gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-[#F8B400] shrink-0" />
                    <div>
                      <p className="font-medium text-zinc-100">
                        {d.cityName}{" "}
                        <span className="text-zinc-500 font-normal">
                          ({d.nights}n)
                        </span>
                      </p>
                      {d.hotelName ? (
                        <p className="text-[11px] text-zinc-500">{d.hotelName}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="h-px bg-white/[0.06]" />

          <div className="space-y-3">
            <SummaryRow icon={Plane} label="Leaving from" value={leavingFrom || "—"} />
            <SummaryRow icon={Users} label="Nationality" value={nationality} />
            <SummaryRow icon={Plane} label="Leaving on" value={leavingOnLabel || "—"} />
            <SummaryRow
              icon={Users}
              label="Travelers"
              value={travelerParts.join(" · ")}
            />
            <SummaryRow icon={Star} label="Star preference" value={starLabel} />
            <SummaryRow
              icon={Car}
              label="Transfers"
              value={includeTransfers ? "Included" : "Not included"}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
