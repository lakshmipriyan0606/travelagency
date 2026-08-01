"use client";

import { useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar, Popover, PopoverContent, PopoverTrigger } from "@travelagency/ui";
import { cn } from "@travelagency/utils";

type PackageDateFieldProps = {
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
  required?: boolean;
  minDate?: Date;
  className?: string;
  "aria-label"?: string;
};

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseIsoDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const d = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

function formatDisplay(value?: string): string {
  const d = parseIsoDate(value);
  if (!d) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function PackageDateField({
  label,
  value,
  onChange,
  required,
  minDate,
  className,
  "aria-label": ariaLabel,
}: PackageDateFieldProps) {
  const [open, setOpen] = useState(false);
  const floor =
    minDate ??
    (() => {
      const t = new Date();
      t.setHours(0, 0, 0, 0);
      return t;
    })();
  const selected = parseIsoDate(value);

  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
        {label}
        {required ? <span className="text-[#F8B400]"> *</span> : null}
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={ariaLabel ?? label}
            className={cn(
              "flex h-12 w-full items-center justify-between rounded-xl border border-white/[0.12]",
              "bg-[var(--ent-elevated,#1c1c22)] px-4 text-left text-sm outline-none transition-all duration-200",
              "text-[var(--ent-text-main,#F4F4F5)] hover:border-[#F8B400]/40",
              "focus-visible:border-[#F8B400] focus-visible:ring-[3px] focus-visible:ring-[#F8B400]/22",
              !value && "text-zinc-500"
            )}
          >
            <span>{value ? formatDisplay(value) : "Select date"}</span>
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
              onChange(date ? toIsoDate(date) : "");
              if (date) setOpen(false);
            }}
            disabled={(date) => date < floor}
            captionLayout="dropdown"
            className="bg-[#171717] text-white [--cell-size:2.25rem]"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
