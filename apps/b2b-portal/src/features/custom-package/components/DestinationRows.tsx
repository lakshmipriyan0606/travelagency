"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button, SimpleSelect } from "@travelagency/ui";
import { cn } from "@travelagency/utils";
import { cardClass, fieldClass, labelClass, type LocalStop } from "./composerShared";

type CityOption = { value: string; label: string };

type DestinationRowsProps = {
  stops: LocalStop[];
  cityOptions: CityOption[];
  usedCityIds: Set<string>;
  onAdd: () => void;
  onRemove: (key: string) => void;
  onUpdate: (key: string, patch: Partial<LocalStop>) => void;
  onMove: (key: string, direction: -1 | 1) => void;
  disabled?: boolean;
};

export function DestinationRows({
  stops,
  cityOptions,
  usedCityIds,
  onAdd,
  onRemove,
  onUpdate,
  onMove,
  disabled,
}: DestinationRowsProps) {
  return (
    <section className={cardClass}>
      <div className="flex items-start justify-between gap-3 px-5 sm:px-6 pt-5 pb-4 border-b border-white/[0.06]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#F8B400] bg-[#F8B400]/10 inline-block px-2 py-0.5 rounded">
            Destinations
          </p>
          <h2 className="mt-2 text-base sm:text-lg font-semibold text-white">
            Enter cities in visit order
          </h2>
          <p className="text-sm text-zinc-500 mt-0.5">
            Master cities only — nights per stop, reorder as needed.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled
          className="shrink-0 border-white/10 text-zinc-500 cursor-not-allowed opacity-70"
          title="Suggest Itinerary coming soon"
        >
          Suggest Soon
        </Button>
      </div>

      <div className="p-5 sm:p-6 space-y-3">
        {cityOptions.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No cities in master data yet. Ask admin to add cities, then refresh.
          </p>
        ) : (
          <>
            {stops.map((stop, index) => {
              const optionsForRow = cityOptions.filter(
                (o) => o.value === stop.cityId || !usedCityIds.has(o.value)
              );
              return (
                <div
                  key={stop.key}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl",
                    "border border-white/[0.08] bg-[var(--ent-elevated,#1c1c22)]/70 px-3 py-3",
                    "focus-within:border-[#F8B400]/45"
                  )}
                >
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex flex-col gap-0.5">
                      <button
                        type="button"
                        aria-label="Move up"
                        disabled={index === 0 || disabled}
                        className="text-zinc-500 hover:text-[#F8B400] disabled:opacity-30"
                        onClick={() => onMove(stop.key, -1)}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        aria-label="Move down"
                        disabled={index === stops.length - 1 || disabled}
                        className="text-zinc-500 hover:text-[#F8B400] disabled:opacity-30"
                        onClick={() => onMove(stop.key, 1)}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                    <span className="text-xs font-bold text-[#F8B400] w-6">
                      #{index + 1}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <label className={labelClass}>City</label>
                    <SimpleSelect
                      value={stop.cityId || undefined}
                      onChange={(v) => onUpdate(stop.key, { cityId: v, hotelId: "" })}
                      options={optionsForRow}
                      placeholder="Select city"
                      highlight="gold"
                      aria-label={`Destination ${index + 1}`}
                      disabled={disabled}
                    />
                  </div>

                  <div className="w-full sm:w-[110px] space-y-1.5">
                    <label className={labelClass}>Nights</label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      className={fieldClass}
                      value={stop.nights}
                      disabled={disabled}
                      onChange={(e) =>
                        onUpdate(stop.key, {
                          nights: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={stops.length <= 1 || disabled}
                    className="text-zinc-400 hover:text-red-400 self-end sm:self-center"
                    onClick={() => onRemove(stop.key)}
                    aria-label="Remove destination"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              );
            })}

            <button
              type="button"
              onClick={onAdd}
              disabled={disabled || stops.length >= cityOptions.length}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#F8B400] hover:text-[#FFD54A] hover:underline disabled:opacity-40 disabled:no-underline"
            >
              <Plus size={15} />
              Add Another City
            </button>
          </>
        )}
      </div>
    </section>
  );
}
