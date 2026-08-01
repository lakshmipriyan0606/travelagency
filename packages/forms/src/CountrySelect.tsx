"use client";

import { useMemo } from "react";
import { SimpleSelect } from "@travelagency/ui";
import { getCountryOptions } from "./countryOptions";

export interface CountrySelectProps {
  value?: string;
  defaultValue?: string;
  onChange?: (code: string) => void;
  placeholder?: string;
  disabled?: boolean;
  "aria-label"?: string;
  className?: string;
  size?: "sm" | "default";
  highlight?: "blue" | "gold";
}

/** Nationality / country picker powered by i18n-iso-countries (no hardcoded list). */
export function CountrySelect({
  value,
  defaultValue,
  onChange,
  placeholder = "Select country",
  disabled,
  "aria-label": ariaLabel = "Country / nationality",
  className,
  size = "default",
  highlight = "gold",
}: CountrySelectProps) {
  const options = useMemo(() => getCountryOptions(), []);

  return (
    <SimpleSelect
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      disabled={disabled}
      aria-label={ariaLabel}
      className={className}
      size={size}
      highlight={highlight}
    />
  );
}
