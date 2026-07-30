"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@travelagency/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-[15px] font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FCAF16] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#FCAF16] text-[#09090B] font-bold hover:bg-[#E59A0F] shadow-[0_2px_12px_rgba(252,175,22,0.3)] hover:shadow-[0_4px_18px_rgba(252,175,22,0.4)] hover:-translate-y-0.5",
        primary:
          "bg-[#FCAF16] text-[#09090B] font-bold hover:bg-[#E59A0F] shadow-[0_2px_12px_rgba(252,175,22,0.3)] hover:shadow-[0_4px_18px_rgba(252,175,22,0.4)] hover:-translate-y-0.5",
        secondary:
          "bg-[#D97706] text-white font-semibold hover:bg-[#B45309] shadow-xs hover:-translate-y-0.5",
        outline:
          "border border-[#242427] bg-[#141417] text-[#F4F4F5] hover:bg-[#1B1B1F] hover:border-[#FCAF16]/40",
        destructive:
          "bg-[#EF4444] text-white hover:bg-[#DC2626] font-semibold shadow-xs hover:shadow-sm",
        danger:
          "bg-[#EF4444] text-white hover:bg-[#DC2626] font-semibold shadow-xs hover:shadow-sm",
        ghost: "hover:bg-white/[0.06] text-[#F4F4F5]",
        link: "text-[#FCAF16] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5 text-sm",
        lg: "h-12 rounded-xl px-7 text-base",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, isLoading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>{children}</span>
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
