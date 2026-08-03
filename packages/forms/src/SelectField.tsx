import { Controller, Control } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@travelagency/ui";
import { cn } from "@travelagency/utils";

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  options: Option[];
  required?: boolean;
  labelClassName?: string;
  selectedValueClassName?: string;
  variant?: "classic" | "floating";
  appearance?: "light" | "dark";
  textColor?: string;
}

export const SelectField = ({
  control,
  name,
  label,
  options,
  required = false,
  labelClassName,
  selectedValueClassName,
  variant = "classic",
  appearance,
  textColor,
}: SelectFieldProps) => {
  const isDark = (appearance ?? (variant === "floating" ? "dark" : "light")) === "dark";
  const resolvedTextColor = textColor ?? (isDark ? "text-zinc-100" : "text-zinc-800");

  return (
    <Controller
      control={control}
      name={name}
      rules={required ? { required: `${label} is required` } : {}}
      render={({ field, fieldState: { error } }) => {
        if (variant === "floating") {
          const floated = Boolean(field.value);
          return (
            <div className="relative group w-full">
              <Select value={field.value} onValueChange={field.onChange}>
                <div className="relative w-full">
                  <SelectTrigger
                    className={cn(
                      "peer !h-[52px] !min-h-[52px] w-full pt-4 pb-1 px-3.5 rounded-xl transition-all duration-200 font-body text-[15px]",
                      isDark
                        ? "border border-white/[0.12] bg-[var(--ent-surface,#101014)] hover:border-[#F8B400]/40 focus:outline-none focus:ring-[3px] focus:ring-[#F8B400]/22 focus:border-[#F8B400] data-[state=open]:border-[#F8B400] data-[state=open]:ring-[3px] data-[state=open]:ring-[#F8B400]/22"
                        : "border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:border-yellow-400",
                      resolvedTextColor,
                      selectedValueClassName,
                      error && (isDark
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                        : "border-red-500 focus:border-red-500 focus:ring-red-500")
                    )}
                  >
                    <SelectValue placeholder=" " />
                  </SelectTrigger>

                  {label && (
                    <label
                      className={cn(
                        "absolute left-3.5 pointer-events-none z-[1] font-medium transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] origin-left",
                        floated
                          ? cn(
                              "top-1.5 translate-y-0 text-[11px] tracking-wide",
                              isDark ? "text-[#F8B400]" : "text-yellow-600"
                            )
                          : cn(
                              "top-1/2 -translate-y-1/2 text-[14px]",
                              isDark ? "text-zinc-400" : "text-gray-400",
                              "peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-[11px] peer-focus:tracking-wide",
                              "peer-data-[state=open]:top-1.5 peer-data-[state=open]:translate-y-0 peer-data-[state=open]:text-[11px] peer-data-[state=open]:tracking-wide",
                              isDark
                                ? "peer-focus:text-[#F8B400] peer-data-[state=open]:text-[#F8B400]"
                                : "peer-focus:text-yellow-600 peer-data-[state=open]:text-yellow-600"
                            ),
                        labelClassName
                      )}
                    >
                      {label}
                      {required && <span className="text-red-500 ml-[2px]">*</span>}
                    </label>
                  )}
                </div>

                <SelectContent
                  className={cn(
                    "font-body",
                    isDark
                      ? "border-[#F8B400]/35"
                      : "ent-select-light bg-white border-gray-300 text-gray-800"
                  )}
                  {...(!isDark ? { "data-light": "true" as const } : {})}
                  position="popper"
                  side="bottom"
                  sideOffset={6}
                  align="start"
                  collisionPadding={12}
                >
                  {options.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="cursor-pointer font-medium data-[state=checked]:!bg-[#F8B400] data-[state=checked]:!text-black data-[state=checked]:!font-bold data-[highlighted]:!bg-[#F8B400] data-[highlighted]:!text-black data-[highlighted]:!font-bold"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {error && (
                <p className="mt-1.5 text-[10px] font-semibold text-red-400 uppercase tracking-wider px-1">
                  {error.message}
                </p>
              )}
            </div>
          );
        }

        return (
          <div className="flex flex-col font-body cursor-pointer">
            {label && (
              <label
                className={cn(
                  "text-[15px] font-semibold mb-1",
                  isDark ? "text-zinc-300" : "text-gray-600",
                  labelClassName
                )}
              >
                {label}
                {required && <span className="text-red-500 ml-[2px]">*</span>}
              </label>
            )}

            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                className={cn(
                  "!border-none !ring-0 !shadow-none bg-transparent p-0 h-auto w-full",
                  "focus:!outline-none focus:!ring-0 focus:!border-none",
                  "[&_svg]:!hidden transition-all duration-300",
                  "text-sm data-[placeholder]:text-zinc-500 cursor-pointer",
                  resolvedTextColor,
                  selectedValueClassName,
                  error && "data-[placeholder]:!text-red-400"
                )}
              >
                <SelectValue placeholder={error ? error.message : label || "Select Option"} />
              </SelectTrigger>

              <SelectContent
                className={cn(
                  "font-body",
                  isDark
                    ? "border-[#F8B400]/35"
                    : "ent-select-light bg-white border-gray-300"
                )}
                {...(!isDark ? { "data-light": "true" as const } : {})}
                position="popper"
                side="bottom"
                sideOffset={6}
                align="start"
                collisionPadding={12}
              >
                {options.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="cursor-pointer font-medium data-[state=checked]:!bg-[#F8B400] data-[state=checked]:!text-black data-[state=checked]:!font-bold data-[highlighted]:!bg-[#F8B400] data-[highlighted]:!text-black data-[highlighted]:!font-bold"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      }}
    />
  );
};
