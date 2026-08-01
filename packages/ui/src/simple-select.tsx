"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { cn } from "@travelagency/utils";

export type SimpleSelectOption = {
  value: string;
  label: string;
};

export type SimpleSelectProps = {
  /** Controlled value */
  value?: string;
  /** Uncontrolled initial value */
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: SimpleSelectOption[];
  /** Shown when no value is selected (Radix placeholder) */
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  /** Accessible name when no visible label is present */
  "aria-label"?: string;
  /**
   * Menu highlight color.
   * - `gold` — brand primary (default; B2B filters / forms)
   * - `blue` — legacy bright selection highlight (opt-in only)
   */
  highlight?: "blue" | "gold";
  size?: "sm" | "default";
};

const ITEM_HIGHLIGHT: Record<NonNullable<SimpleSelectProps["highlight"]>, string> = {
  gold: [
    "data-[highlighted]:!bg-[#F8B400] data-[highlighted]:!text-black data-[highlighted]:!font-bold",
    "data-[state=checked]:!bg-[#F8B400]/18 data-[state=checked]:!text-[#F8B400]",
    "data-[state=checked]:data-[highlighted]:!bg-[#F8B400] data-[state=checked]:data-[highlighted]:!text-black",
  ].join(" "),
  blue: [
    "data-[highlighted]:!bg-[#2563EB] data-[highlighted]:!text-white data-[highlighted]:!font-semibold",
    "data-[state=checked]:!bg-[#2563EB]/20 data-[state=checked]:!text-[#93C5FD]",
    "data-[state=checked]:data-[highlighted]:!bg-[#2563EB] data-[state=checked]:data-[highlighted]:!text-white",
  ].join(" "),
};

/**
 * Opinionated single-value select for filters and list chrome.
 * Built on Radix Select (keyboard, focus trap, click-outside) with dark + gold trigger styling.
 */
function SimpleSelect({
  value,
  defaultValue,
  onChange,
  options,
  placeholder = "Select…",
  disabled,
  id,
  name,
  className,
  triggerClassName,
  contentClassName,
  "aria-label": ariaLabel,
  highlight = "gold",
  size = "default",
}: SimpleSelectProps) {
  const isControlled = value !== undefined;

  return (
    <Select
      value={isControlled ? value : undefined}
      defaultValue={isControlled ? undefined : defaultValue}
      onValueChange={onChange}
      disabled={disabled}
      name={name}
    >
      <SelectTrigger
        id={id}
        size={size}
        aria-label={ariaLabel}
        className={cn(
          "min-w-[9.5rem] border-[#F8B400]/45 bg-[#171717] hover:border-[#F8B400]/70",
          "data-[state=open]:border-[#F8B400] data-[state=open]:ring-[#F8B400]/25",
          className,
          triggerClassName
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        side="bottom"
        sideOffset={6}
        align="start"
        collisionPadding={12}
        className={cn(
          "border-white/[0.12] bg-[#16161b] shadow-[0_16px_40px_rgba(0,0,0,0.55)]",
          contentClassName
        )}
      >
        {options.map((opt) => (
          <SelectItem
            key={opt.value}
            value={opt.value}
            className={cn("cursor-pointer font-medium", ITEM_HIGHLIGHT[highlight])}
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export { SimpleSelect };
