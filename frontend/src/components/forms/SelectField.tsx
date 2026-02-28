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
}

export const SelectField = ({
  control,
  name,
  label,
  options,
  required = false,
}: SelectFieldProps) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={required ? { required: `${label} is required` } : {}}
      render={({ field, fieldState: { error } }) => (
        <div className="mb-6 relative font-body">
          <Select
            value={field.value}
            onValueChange={field.onChange}
          >
            <SelectTrigger
              className={cn(
                `peer w-full pt-6 pb-2 px-3
                border border-gray-300 rounded-md
                bg-white
                focus:outline-none focus:ring-1 focus:ring-blue-50/1
                focus:border-blue-500
                transition-all duration-300`,
                error && "border-red-500 focus:border-red-500/2 focus:ring-red-500"
              )}
            >
              <SelectValue placeholder=" " />
            </SelectTrigger>

            <SelectContent className="bg-white border-gray-300 font-body">
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="cursor-pointer text-gray-700">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {label && (
            <label
              className={cn(
                `absolute left-3 bg-white px-1
                 pointer-events-none
                 transition-all duration-300 ease-out

                 /* Default resting */
                 top-1/2 -translate-y-1/2 text-[15px] text-gray-500

                 /* When focused */
                 peer-focus:top-0
                 peer-focus:-translate-y-1/2
                 peer-focus:text-xs
                 peer-focus:text-blue-600

                 /* When select has value */
                 peer-data-[state=open]:top-0
                 peer-data-[state=open]:-translate-y-1/2
                 peer-data-[state=open]:text-xs
                 peer-data-[state=open]:text-blue-600`,
                field.value && `top-0 -translate-y-1/2 text-xs text-blue-600`
              )}
            >
              {label}
              {required && <span className="text-red-500 ml-[2px]">*</span>}
            </label>
          )}

          {error && (
            <p className="mt-1 text-xs text-red-500">
              {error.message}
            </p>
          )}
        </div>
      )}
    />
  );
};

