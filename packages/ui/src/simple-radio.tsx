"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import { cn } from "@travelagency/utils";

export type SimpleRadioOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SimpleRadioProps = {
  /** Controlled value */
  value?: string;
  /** Uncontrolled initial value */
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: SimpleRadioOption[];
  disabled?: boolean;
  name?: string;
  id?: string;
  required?: boolean;
  className?: string;
  /**
   * - `boxed` — gold-border pill per option (matches SimpleCheckbox / SimpleSelect chrome)
   * - `inline` — circular control + muted label row
   */
  appearance?: "boxed" | "inline";
  orientation?: "vertical" | "horizontal";
  /** Accessible name for the group */
  "aria-label"?: string;
  "aria-labelledby"?: string;
};

const ITEM_CLASS = [
  "aspect-square size-5 shrink-0 rounded-full border shadow-xs outline-none transition-all duration-150",
  "border-[#F8B400]/55 bg-[#0c0c0f]",
  "hover:border-[#F8B400]/80",
  "focus-visible:border-[#F8B400] focus-visible:ring-[3px] focus-visible:ring-[#F8B400]/30",
  "data-[state=checked]:border-[#F8B400] data-[state=checked]:bg-[#F8B400]",
  "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
  "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

/**
 * Opinionated single-select radio group for dark + gold enterprise chrome.
 * Selected control uses brand gold fill + dark inner indicator (matches SimpleCheckbox).
 * Options-API facade over Radix Radio Group.
 */
function SimpleRadio({
  value,
  defaultValue,
  onChange,
  options,
  disabled,
  name,
  id,
  required,
  className,
  appearance = "boxed",
  orientation = "vertical",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
}: SimpleRadioProps) {
  const autoId = React.useId();
  const groupId = id ?? autoId;
  const isControlled = value !== undefined;

  return (
    <RadioGroupPrimitive.Root
      id={groupId}
      name={name}
      required={required}
      disabled={disabled}
      value={isControlled ? value : undefined}
      defaultValue={isControlled ? undefined : defaultValue}
      onValueChange={onChange}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      data-slot="simple-radio"
      className={cn(
        "grid gap-2.5",
        orientation === "horizontal" && "grid-flow-col auto-cols-fr",
        className
      )}
    >
      {options.map((opt) => {
        const itemId = `${groupId}-${opt.value}`;
        const itemDisabled = disabled || opt.disabled;

        const item = (
          <RadioGroupPrimitive.Item
            id={itemId}
            value={opt.value}
            disabled={itemDisabled}
            data-slot="simple-radio-item"
            className={cn(ITEM_CLASS, appearance === "inline" && "!size-4")}
          >
            <RadioGroupPrimitive.Indicator
              data-slot="simple-radio-indicator"
              className="relative flex items-center justify-center"
            >
              <span
                className={cn(
                  "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0c0c0f]",
                  appearance === "inline" ? "size-1.5" : "size-2"
                )}
              />
            </RadioGroupPrimitive.Indicator>
          </RadioGroupPrimitive.Item>
        );

        if (appearance === "inline") {
          return (
            <div key={opt.value} className="flex items-center gap-2.5">
              {item}
              <label
                htmlFor={itemId}
                className={cn(
                  "cursor-pointer select-none text-xs text-[#B4B4B4] transition-colors",
                  "hover:text-neutral-300",
                  itemDisabled && "pointer-events-none opacity-50"
                )}
              >
                {opt.label}
              </label>
            </div>
          );
        }

        // Sibling label — Radix Item is a <button>; nesting in <label> can double-select.
        return (
          <div
            key={opt.value}
            className={cn(
              "group flex h-12 w-full items-center gap-3 rounded-xl border pl-3.5 transition-all duration-200",
              "border-[#F8B400]/45 bg-[#171717]",
              "hover:border-[#F8B400]/70",
              "has-[[data-state=checked]]:border-[#F8B400] has-[[data-state=checked]]:bg-[#F8B400]/12",
              "has-[[data-disabled]]:opacity-50",
              itemDisabled && "opacity-50"
            )}
          >
            {item}
            <label
              htmlFor={itemId}
              className={cn(
                "flex h-full flex-1 cursor-pointer select-none items-center pr-3.5",
                "text-xs font-semibold leading-none text-[#F8B400]",
                itemDisabled && "pointer-events-none"
              )}
            >
              {opt.label}
            </label>
          </div>
        );
      })}
    </RadioGroupPrimitive.Root>
  );
}

export { SimpleRadio };
