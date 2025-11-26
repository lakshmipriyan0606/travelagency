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
}

export const PhoneInputField = ({
  control,
  name,
  label,
  required = false,
  mainContainerClassName,
  labelClassName,
}: PhoneInputFieldProps) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={required ? { required: `${label} is required` } : {}}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className={cn("mb-6 relative", mainContainerClassName)}>
          <PhoneInput
            international
            countryCallingCodeEditable={false}
            defaultCountry="IN"
            value={value as string}
            onChange={onChange}
            placeholder=" "
            className={cn(
              `peer w-full pt-6 pb-2 px-3
               border border-gray-300 rounded-md
               bg-white
               focus:outline-none focus:ring-1 focus:ring-yellow-50/1
               focus:border-primary
               transition-all duration-300 font-roboto`,

              error &&
                "border-red-500 focus:border-red-500/2 focus:ring-red-500"
            )}
          />

          {label && (
            <label
              className={cn(
                `absolute left-3 bg-white px-1
                 text-gray-300 pointer-events-none
                 transition-all duration-300 ease-out

                 top-1/2 -translate-y-1/2 text-[15px] text-gray-500

                 peer-focus:top-0
                 peer-focus:-translate-y-1/2
                 peer-focus:text-xs
                 peer-focus:text-primary

                 peer-[&:not(:placeholder-shown)]:top-0
                 peer-[&:not(:placeholder-shown)]:-translate-y-1/2
                 peer-[&:not(:placeholder-shown)]:text-xs
                 peer-[&:not(:placeholder-shown)]:text-gray-500
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
      )}
    />
  );
};
