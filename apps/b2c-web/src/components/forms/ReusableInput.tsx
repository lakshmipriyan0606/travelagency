// components/form/ReusableInput.tsx
"use client";

import { Controller, Control } from "react-hook-form";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
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
  icon: Icon,
}: ReusableInputProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        if (variant === "floating") {
          return (
            <div className={cn("mb-4 relative", mainContainerClassName, className)}>
              <Input
                {...field}
                type={type}
                className={cn(
                  `peer w-full pt-5 pb-1 px-3 h-12
                   border border-gray-200 rounded-lg
                   bg-white
                   focus:outline-none focus:ring-1 focus:ring-yellow-50/1
                   focus:border-yellow-400
                   transition-all duration-300 font-body`,
                  Icon && "pr-10",
                  inputClassName,
                  error && "border-red-500 focus:border-red-500/2 focus:ring-red-500"
                )}
                {...inputProps}
              />

              {Icon && (
                <div className="absolute right-3 top-[41%] -translate-y-1/2 text-gray-400">
                  <Icon size={18} />
                </div>
              )}

              {label && (
                <label
                  className={cn(
                    `absolute left-3 bg-white px-1
                     text-yellow-500
                     pointer-events-none
                     transition-all duration-300 ease-out

                     /* Default resting */
                     top-[41%] -translate-y-1/2 text-[14px] text-gray-400 font-medium

                     /* When focused */
                     peer-focus:top-0
                     peer-focus:-translate-y-1/2
                     peer-focus:text-xs
                     peer-focus:text-yellow-600

                     /* When input has value */
                     peer-[&:not(:placeholder-shown)]:top-0
                     peer-[&:not(:placeholder-shown)]:-translate-y-1/2
                     peer-[&:not(:placeholder-shown)]:text-xs
                     peer-[&:not(:placeholder-shown)]:text-yellow-600
                    `,
                    labelClassName
                  )}
                >
                  {label}
                  {required && <span className="text-red-500 ml-[2px]">*</span>}
                </label>
              )}

              {error && (
                <p className="mt-1 text-[9px] font-semibold text-red-500 uppercase tracking-wider px-1">{error.message}</p>
              )}
            </div>
          );
        }

        // Classic Variant
        return (
          <div className={cn("flex flex-col font-body", mainContainerClassName, className)}>
            {label && (
              <label className={cn("text-gray-600 text-[15px] font-semibold mb-[-4px]", labelClassName)}>
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
                error ? "!text-red-500 placeholder:!text-red-500" : "text-gray-500 placeholder:text-gray-400"
              )}
              {...inputProps}
            />
          </div>
        );
      }}
    />
  );
};
