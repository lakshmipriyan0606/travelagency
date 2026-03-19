// components/forms/ReusableTextArea.tsx
"use client";

import { Controller, Control } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";
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
}: ReusableTextAreaProps) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        if (variant === "floating") {
          return (
            <div className={cn("mb-4 relative", mainContainerClassName, className)}>
              <Textarea
                {...field}
                placeholder={placeholder || " "}
                className={cn(
                  `peer w-full pt-5 pb-1 px-3 min-h-[120px]
                   border border-gray-200 rounded-lg
                   bg-white
                   focus:outline-none focus:ring-1 focus:ring-yellow-50/1
                   focus:border-yellow-400
                   transition-all duration-300 font-body`,
                  textareaClassName,
                  error && "border-red-500 focus:border-red-500/2 focus:ring-red-500"
                )}
                {...textareaProps}
              />

              {label && (
                <label
                  className={cn(
                    `absolute left-3 bg-white px-1
                     text-yellow-500
                     pointer-events-none
                     transition-all duration-300 ease-out

                     /* Default resting */
                     top-[15%] -translate-y-1/2 text-[14px] text-gray-400 font-medium

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

            <Textarea
              {...field}
              placeholder={error ? error.message : placeholder ?? ""}
              className={cn(
                "!border-none !ring-0 !shadow-none bg-transparent p-0 min-h-[80px] w-full",
                "focus:!outline-none focus:!ring-0 focus:!border-none",
                "transition-all duration-300 font-body text-gray-500 text-sm",
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
