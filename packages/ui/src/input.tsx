import * as React from "react";
import { cn } from "@travelagency/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, helperText, ...props }, ref) => {
    const field = (
      <input
        type={type}
        ref={ref}
        data-slot="input"
        className={cn(
          "h-12 w-full min-w-0 rounded-xl border border-white/[0.12] bg-[var(--ent-surface,#101014)] px-4 text-[16px] text-[var(--ent-text-main,#F4F4F5)] placeholder:text-zinc-500 transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-zinc-900 disabled:text-zinc-600",
          "hover:border-white/[0.18] focus:border-[#F8B400] focus:ring-[3px] focus:ring-[#F8B400]/22 focus:shadow-[0_0_18px_rgba(248,180,0,0.12)]",
          error && "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20",
          className
        )}
        {...props}
      />
    );

    if (!error && !helperText) {
      return field;
    }

    return (
      <div className="w-full flex flex-col gap-1.5">
        {field}
        {error ? (
          <p className="text-[14px] text-[#EF4444] font-medium">{error}</p>
        ) : (
          <p className="text-[14px] text-zinc-400">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
