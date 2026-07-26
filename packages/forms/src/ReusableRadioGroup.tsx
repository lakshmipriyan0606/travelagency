"use client";

import { Controller } from "react-hook-form";
import {
  RadioGroup,
  RadioGroupItem,
} from "@travelagency/ui";
import { Label } from "@travelagency/ui";

interface Option {
  value: string;
  label: string;
}

interface ReusableRadioGroupProps {
  control: any;
  name: string;
  label: string;
  options: Option[];
  className?: string;
  required?: boolean;
}

export const ReusableRadioGroup: React.FC<ReusableRadioGroupProps> = ({
  control,
  name,
  label,
  options,
  className = "",
  required = false,
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="font-medium text-gray-800">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <RadioGroup
            value={field.value}
            onValueChange={field.onChange}
            className="flex flex-col gap-2"
          >
            {options.map((opt) => (
              <div key={opt.value} className="flex items-center space-x-2">
                <RadioGroupItem value={opt.value} id={`${name}-${opt.value}`} />
                <Label
                  htmlFor={`${name}-${opt.value}`}
                  className="text-sm text-gray-700 cursor-pointer"
                >
                  {opt.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
      />
    </div>
  );
};
