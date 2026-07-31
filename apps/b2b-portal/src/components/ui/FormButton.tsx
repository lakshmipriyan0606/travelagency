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
        "w-full py-4 mt-2",
        "rounded-full bg-gradient-to-r from-[#FFD54A] to-[#F8B400]",
        "hover:from-[#FFE066] hover:to-[#FFC425] hover:-translate-y-0.5",
        "shadow-[0_4px_20px_rgba(248,180,0,0.25)] hover:shadow-[0_8px_32px_rgba(248,180,0,0.45)]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0",
        "text-black font-extrabold text-xs uppercase tracking-wider",
        "flex items-center justify-center gap-2 cursor-pointer",
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
