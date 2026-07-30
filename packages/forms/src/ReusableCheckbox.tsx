"use client";

import React from "react";
import { Controller } from "react-hook-form";
import { Checkbox } from "@travelagency/ui";
import { cn } from "@travelagency/utils";

interface ReusableCheckboxProps {
  control: any;
  name: string;
  label: string;
  description?: string;
  className?: string;
}

export const ReusableCheckbox: React.FC<ReusableCheckboxProps> = ({
  control,
  name,
  label,
  description,
  className = "",
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const checked = Boolean(field.value);
        return (
          <label
            htmlFor={name}
            className={cn(
              "flex items-center gap-3 w-full !h-[52px] !min-h-[52px] px-3.5 rounded-xl cursor-pointer border transition-all duration-200 select-none",
              checked
                ? "bg-[#F8B400]/12 border-[#F8B400]/45 shadow-[inset_0_0_0_1px_rgba(248,180,0,0.12)]"
                : "bg-[var(--ent-surface,#101014)] border-white/[0.12] hover:border-[#F8B400]/35 hover:bg-white/[0.03]",
              className
            )}
          >
            <Checkbox
              id={name}
              checked={checked}
              onCheckedChange={field.onChange}
              className="!size-5 shrink-0 rounded-md"
            />
            <span
              className={cn(
                "font-semibold text-sm leading-none",
                checked ? "text-[#F8B400]" : "text-zinc-200"
              )}
            >
              {label}
            </span>
            {description && (
              <span className="text-xs text-zinc-400 ml-auto truncate max-w-[45%]">
                {description}
              </span>
            )}
          </label>
        );
      }}
    />
  );
};
