/**
 * DarkFormInput.tsx
 * Shared dark-theme form input for all apps (B2C admin, B2B admin, B2B portal).
 * Wraps a raw <input> with icon slot, label row, password eye toggle, and error message.
 * Works with react-hook-form's `register` pattern.
 */
"use client";

import React, { useState } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

interface DarkFormInputProps {
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

export function DarkFormInput({
  registration,
  label,
  placeholder,
  type = "text",
  error,
  icon: Icon,
  labelRight,
  className,
  id,
}: DarkFormInputProps) {
  const inputId = id ?? registration.name;
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`space-y-2 ${className ?? ""}`}>
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
          type={inputType}
          placeholder={placeholder}
          {...registration}
          className={[
            "w-full bg-neutral-950 border text-white py-3 rounded-xl",
            "focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 outline-none transition-all",
            Icon ? "pl-10" : "pl-4",
            isPassword ? "pr-10" : "pr-4",
            error
              ? "border-red-500/70 focus:ring-red-500/40 focus:border-red-500"
              : "border-neutral-800",
          ].join(" ")}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 focus:outline-none"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
