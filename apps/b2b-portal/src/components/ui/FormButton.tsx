/**
 * FormButton.tsx
 * B2B Portal — reusable submit button with loading state.
 */
"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@travelagency/utils";

interface FormButtonProps {
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

export function FormButton({
  isLoading = false,
  label,
  icon,
  disabled,
  className,
  type = "submit",
}: FormButtonProps) {
  return (
    <button
      type={type}
      disabled={isLoading || disabled}
      className={cn(
        "w-full py-3.5 mt-4",
        "bg-blue-600 hover:bg-blue-500",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "text-white font-bold rounded-xl",
        "flex items-center justify-center gap-2",
        "transition-all duration-200",
        className
      )}
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
