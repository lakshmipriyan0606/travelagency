import { Button } from "@travelagency/ui";
import { cn } from "@travelagency/utils";

type PrimaryOutlineButtonProps = {
  buttonName: string;
  animated?: boolean;
  className?: string;
};

const PrimaryOutlineButton = ({
  buttonName,
  animated = false,
  className,
}: PrimaryOutlineButtonProps) => {
  return (
    <Button
      className={cn(
        "relative overflow-hidden bg-transparent border border-primary text-primary hover:bg-primary hover:text-white rounded px-4 py-2 text-sm font-normal cursor-pointer transition-all duration-300",
        className
      )}
    >
      {/* Button Text */}
      <span className="relative z-10">{buttonName}</span>

      {/* ✅ Full Shimmer Layer */}
      {animated && (
        <span
          className={cn(
            "pointer-events-none absolute inset-0",
            "w-full h-full",
            "bg-gradient-to-r from-transparent via-white/25 to-transparent",
            "animate-shimmer-slide"
          )}
        />
      )}
    </Button>
  );
};

export default PrimaryOutlineButton;

