"use client";

import React from "react";
import { Controller } from "react-hook-form";
import { SimpleCheckbox } from "@travelagency/ui";
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
          <SimpleCheckbox
            id={name}
            name={name}
            checked={checked}
            onCheckedChange={field.onChange}
            label={
              description ? (
                <span className="flex w-full items-center gap-3">
                  <span>{label}</span>
                  <span className="ml-auto max-w-[45%] truncate text-xs font-normal text-zinc-400">
                    {description}
                  </span>
                </span>
              ) : (
                label
              )
            }
            appearance="boxed"
            className={cn("!h-[52px] !min-h-[52px]", className)}
          />
        );
      }}
    />
  );
};
