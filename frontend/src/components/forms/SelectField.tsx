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
        <div className="flex flex-col font-body cursor-pointer">
          {label && (
            <label className="text-gray-600 text-[15px] font-semibold mb-[-4px]">
              {label}
              {required && <span className="text-red-500 ml-[2px]">*</span>}
            </label>
          )}

          <Select
            value={field.value}
            onValueChange={field.onChange}
          >
            <SelectTrigger
              className={cn(
                "!border-none !ring-0 !shadow-none bg-transparent p-0 h-auto w-full",
                "focus:!outline-none focus:!ring-0 focus:!border-none",
                "[&_svg]:!hidden transition-all duration-300",
                "text-gray-500 text-sm placeholder:text-gray-400 cursor-pointer",
                error && "text-red-400"
              )}
            >
              <SelectValue placeholder={error ? error.message : label || "Select Option"} />
            </SelectTrigger>

            <SelectContent
              className="bg-white border-gray-300 font-body"
              side="bottom"
              sideOffset={4}
            >
              {options.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="cursor-pointer text-gray-700 focus:bg-yellow-500 focus:text-black data-[state=checked]:bg-yellow-50 data-[state=checked]:text-yellow-700 font-medium"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>


        </div>
      )}
    />
  );
};

