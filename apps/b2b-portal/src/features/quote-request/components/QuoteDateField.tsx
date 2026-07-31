"use client";

import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar, Popover, PopoverContent, PopoverTrigger } from "@travelagency/ui";
import { cn } from "@travelagency/utils";

type QuoteDateFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  required?: boolean;
  minDate?: Date;
  className?: string;
};

const labelClass =
  "text-[11px] font-semibold uppercase tracking-wider text-zinc-400";

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseIsoDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function formatDisplay(value?: string): string {
  const d = parseIsoDate(value);
  if (!d) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function QuoteDateField<T extends FieldValues>({
  control,
  name,
  label,
  required,
  minDate,
  className,
}: QuoteDateFieldProps<T>) {
  const floor =
    minDate ??
    (() => {
      const t = new Date();
      t.setHours(0, 0, 0, 0);
      return t;
    })();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const selected = parseIsoDate(field.value);

        return (
          <div className={cn("space-y-2", className)}>
            <label className={labelClass}>
              {label}
              {required ? <span className="text-[#F8B400]"> *</span> : null}
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex h-12 w-full items-center justify-between rounded-xl border border-white/[0.12]",
                    "bg-[var(--ent-elevated,#1c1c22)] px-4 text-left text-sm outline-none transition-all",
                    "text-[var(--ent-text-main,#F4F4F5)] hover:border-[#F8B400]/40",
                    "focus-visible:border-[#F8B400] focus-visible:ring-[3px] focus-visible:ring-[#F8B400]/22",
                    !field.value && "text-zinc-500",
                    fieldState.error && "border-red-500/70"
                  )}
                >
                  <span>{field.value ? formatDisplay(field.value) : "Select date"}</span>
                  <CalendarIcon size={16} className="shrink-0 text-[#F8B400]" aria-hidden />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="quote-date-popover w-auto border-white/[0.1] bg-[#171717] p-0 text-white shadow-xl"
              >
                <Calendar
                  mode="single"
                  selected={selected}
                  onSelect={(date) => {
                    field.onChange(date ? toIsoDate(date) : "");
                  }}
                  disabled={(date) => date < floor}
                  captionLayout="dropdown"
                  initialFocus
                  className="bg-[#171717] text-white [--cell-size:2.25rem]"
                />
              </PopoverContent>
            </Popover>
            {fieldState.error?.message ? (
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">
                {fieldState.error.message}
              </p>
            ) : null}
          </div>
        );
      }}
    />
  );
}
