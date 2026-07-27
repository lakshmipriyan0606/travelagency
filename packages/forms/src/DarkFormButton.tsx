/**
 * DarkFormButton.tsx
 * Shared dark-theme submit button for all apps (B2C admin, B2B admin, B2B portal).
 * Shows a primary-colored button with loading spinner.
 */
"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface DarkFormButtonProps {
  /** Loading state — shows spinner and disables button */
  isLoading?: boolean;
  /** Label shown when not loading */
  label: string;
  /** Icon rendered to the right of the label (e.g. <ArrowRight />) */
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  type?: "submit" | "button" | "reset";
}

export function DarkFormButton({
  isLoading = false,
  label,
  icon,
  disabled,
  className,
  type = "submit",
}: DarkFormButtonProps) {
  return (
    <button
      type={type}
      disabled={isLoading || disabled}
      style={{ backgroundColor: "var(--color-primary, #fcaf16)" }}
      className={[
        "w-full py-4 text-lg",
        "hover:brightness-110",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "text-neutral-950 font-bold rounded-xl",
        "flex items-center justify-center gap-2",
        "transition-all duration-200",
        className ?? "",
      ].join(" ")}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <>
          {label}
          {icon}
        </>
      )}
    </button>
  );
}
