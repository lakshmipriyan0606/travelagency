import * as React from "react";
import { cn } from "@travelagency/utils";
import { AirplaneLoader } from "./airplane-loader";

/**
 * Prefer AirplaneLoader for page/section loading.
 * Large full-width blocks auto-upgrade to the airplane loader.
 */
function Skeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  if (
    className?.includes("w-full") &&
    (className.includes("h-") || className.includes("min-h"))
  ) {
    return (
      <AirplaneLoader
        size="md"
        label="Loading…"
        className={cn("py-8")}
      />
    );
  }

  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-[var(--ent-elevated,#1c1c22)] animate-pulse rounded-md border border-white/[0.04]",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
