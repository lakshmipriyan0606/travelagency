import { Controller, Control } from "react-hook-form"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import calendarIcon from "@/assets/icons/calendar.svg"
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
        <div className="mb-6 relative font-roboto">

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  `peer w-full pt-6 pb-2 px-3
                  border border-gray-300 rounded-md
                  bg-white
                  focus:outline-none focus:ring-1 focus:ring-blue-50/1
                  focus:border-blue-500
                  transition-all duration-300
                  justify-between text-left font-normal`,
                  !value && "text-transparent",
                  error && "border-red-500 focus:border-red-500/2 focus:ring-red-500"
                )}
              >
                <span className="absolute bottom-0 right-2 top-2">
                  {value
                    ? new Date(value).toLocaleDateString("en-GB") // dd/MM/yyyy
                    : " "}
                  <img src={calendarIcon} alt="" />
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
                 peer-focus:text-blue-600`,
                value && `top-0 -translate-y-1/2 text-xs text-blue-600`
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
  )
}
