import { Controller, Control } from "react-hook-form"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DatePickerFieldProps {
  control: Control<any>
  name: string
  label: string
  required?: boolean
}

export const DatePickerField = ({
  control,
  name,
  label,
  required = false,
}: DatePickerFieldProps) => {
  return (
    <Controller
      control={control}
      name={name}
      rules={required ? { required: `${label} is required` } : {}}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <div className="mb-4 flex flex-col gap-1 font-roboto">

          <label className="text-sm font-medium text-gray-700">
            {label} {required && <span className="text-red-500">*</span>}
          </label>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full justify-between text-left font-normal px-4 border-gray-300 cursor-pointer",
                  !value && "text-muted-foreground",
                  error && "border-red-500"
                )}
              >
                <span className="flex justify-between w-full items-center gap-2">
                  {value
                    ? new Date(value).toLocaleDateString("en-GB") // dd/MM/yyyy
                    : "Select date"}
                    <CalendarIcon className="h-4 w-4 cursor-pointer" />
                </span>
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0 bg-white text-black font-roboto " align="start">
              <Calendar
                mode="single"
                selected={value}
                onSelect={onChange}
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
                captionLayout="dropdown"
                initialFocus
                className=""
              />
            </PopoverContent>
          </Popover>

          {error && (
            <p className="text-red-500 text-xs mt-1">
              {error.message}
            </p>
          )}

        </div>
      )}
    />
  )
}
