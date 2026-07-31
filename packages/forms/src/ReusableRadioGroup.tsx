"use client";

import React from "react";
import { Controller } from "react-hook-form";
import { SimpleRadio } from "@travelagency/ui";
import { Label } from "@travelagency/ui";
import { cn } from "@travelagency/utils";

interface Option {
  value: string;
  label: string;
}

interface ReusableRadioGroupProps {
  control: any;
  name: string;
  label: string;
  options: Option[];
  className?: string;
  required?: boolean;
  appearance?: "boxed" | "inline";
}

export const ReusableRadioGroup: React.FC<ReusableRadioGroupProps> = ({
  control,
  name,
  label,
  options,
  className = "",
  required = false,
  appearance = "boxed",
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-[var(--ent-text-main,#F4F4F5)]">
        {label}
        {required && <span className="ml-1 text-[#F8B400]">*</span>}
      </Label>

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <SimpleRadio
            name={name}
            value={field.value}
            onChange={field.onChange}
            options={options}
            appearance={appearance}
            aria-label={label}
          />
        )}
      />
    </div>
  );
};
