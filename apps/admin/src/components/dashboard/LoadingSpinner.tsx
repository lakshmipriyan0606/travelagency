import { AirplaneLoader } from "@travelagency/ui";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

/**
 * Admin loading indicator — airplane animation (no gray skeletons).
 */
export function LoadingSpinner({
  size = "md",
  className = "",
  label = "Loading…",
}: LoadingSpinnerProps) {
  return (
    <AirplaneLoader
      size={size}
      label={label}
      className={className}
      fullPage={size === "lg"}
    />
  );
}
