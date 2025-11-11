import { Controller, Control } from 'react-hook-form';

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
  placeholder,
  required = false,
}: SelectFieldProps) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={required ? { required: `${label} is required` } : {}}
      render={({ field, fieldState: { error } }) => (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <select
            {...field}
            className={` font-roboto w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">{placeholder || 'Select'}</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
        </div>
      )}
    />
  );
};