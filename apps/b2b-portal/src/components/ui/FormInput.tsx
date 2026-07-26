/**
 * FormInput.tsx
 * B2B Portal — reusable dark-theme form input.
 * Wraps a raw <input> with icon slot, floating label, and error message.
 * Works with react-hook-form's `register` pattern.
 */
"use client";

import React from "react";
import { cn } from "@travelagency/utils";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface FormInputProps {
  /** react-hook-form register return spread: {...register("field")} */
  registration: UseFormRegisterReturn;
  label: string;
  placeholder?: string;
  type?: string;
  error?: FieldError;
  /** Optional lucide-react icon component */
  icon?: React.ElementType;
  /** Slot rendered to the right of the label (e.g. "Forgot?" link) */
  labelRight?: React.ReactNode;
  className?: string;
  id?: string;
}

export function FormInput({
  registration,
  label,
  placeholder,
  type = "text",
  error,
  icon: Icon,
  labelRight,
  className,
  id,
}: FormInputProps) {
  const inputId = id ?? registration.name;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label row */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="text-xs font-bold text-neutral-400 uppercase tracking-widest"
        >
          {label}
        </label>
        {labelRight}
      </div>

      {/* Input with optional icon */}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" />
        )}
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          {...registration}
          className={cn(
            "w-full bg-neutral-950 border text-white pr-4 py-3 rounded-xl",
            "focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all",
            Icon ? "pl-10" : "pl-4",
            error
              ? "border-red-500/70 focus:ring-red-500/40 focus:border-red-500"
              : "border-neutral-800"
          )}
        />
      </div>

      {/* Inline error */}
      {error && (
        <p className="text-xs text-red-400 font-medium">{error.message}</p>
      )}
    </div>
  );
}
