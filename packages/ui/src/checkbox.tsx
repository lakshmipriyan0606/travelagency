import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@travelagency/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer size-5 shrink-0 rounded-[6px] border border-white/25 bg-[var(--ent-surface,#101014)] shadow-xs outline-none transition-all duration-150",
        "hover:border-[#F8B400]/50",
        "focus-visible:border-[#F8B400] focus-visible:ring-[3px] focus-visible:ring-[#F8B400]/25",
        "data-[state=checked]:border-[#F8B400] data-[state=checked]:bg-[#F8B400] data-[state=checked]:text-[#0c0c0f] data-[state=checked]:shadow-[0_0_12px_rgba(248,180,0,0.35)]",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        <CheckIcon className="size-3.5 stroke-[3]" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
