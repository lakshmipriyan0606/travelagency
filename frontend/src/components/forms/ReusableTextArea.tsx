// components/form/ReusableInput.tsx
"use client";

import { Controller, Control } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils";

interface ReusableTextAreaProps {
    control: Control<any>;
    name: string;
    label?: string;
    required?: boolean;
    labelClassName?: string;
    inputClassName?: string;
    mainContainerClassName?: string;
    placeholder?: string;
    variant?: "classic" | "floating";
}

export const ReusableTextArea = ({
    control,
    name,
    label,
    required = false,
    labelClassName,
    inputClassName,
    mainContainerClassName,
    placeholder,
    variant = "classic",
    ...rest
}: ReusableTextAreaProps) => {
    return (
        <Controller
            control={control}
            name={name}
            rules={required ? { required: `${label || name} is required` } : {}}
            render={({ field, fieldState: { error } }) => {
                if (variant === "floating") {
                    return (
                        <div className={cn("mb-4 relative", mainContainerClassName)}>
                            <Textarea
                                {...field}
                                placeholder={placeholder || " "}
                                className={cn(
                                    `peer w-full pt-6 pb-2 px-3 min-h-[100px]
                       border border-gray-200 rounded-lg
                       bg-white
                       focus:outline-none focus:ring-1 focus:ring-yellow-50/1
                       focus:border-yellow-400
                       transition-all duration-300 font-body`,
                                    inputClassName,
                                    error &&
                                    "border-red-500 focus:border-red-500/2 focus:ring-red-500"
                                )}
                                {...rest}
                            />

                            {label && (
                                <label
                                    className={cn(
                                        `absolute left-3 bg-white px-1
                         text-yellow-500
                         pointer-events-none
                         transition-all duration-300 ease-out

                         /* Default resting */
                         top-[18px] text-[14px] text-gray-400 font-medium

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

                return (
                    <div className={cn("mb-6 relative", mainContainerClassName)}>
                        {label && (
                            <label className={cn("text-gray-600 text-[15px] font-semibold mb-1 block", labelClassName)}>
                                {label}
                                {required && <span className="text-red-500 ml-[2px]">*</span>}
                            </label>
                        )}
                        <Textarea
                            {...field}
                            placeholder={placeholder}
                            className={cn(
                                "border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500 min-h-[100px]",
                                inputClassName,
                                error && "border-red-500"
                            )}
                            {...rest}
                        />
                        {error && (
                            <p className="mt-1 text-xs text-red-500">{error.message}</p>
                        )}
                    </div>
                );
            }}
        />
    );
};
