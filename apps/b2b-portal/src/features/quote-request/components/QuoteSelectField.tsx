"use client";

import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@travelagency/ui";
import { cn } from "@travelagency/utils";

export type QuoteSelectOption = {
  value: string;
  label: string;
};

type QuoteSelectFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  options: readonly QuoteSelectOption[];
  required?: boolean;
  placeholder?: string;
  className?: string;
};

const labelClass =
  "text-[11px] font-semibold uppercase tracking-wider text-zinc-400";

export function QuoteSelectField<T extends FieldValues>({
  control,
  name,
  label,
  options,
  required,
  placeholder = "Select…",
  className,
}: QuoteSelectFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <div className={cn("space-y-2", className)}>
          <label className={labelClass}>
            {label}
            {required ? <span className="text-[#F8B400]"> *</span> : null}
          </label>
          <Select value={field.value ?? ""} onValueChange={field.onChange}>
            <SelectTrigger
              className={cn(
                "h-12 w-full rounded-xl border border-white/[0.12] bg-[var(--ent-elevated,#1c1c22)]",
                "px-4 text-sm text-[var(--ent-text-main,#F4F4F5)]",
                "hover:border-[#F8B400]/40 focus:border-[#F8B400] focus:ring-[3px] focus:ring-[#F8B400]/22",
                "data-[placeholder]:text-zinc-500",
                fieldState.error && "border-red-500/70"
              )}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="border-white/[0.1] bg-[#171717] text-white">
              {options.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="cursor-pointer text-sm focus:bg-[#F8B400] focus:text-[#0A0A0A]"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldState.error?.message ? (
            <p className="text-[10px] font-bold uppercase tracking-wider text-red-400">
              {fieldState.error.message}
            </p>
          ) : null}
        </div>
      )}
    />
  );
}
