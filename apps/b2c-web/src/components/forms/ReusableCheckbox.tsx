"use client";

import { Controller } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ReusableCheckboxProps {
  control: any;
  name: string;
  label: string;
  description?: string;
  className?: string;
}

export const ReusableCheckbox: React.FC<ReusableCheckboxProps> = ({
  control,
  name,
  label,
  description,
  className = "",
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className={`flex items-start space-x-3 ${className}`}>
          <Checkbox
            id={name}
            checked={field.value || false}
            onCheckedChange={field.onChange}
          />
          <div className="leading-tight">
            <Label htmlFor={name} className="font-medium text-sm text-gray-800">
              {label}
            </Label>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
      )}
    />
  );
};
