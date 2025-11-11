import { Controller, Control } from 'react-hook-form';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  required?: boolean;
}

export const DatePickerField = ({ control, name, label, required = false }: DatePickerFieldProps) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={required ? { required: `${label} is required` } : {}}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <DatePicker
            selected={value ? new Date(value) : null}
            onChange={(date) => onChange(date)}
            dateFormat="dd/MM/yyyy"
            minDate={new Date()}
            placeholderText="Select date"
            className={`w-full font-roboto px-4 py-2 border rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
        </div>
      )}
    />
  );
};