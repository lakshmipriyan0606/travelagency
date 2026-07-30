// components/form/ReusableInput.tsx
"use client";

import { Controller, Control } from "react-hook-form";
import { Input } from "@travelagency/ui";
import { cn } from "@travelagency/utils";
import React from "react";

interface ReusableInputProps {
  control: Control<any>;
  name: string;
  label?: React.ReactNode;
  type?: string;
  required?: boolean;
  labelClassName?: string;
  inputClassName?: string;
  mainContainerClassName?: string;
  placeholder?: string;
  className?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  variant?: "classic" | "floating";
  /** floating defaults to dark (admin portal); use light for marketing surfaces */
  appearance?: "light" | "dark";
  icon?: React.ElementType;
}

export const ReusableInput = ({
  control,
  name,
  label,
  type = "text",
  required = false,
  labelClassName,
  inputClassName,
  mainContainerClassName,
  placeholder,
  className,
  inputProps,
  variant = "classic",
  appearance,
  icon: Icon,
}: ReusableInputProps) => {
  // Floating fields are admin-portal oriented; classic remains light for marketing forms.
  const isDark = (appearance ?? (variant === "floating" ? "dark" : "light")) === "dark";

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        if (variant === "floating") {
          return (
            <div className={cn("relative group w-full", mainContainerClassName, className)}>
              <Input
                {...field}
                type={type}
                placeholder=" "
                className={cn(
                  "peer w-full !h-[52px] !min-h-[52px] pt-5 pb-1.5 px-3.5 rounded-xl transition-all duration-200 font-body text-[15px]",
                  isDark
                    ? "border border-white/[0.12] bg-[var(--ent-surface,#101014)] text-white placeholder:text-transparent hover:border-white/[0.18] focus:outline-none focus:ring-[3px] focus:ring-[#F8B400]/22 focus:border-[#F8B400] focus:shadow-[0_0_18px_rgba(248,180,0,0.12)]"
                    : "border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-yellow-50/1 focus:border-yellow-400",
                  Icon && "pr-10",
                  inputClassName,
                  error && (isDark
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-red-500 focus:border-red-500/2 focus:ring-red-500")
                )}
                {...inputProps}
              />

              {Icon && (
                <div className={cn(
                  "absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200",
                  isDark ? "text-zinc-500 group-focus-within:text-[#F8B400]" : "text-gray-400"
                )}>
                  <Icon size={18} />
                </div>
              )}

              {label && (
                <label
                  className={cn(
                    "absolute left-3.5 pointer-events-none transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] z-[1] font-medium",
                    "top-1/2 -translate-y-1/2 text-[14px] origin-left",
                    isDark
                      ? "text-zinc-400 peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:tracking-wide peer-focus:text-[#F8B400] peer-[&:not(:placeholder-shown)]:top-1.5 peer-[&:not(:placeholder-shown)]:translate-y-0 peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:tracking-wide peer-[&:not(:placeholder-shown)]:text-[#F8B400]"
                      : "text-gray-400 peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-yellow-600 peer-[&:not(:placeholder-shown)]:top-1.5 peer-[&:not(:placeholder-shown)]:translate-y-0 peer-[&:not(:placeholder-shown)]:text-xs peer-[&:not(:placeholder-shown)]:text-yellow-600",
                    labelClassName
                  )}
                >
                  {label}
                  {required && <span className="text-red-500 ml-[2px]">*</span>}
                </label>
              )}

              {error && (
                <p className="mt-1.5 text-[10px] font-semibold text-red-400 uppercase tracking-wider px-1">{error.message}</p>
              )}
            </div>
          );
        }

        // Classic Variant
        return (
          <div className={cn("flex flex-col font-body", mainContainerClassName, className)}>
            {label && (
              <label className={cn(
                "text-[15px] font-semibold mb-[-4px]",
                isDark ? "text-zinc-300" : "text-gray-600",
                labelClassName
              )}>
                {label}
                {required && <span className="text-red-500 ml-[2px]">*</span>}
              </label>
            )}

            <Input
              {...field}
              type={type}
              placeholder={error ? error.message : placeholder ?? ""}
              className={cn(
                "!border-none !ring-0 !shadow-none bg-transparent p-0 h-auto w-full",
                "focus:!outline-none focus:!ring-0 focus:!border-none",
                "transition-all duration-300 font-body text-sm",
                inputClassName,
                error
                  ? "!text-red-400 placeholder:!text-red-400"
                  : isDark
                    ? "text-zinc-200 placeholder:text-zinc-500"
                    : "text-gray-500 placeholder:text-gray-400"
              )}
              {...inputProps}
            />
          </div>
        );
      }}
    />
  );
};
