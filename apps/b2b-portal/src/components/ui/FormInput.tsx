/**
 * FormInput.tsx
 * B2B Portal — reusable dark-theme form input.
 * Wraps a raw <input> with icon slot, floating label, and error message.
 * Works with react-hook-form's `register` pattern.
 */
"use client";

import React, { useState } from "react";
import { cn } from "@travelagency/utils";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Label row */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={inputId}
          className="text-[13px] font-medium text-[#A1A1AA]"
        >
          {label}
        </label>
        {labelRight}
      </div>

      {/* Input with optional icon */}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#71717A]" />
        )}
        <input
          id={inputId}
          type={inputType}
          placeholder={placeholder}
          {...registration}
          className={cn(
            "h-11 w-full rounded-xl border bg-[#121212] text-sm text-white outline-none transition-all placeholder-neutral-600",
            "focus:border-[#F8B400]/60 focus:ring-2 focus:ring-[#F8B400]/20",
            Icon ? "pl-10" : "pl-3",
            isPassword ? "pr-11" : "pr-3",
            error
              ? "border-red-500/70 focus:border-red-500 focus:ring-red-500/30"
              : "border-white/[0.1]"
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] transition-colors hover:text-[#F8B400] focus:outline-none focus-visible:text-[#F8B400]"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Inline error */}
      {error && (
        <p className="text-xs text-red-400 font-medium">{error.message}</p>
      )}
    </div>
  );
}
