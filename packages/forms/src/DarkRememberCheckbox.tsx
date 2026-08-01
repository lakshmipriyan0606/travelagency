/**
 * DarkRememberCheckbox.tsx
 * Brand-aligned "Remember me" control for dark login screens.
 * Uses SimpleCheckbox (gold checked fill) so state is never browser-default.
 */
"use client";

import React from "react";
import { SimpleCheckbox } from "@travelagency/ui";
import { cn } from "@travelagency/utils";

interface DarkRememberCheckboxProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  className?: string;
}

export function DarkRememberCheckbox({
  id = "remember",
  checked,
  onCheckedChange,
  label = "Remember me on this device",
  className,
}: DarkRememberCheckboxProps) {
  return (
    <SimpleCheckbox
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      label={label}
      appearance="inline"
      className={cn(className)}
    />
  );
}
