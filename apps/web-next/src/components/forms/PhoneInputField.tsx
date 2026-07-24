import { Controller, Control } from "react-hook-form";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { cn } from "@/lib/utils";

interface PhoneInputFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  required?: boolean;
  mainContainerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
}

export const PhoneInputField = ({
  control,
  name,
  label,
  required = false,
  mainContainerClassName,
  labelClassName,
  inputClassName,
}: PhoneInputFieldProps) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={required ? { required: `${label} is required` } : {}}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className={cn("flex flex-col font-body", mainContainerClassName)}>
          {label && (
            <label className={cn("text-gray-600 text-[15px] font-semibold mb-[-4px]", labelClassName)}>
              {label}
              {required && <span className="text-red-500 ml-[2px]">*</span>}
            </label>
          )}

          <PhoneInput
            international
            countryCallingCodeEditable={false}
            defaultCountry="IN"
            value={value as string}
            onChange={onChange}
            placeholder=" "
            className={cn(
              "!border-none !ring-0 !shadow-none bg-transparent p-0 h-auto w-full",
              "focus:!outline-none focus:!ring-0 focus:!border-none",
              "transition-all duration-300 font-body text-sm",
              inputClassName,
              error ? "!text-red-500" : "text-gray-500",
            )}
          />

          {error && (
            <p className="mt-1 text-xs text-red-500">{error.message}</p>
          )}
        </div>
      )}
    />
  );
};
