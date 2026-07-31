"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "@travelagency/utils";

export type SimpleCheckboxProps = {
  /** Controlled checked state */
  checked?: boolean | "indeterminate";
  /** Uncontrolled initial state */
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  /** Visible label (wired via htmlFor / wrapping label) */
  label?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  name?: string;
  required?: boolean;
  className?: string;
  /**
   * - `boxed` — gold-border pill chrome (preference / form fields, matches screenshot)
   * - `inline` — bare control + muted label (remember-me, compact rows)
   */
  appearance?: "boxed" | "inline";
  /** Accessible name when no visible label is present */
  "aria-label"?: string;
  "aria-describedby"?: string;
};

const CONTROL_CLASS = [
  "peer size-5 shrink-0 rounded-[6px] border shadow-xs outline-none transition-all duration-150",
  "border-[#F8B400]/55 bg-[#0c0c0f]",
  "hover:border-[#F8B400]/80",
  "focus-visible:border-[#2563EB] focus-visible:ring-[3px] focus-visible:ring-[#2563EB]/35",
  "data-[state=checked]:border-white data-[state=checked]:bg-[#2563EB] data-[state=checked]:text-white",
  "data-[state=indeterminate]:border-white data-[state=indeterminate]:bg-[#2563EB] data-[state=indeterminate]:text-white",
  "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
  "disabled:cursor-not-allowed disabled:opacity-50",
].join(" ");

/**
 * Opinionated checkbox for dark + gold enterprise chrome.
 * Checked control uses bright blue fill + white check (screenshot).
 * Built on Radix Checkbox for keyboard / form accessibility.
 */
function SimpleCheckbox({
  checked,
  defaultChecked,
  onCheckedChange,
  label,
  disabled,
  id,
  name,
  required,
  className,
  appearance = "boxed",
  "aria-label": ariaLabel,
  "aria-describedby": ariaDescribedBy,
}: SimpleCheckboxProps) {
  const autoId = React.useId();
  const inputId = id ?? autoId;
  const isControlled = checked !== undefined;

  const control = (
    <CheckboxPrimitive.Root
      id={inputId}
      name={name}
      required={required}
      disabled={disabled}
      checked={isControlled ? checked : undefined}
      defaultChecked={isControlled ? undefined : defaultChecked}
      onCheckedChange={(value) => onCheckedChange?.(value === true)}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      data-slot="simple-checkbox"
      className={cn(CONTROL_CLASS, appearance === "inline" && "!size-4 rounded-[4px]")}
    >
      <CheckboxPrimitive.Indicator
        data-slot="simple-checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className={cn("stroke-[3]", appearance === "inline" ? "size-3" : "size-3.5")} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  if (!label) {
    return <div className={cn(className)}>{control}</div>;
  }

  if (appearance === "inline") {
    return (
      <div className={cn("flex items-center gap-2.5", className)}>
        {control}
        <label
          htmlFor={inputId}
          className={cn(
            "cursor-pointer select-none text-xs text-[#B4B4B4] transition-colors",
            "hover:text-neutral-300",
            disabled && "pointer-events-none opacity-50"
          )}
        >
          {label}
        </label>
      </div>
    );
  }

  // Sibling label (not wrapping) — Radix Root is a <button>; nesting it in <label> can double-toggle.
  return (
    <div
      className={cn(
        "group flex h-12 w-full items-center gap-3 rounded-xl border pl-3.5 transition-all duration-200",
        "border-[#F8B400]/45 bg-[#171717]",
        "hover:border-[#F8B400]/70",
        "has-[[data-state=checked]]:border-[#F8B400] has-[[data-state=checked]]:bg-[#F8B400]/12",
        "has-[[data-disabled]]:opacity-50",
        className
      )}
    >
      {control}
      <label
        htmlFor={inputId}
        className={cn(
          "flex h-full flex-1 cursor-pointer select-none items-center pr-3.5",
          "text-xs font-semibold leading-none text-[#F8B400]",
          disabled && "pointer-events-none"
        )}
      >
        {label}
      </label>
    </div>
  );
}

export { SimpleCheckbox };
