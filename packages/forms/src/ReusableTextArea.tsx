// components/forms/ReusableTextArea.tsx
"use client";

import { Controller, Control } from "react-hook-form";
import { Textarea } from "@travelagency/ui";
import { cn } from "@travelagency/utils";
import React from "react";

interface ReusableTextAreaProps {
  control: Control<any>;
  name: string;
  label?: React.ReactNode;
  required?: boolean;
  labelClassName?: string;
  textareaClassName?: string;
  mainContainerClassName?: string;
  placeholder?: string;
  className?: string;
  textareaProps?: React.TextareaHTMLAttributes<HTMLTextAreaElement>;
  variant?: "classic" | "floating";
  appearance?: "light" | "dark";
  maxLength?: number;
}

export const ReusableTextArea = ({
  control,
  name,
  label,
  required = false,
  labelClassName,
  textareaClassName,
  mainContainerClassName,
  placeholder,
  className,
  textareaProps,
  variant = "classic",
  appearance,
  maxLength,
}: ReusableTextAreaProps) => {
  const isDark = (appearance ?? (variant === "floating" ? "dark" : "light")) === "dark";

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        if (variant === "floating") {
          return (
            <div className={cn("relative group w-full", mainContainerClassName, className)}>
              <Textarea
                {...field}
                placeholder=" "
                maxLength={maxLength}
                className={cn(
                  "peer w-full pt-6 pb-2 px-3.5 min-h-[108px] resize-none rounded-xl transition-all duration-200 font-body text-[15px]",
                  isDark
                    ? "border border-white/[0.12] bg-[var(--ent-surface,#101014)] text-white placeholder:text-transparent hover:border-white/[0.18] focus:outline-none focus:ring-[3px] focus:ring-[#F8B400]/22 focus:border-[#F8B400] focus:shadow-[0_0_18px_rgba(248,180,0,0.12)]"
                    : "border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-yellow-50/1 focus:border-yellow-400",
                  textareaClassName,
                  error && (isDark
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                    : "border-red-500 focus:border-red-500/2 focus:ring-red-500")
                )}
                {...textareaProps}
              />

              {label && (
                <label
                  className={cn(
                    "absolute left-3.5 top-4 pointer-events-none transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] z-[1] text-[14px] font-medium",
                    isDark
                      ? "text-zinc-400 peer-focus:top-1.5 peer-focus:text-[11px] peer-focus:tracking-wide peer-focus:text-[#F8B400] peer-[&:not(:placeholder-shown)]:top-1.5 peer-[&:not(:placeholder-shown)]:text-[11px] peer-[&:not(:placeholder-shown)]:tracking-wide peer-[&:not(:placeholder-shown)]:text-[#F8B400]"
                      : "text-gray-400 peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-yellow-600 peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-yellow-600",
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

            <Textarea
              {...field}
              placeholder={error ? error.message : placeholder ?? ""}
              className={cn(
                "!border-none !ring-0 !shadow-none bg-transparent p-0 min-h-[80px] w-full",
                "focus:!outline-none focus:!ring-0 focus:!border-none",
                "transition-all duration-300 font-body text-sm",
                isDark ? "text-zinc-200" : "text-gray-500",
                textareaClassName,
                error && "text-red-400"
              )}
              {...textareaProps}
            />
          </div>
        );
      }}
    />
  );
};
