// components/form/ReusableInput.tsx
"use client";

import { Controller, Control } from "react-hook-form";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

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
}: ReusableInputProps) => {
  return (
    <Controller
      control={control}
      name={name}
      // rules={required ? { required: `${label || name} is required` } : {}}
      render={({ field, fieldState: { error } }) => {
        return (
          <div className={cn("mb-6 relative", mainContainerClassName)}>
            <Input
              {...field}
              type={type}
              placeholder={placeholder ?? ''}
              className={cn(
                `peer w-full pt-6 pb-2 px-3
               border border-gray-300 rounded-md
               bg-white
               focus:outline-none focus:ring-1 focus:ring-blue-50/1
               focus:border-blue-500
               transition-all duration-300 font-roboto`,
                inputClassName,
                error &&
                "border-red-500 focus:border-red-500/2 focus:ring-red-500"
              )}
            />

            {label && (
              <label
                className={cn(
                  `absolute left-3 bg-white px-1
                 text-blue-500
                 pointer-events-none
                 transition-all duration-300 ease-out

                 /* Default resting */
                 top-[38%] -translate-y-1/2 text-[15px] text-gray-500

                 /* When focused */
                 peer-focus:top-0
                 peer-focus:-translate-y-1/2
                 peer-focus:text-xs
                 peer-focus:text-blue-600

                 /* When input has value */
                 peer-[&:not(:placeholder-shown)]:top-0
                 peer-[&:not(:placeholder-shown)]:-translate-y-1/2
                 peer-[&:not(:placeholder-shown)]:text-xs
                 peer-[&:not(:placeholder-shown)]:text-blue-600
                `,
                  labelClassName
                )}
              >
                {label}
                {required && <span className="text-red-500 ml-[2px]">*</span>}
              </label>
            )}

            {error && (
              <p className="mt-1 text-xs text-red-500">{error.message}</p>
            )}
          </div>
        )
      }

      }
    />
  );
};
