import { Controller, Control } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
  textColor = "text-zinc-800",
}: SelectFieldProps) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={required ? { required: `${label} is required` } : {}}
      render={({ field, fieldState: { error } }) => {
        if (variant === "floating") {
          return (
            <div className="mb-4 relative group">
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className={cn(
                    "peer w-full h-12 pt-2 pb-1 px-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-yellow-50/1 focus:border-yellow-400 transition-all duration-300 font-body text-sm",
                    textColor,
                    selectedValueClassName,
                    error && "border-red-500 focus:border-red-500/2 focus:ring-red-500"
                  )}
                >
                  <SelectValue placeholder=" " />
                </SelectTrigger>

                {label && (
                  <label
                    className={cn(
                      `absolute left-3 bg-white px-1
                       text-yellow-500
                       pointer-events-none
                       transition-all duration-300 ease-out

                       /* Default resting */
                       top-[39%] -translate-y-1/2 text-[14px] font-medium text-gray-400

                       /* When focused or has value */
                       ${field.value ? "top-0 -translate-y-1/2 text-xs text-yellow-600" : "group-focus-within:top-0 group-focus-within:-translate-y-1/2 group-focus-within:text-xs group-focus-within:text-yellow-600"}
                      `,
                      labelClassName
                    )}
                  >
                    {label}
                    {required && <span className="text-red-500 ml-[2px]">*</span>}
                  </label>
                )}

                <SelectContent className="bg-white border-gray-300 font-body rounded-xl shadow-2xl" side="bottom" sideOffset={4}>
                  {options.map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      className="cursor-pointer text-gray-700 focus:bg-yellow-500 focus:text-black data-[state=checked]:bg-yellow-50 data-[state=checked]:text-yellow-700 font-medium py-2.5"
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {error && (
                <p className="mt-1 text-[9px] font-semibold text-red-500 uppercase tracking-wider px-1">{error.message}</p>
              )}
            </div>
          );
        }

        return (
          <div className="flex flex-col font-body cursor-pointer">
            {label && (
              <label className={cn("text-gray-600 text-[15px] font-semibold mb-[-4px]", labelClassName)}>
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
                  "text-sm data-[placeholder]:text-gray-400 cursor-pointer",
                  textColor,
                  selectedValueClassName,
                  error && "data-[placeholder]:!text-red-500"
                )}
              >
                <SelectValue placeholder={error ? error.message : label || "Select Option"} />
              </SelectTrigger>

              <SelectContent className="bg-white border-gray-300 font-body" side="bottom" sideOffset={4}>
                {options.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="cursor-pointer text-gray-700 focus:bg-yellow-500 focus:text-black data-[state=checked]:bg-yellow-50 data-[state=checked]:text-yellow-700 font-medium py-2.5"
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

