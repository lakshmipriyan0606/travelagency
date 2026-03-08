// components/form/ReusableInput.tsx
"use client";

import { Controller, Control } from "react-hook-form";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import React from "react";

interface ReusableInputProps {
  control: Control<any>;
  name: string;
  label?: string;
  type?: string;
  required?: boolean;
  labelClassName?: string;
  inputClassName?: string;
  mainContainerClassName?: string;
  placeholder?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
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
  inputProps,
}: ReusableInputProps) => {
  return (
    <Controller
      control={control}
      name={name}
      // rules={required ? { required: `${label || name} is required` } : {}}
      render={({ field, fieldState: { error } }) => {
        return (
          <div className={cn("flex flex-col font-body", mainContainerClassName)}>
            {label && (
              <label className={cn("text-gray-600 text-[15px] font-semibold mb-[-4px]", labelClassName)}>
                {label}
                {required && <span className="text-red-500 ml-[2px]">*</span>}
              </label>
            )}

            <Input
              {...field}
              type={type}
              placeholder={placeholder ?? ''}
              className={cn(
                "!border-none !ring-0 !shadow-none bg-transparent p-0 h-auto w-full",
                "focus:!outline-none focus:!ring-0 focus:!border-none",
                "transition-all duration-300 font-body text-gray-500 text-sm",
                inputClassName,
                error && "text-red-400"
              )}
              {...inputProps}
            />
          </div>
        )
      }

      }
    />
  );
};
