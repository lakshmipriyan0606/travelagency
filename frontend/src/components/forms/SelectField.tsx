import { Controller, Control } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  options: Option[];
  placeholder?: string;
  required?: boolean;
}

export const SelectField = ({
  control,
  name,
  label,
  options,
  placeholder = "Select",
  required = false,
}: SelectFieldProps) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={required ? { required: `${label} is required` } : {}}
      render={({ field, fieldState: { error } }) => (
        <div className="mb-4 font-roboto">
          <label className="text-sm  text-gray-500 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>

          <Select
            value={field.value}
            onValueChange={field.onChange}
          >
            <SelectTrigger
              className={`w-full ${
                error ? "border-red-500" : "border-gray-300"
              }`}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>

            <SelectContent className="bg-white border-gray-300 font-roboto">
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="cursor-pointer text-gray-700">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {error && (
            <p className="text-red-500 text-xs mt-1">
              {error.message}
            </p>
          )}
        </div>
      )}
    />
  );
};
